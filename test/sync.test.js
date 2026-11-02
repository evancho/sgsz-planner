import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  APP_ID,
  BACKUP_VERSION,
  backupUpdatedAt,
  emptyAccount,
  exportPayload,
  freshState,
  normalizeState,
  pickNewerBackup,
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
