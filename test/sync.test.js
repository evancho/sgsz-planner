import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  APP_ID,
  BACKUP_VERSION,
  backupUpdatedAt,
  emptyAccount,
  exportPayload,
  freshState,
  isSparseBackup,
  normalizeState,
  pickNewerBackup,
  pickSyncBackup,
  backupsDiffer,
  backupFingerprint,
  syncMergeDecision,
  archiveBackupFileName,
  touchUpdatedAt,
} from '../js/logic.js';

test('freshState and exportPayload carry updatedAt', () => {
  const state = freshState();
  assert.match(state.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  const payload = exportPayload(state, '1.2.3');
  assert.equal(payload.updatedAt, state.updatedAt);
  assert.match(payload.exportedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('normalizeState keeps updatedAt and falls back to exportedAt', () => {
  const account = emptyAccount('acct-1', '主帳');
  const withUpdated = normalizeState({
    app: APP_ID,
    backupVersion: BACKUP_VERSION,
    updatedAt: '2026-11-01T10:00:00.000Z',
    exportedAt: '2026-11-01T09:00:00.000Z',
    activeAccountId: account.id,
    accounts: [account],
  });
  assert.equal(withUpdated.ok, true);
  assert.equal(withUpdated.state.updatedAt, '2026-11-01T10:00:00.000Z');

  const legacy = normalizeState({
    app: APP_ID,
    backupVersion: 1,
    exportedAt: '2026-10-01T08:00:00.000Z',
    activeAccountId: account.id,
    accounts: [account],
  });
  assert.equal(legacy.ok, true);
  assert.equal(legacy.state.updatedAt, '2026-10-01T08:00:00.000Z');

  const bare = normalizeState({
    app: APP_ID,
    backupVersion: BACKUP_VERSION,
    activeAccountId: account.id,
    accounts: [account],
  });
  assert.equal(bare.ok, true);
  assert.equal(bare.state.updatedAt, '');
  assert.equal(pickNewerBackup(bare.state, {
    updatedAt: '2026-11-01T10:00:00.000Z',
  }).choice, 'remote');
});

test('backupUpdatedAt prefers updatedAt over exportedAt', () => {
  assert.equal(
    backupUpdatedAt({ updatedAt: '2026-11-02T12:00:00.000Z', exportedAt: '2026-11-01T12:00:00.000Z' }),
    Date.parse('2026-11-02T12:00:00.000Z'),
  );
  assert.equal(backupUpdatedAt({ exportedAt: '2026-11-01T12:00:00.000Z' }), Date.parse('2026-11-01T12:00:00.000Z'));
  assert.equal(backupUpdatedAt({}), 0);
  assert.equal(backupUpdatedAt(null), 0);
});

test('pickNewerBackup is last-write-wins', () => {
  const older = { updatedAt: '2026-11-01T10:00:00.000Z' };
  const newer = { updatedAt: '2026-11-02T10:00:00.000Z' };
  assert.equal(pickNewerBackup(older, newer).choice, 'remote');
  assert.equal(pickNewerBackup(newer, older).choice, 'local');
  assert.equal(pickNewerBackup(newer, { ...newer }).choice, 'equal');
  assert.equal(pickNewerBackup(newer, { exportedAt: '2026-11-02T10:00:00.000Z' }).choice, 'equal');
});

test('touchUpdatedAt bumps the stamp', () => {
  const state = freshState();
  const later = new Date('2026-11-02T15:00:00.000Z');
  const next = touchUpdatedAt(state, later);
  assert.equal(next.updatedAt, '2026-11-02T15:00:00.000Z');
  assert.notEqual(next.updatedAt, state.updatedAt);
});

test('pickSyncBackup never lets an empty install wipe a filled backup', () => {
  const filled = {
    updatedAt: '2026-11-01T10:00:00.000Z',
    accounts: [{
      id: 'acct-1',
      name: '主帳',
      owned: { guanyu: { red: 5, dynamic: false, awaken: false } },
      tacticsOwned: { bamen: true },
      customTactics: [],
      teams: [],
    }],
  };
  const emptyNewer = {
    updatedAt: '2026-11-02T12:00:00.000Z',
    accounts: [{
      id: 'acct-2',
      name: '主帳',
      owned: {},
      tacticsOwned: {},
      customTactics: [],
      teams: [],
    }],
  };
  assert.equal(isSparseBackup(emptyNewer), true);
  assert.equal(isSparseBackup(filled), false);
  assert.equal(pickNewerBackup(emptyNewer, filled).choice, 'local');
  const guarded = pickSyncBackup(emptyNewer, filled);
  assert.equal(guarded.choice, 'remote');
  assert.equal(guarded.protected, 'local-sparse');
  assert.equal(pickSyncBackup(filled, emptyNewer).choice, 'local');
  assert.equal(pickSyncBackup(filled, emptyNewer).protected, 'remote-sparse');
});

test('backupsDiffer detects content changes and archive names are safe', () => {
  const a = {
    updatedAt: '2026-11-02T10:00:00.000Z',
    accounts: [{ id: 'a', owned: { guanyu: { red: 1 } }, tacticsOwned: {}, customTactics: [], teams: [] }],
  };
  const b = {
    updatedAt: '2026-11-02T10:00:00.000Z',
    accounts: [{ id: 'a', owned: {}, tacticsOwned: {}, customTactics: [], teams: [] }],
  };
  assert.equal(backupsDiffer(a, a), false);
  assert.equal(backupsDiffer(a, b), true);
  assert.match(archiveBackupFileName(new Date('2026-11-02T10:00:00.000Z'), 'remote'), /^sgsz-planner-archive-remote-2026-11-02T/);
});

test('ordinary local edits push quietly; only both-changed asks', () => {
  const synced = {
    updatedAt: '2026-11-09T04:17:00.000Z',
    accounts: [{ id: 'a', owned: { guanyu: { red: 1 } }, tacticsOwned: {}, customTactics: [], teams: [] }],
  };
  const baseline = backupFingerprint(synced);
  const editedLocal = {
    updatedAt: '2026-11-09T04:20:00.000Z',
    accounts: [{ id: 'a', owned: { guanyu: { red: 2 } }, tacticsOwned: {}, customTactics: [], teams: [] }],
  };
  assert.equal(syncMergeDecision(editedLocal, synced, baseline, { quiet: true }), 'push-local');
  assert.equal(syncMergeDecision(editedLocal, synced, baseline, { quiet: false }), 'push-local');

  const newerRemote = {
    updatedAt: '2026-11-09T04:21:00.000Z',
    accounts: [{ id: 'a', owned: { guanyu: { red: 1 } }, tacticsOwned: { bamen: true }, customTactics: [], teams: [] }],
  };
  assert.equal(syncMergeDecision(synced, newerRemote, baseline, { quiet: true }), 'pull-remote');

  const bothChangedRemote = {
    updatedAt: '2026-11-09T04:19:00.000Z',
    accounts: [{ id: 'a', owned: { guanyu: { red: 1 } }, tacticsOwned: { bamen: true }, customTactics: [], teams: [] }],
  };
  assert.equal(syncMergeDecision(editedLocal, bothChangedRemote, baseline, { quiet: false }), 'ask');
  assert.equal(syncMergeDecision(editedLocal, bothChangedRemote, baseline, { quiet: true }), 'push-local');

  assert.equal(syncMergeDecision(editedLocal, synced, '', { quiet: true }), 'push-local');
  assert.equal(syncMergeDecision(synced, synced, baseline), 'equal');
});
