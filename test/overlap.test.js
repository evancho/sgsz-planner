import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APP_ID,
  BACKUP_VERSION,
  applyTeamShare,
  buildUsage,
  dropUsedTactics,
  emptyAccount,
  generalOverlaps,
  normalizeState,
  overlapBlockText,
  tacticConflictLine,
  tacticDropText,
} from '../js/logic.js';

const generals = new Map([
  ['caocao', { id: 'caocao', name: '曹操', nameKey: '曹操' }],
  ['caocao-sp', { id: 'caocao-sp', name: 'SP曹操', nameKey: '曹操' }],
  ['liubei', { id: 'liubei', name: '劉備', nameKey: '劉備' }],
]);

function accountWithCaocao() {
  const account = emptyAccount('acct-a', '主帳');
  account.teams = [{
    id: 'team-old',
    name: '舊魏騎',
    notes: '',
    members: [{ generalId: 'caocao', learned: ['fengshi', null], bingshu: null }, null, null],
  }];
  return account;
}

test('the same general or the same name blocks a new team', () => {
  const account = accountWithCaocao();
  const same = generalOverlaps(account, [{ generalId: 'caocao', generalName: '曹操' }], generals);
  assert.equal(same.length, 1);
  assert.equal(same[0].teamName, '舊魏騎');
  const named = generalOverlaps(account, [{ generalId: 'caocao-sp' }], generals);
  assert.equal(named[0].name, 'SP曹操');
  assert.equal(generalOverlaps(account, [{ generalId: 'liubei' }], generals).length, 0);
  assert.match(overlapBlockText(same), /曹操已在「舊魏騎」/);
});

test('a tactic already on another team is dropped from the incoming team', () => {
  const account = accountWithCaocao();
  const tactics = new Map([
    ['fengshi', { id: 'fengshi', name: '鋒矢陣', copies: 1 }],
    ['qianli', { id: 'qianli', name: '千里走單騎', copies: 1 }],
  ]);
  const incoming = [{ generalId: 'liubei', learned: ['fengshi', 'qianli'], bingshu: null }, null, null];
  const result = dropUsedTactics(incoming, buildUsage(account), tactics);
  assert.deepEqual(result.members[0].learned, [null, 'qianli']);
  assert.deepEqual(result.members[0].vacated, ['鋒矢陣', null]);
  assert.equal(result.dropped[0].name, '鋒矢陣');
  assert.equal(tacticDropText(result.dropped), '戰法 鋒矢陣 已在其他隊伍，已從新隊伍移除。');
  assert.equal(tacticConflictLine(result.dropped), '戰法 鋒矢陣 已在其他隊伍');
  assert.equal(tacticConflictLine([]), '');
  assert.equal(account.teams[0].members[0].learned[0], 'fengshi');
  assert.equal(incoming[0].learned[0], 'fengshi');
});

test('substitute is stored on the loaded team and survives backup', () => {
  const account = emptyAccount('acct-a', '主帳');
  const share = {
    name: '新隊',
    members: [
      { generalId: 'liubei', learned: [null, null], bingshu: null, red: 0, dynamic: false, awaken: false },
      null,
      null,
    ],
  };
  const applied = applyTeamShare(account, share, 'team-new', { substitute: true });
  assert.equal(applied.ok, true);
  assert.equal(applied.account.teams[0].substitute, true);
  const round = normalizeState({
    app: APP_ID,
    backupVersion: BACKUP_VERSION,
    activeAccountId: 'acct-a',
    accounts: [applied.account],
  });
  assert.equal(round.ok, true);
  assert.equal(round.state.accounts[0].teams[0].substitute, true);
  const plain = applyTeamShare(account, share, 'team-plain');
  assert.equal(plain.account.teams[0].substitute, false);
});
