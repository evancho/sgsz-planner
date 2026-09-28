import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACCOUNT_FILE_VERSION,
  addAccountFile,
  demoFill,
  moveAccount,
  emptyAccount,
  exportAccountPayload,
  exportPayload,
  normalizeAccountFile,
  normalizeState,
  replaceAccountFile,
} from '../js/logic.js';

function stateOf(accounts, activeAccountId = accounts[0].id) {
  return {
    app: 'sgsz-planner',
    backupVersion: 2,
    activeAccountId,
    accounts,
  };
}

test('a single-account file is distinct from a full backup and round-trips', () => {
  const account = demoFill(emptyAccount('acct-file', '槍司'));
  account.teams[0].members[0].bingshu = {
    branch: 'xushi',
    primary: 'houfa',
    secondary: ['miaosuan', 'guimou'],
  };
  const payload = exportAccountPayload(account, '1.2.3');
  assert.equal(payload.app, 'sgsz-planner');
  assert.equal(payload.kind, 'account');
  assert.equal(payload.accountVersion, ACCOUNT_FILE_VERSION);
  assert.equal(payload.accounts, undefined);
  assert.equal(payload.backupVersion, undefined);
  assert.equal(payload.account.name, '槍司');

  const again = normalizeAccountFile(JSON.parse(JSON.stringify(payload)));
  assert.equal(again.ok, true);
  assert.equal(again.account.owned.guanyu.red, 5);
  assert.equal(again.account.owned.guanyu.dynamic, true);
  assert.equal(again.account.owned.guanyu.awaken, true);
  assert.equal(again.account.tacticsOwned.bamen, true);
  assert.equal(again.account.teams[0].name, '桃園盾');
  assert.deepEqual(again.account.teams[0].members[0].bingshu.secondary, ['miaosuan', 'guimou']);
  assert.deepEqual(
    Object.keys(again.account).sort(),
    ['customTactics', 'id', 'name', 'owned', 'tacticsOwned', 'teams'],
  );

  const full = exportPayload(stateOf([account]), '1.2.3');
  assert.equal(Array.isArray(full.accounts), true);
  assert.equal(full.kind, undefined);
  const asAccount = normalizeAccountFile(full);
  assert.equal(asAccount.ok, false);
  assert.match(asAccount.error, /整包備份/);
  const asBackup = normalizeState(payload);
  assert.equal(asBackup.ok, false);
  assert.match(asBackup.error, /單帳號檔/);

  const dual = { ...payload, accounts: [account], backupVersion: 2 };
  assert.equal(normalizeAccountFile(dual).ok, false);
  assert.match(normalizeAccountFile(dual).error, /不是單帳號/);
  assert.match(normalizeState(dual).error, /單帳號檔/);
  assert.match(normalizeAccountFile({ app: 'sgsz-planner', kind: 'account', accountVersion: 2, account }).error, /版本不相容/);
});

test('adding a single account keeps the others and overwrite keeps the card id', () => {
  const first = demoFill(emptyAccount('acct-a', '甲'));
  const second = emptyAccount('acct-b', '乙');
  const state = stateOf([first, second]);
  const incoming = normalizeAccountFile(exportAccountPayload(demoFill(emptyAccount('acct-file', '外來')), '1.2.3'));
  assert.equal(incoming.ok, true);

  const added = addAccountFile(state, incoming.account);
  assert.equal(added.ok, true);
  assert.equal(added.state.accounts.length, 3);
  assert.equal(added.state.accounts[0].id, 'acct-a');
  assert.equal(added.state.accounts[0].name, '甲');
  assert.equal(added.state.accounts[1].id, 'acct-b');
  assert.equal(added.state.accounts[1].teams.length, 0);
  assert.notEqual(added.state.accounts[2].id, 'acct-file');
  assert.match(added.state.accounts[2].id, /^acct-/);
  assert.equal(added.state.accounts[2].name, '外來');
  assert.equal(added.state.accounts[2].teams[0].name, '桃園盾');
  assert.equal(added.state.activeAccountId, added.state.accounts[2].id);

  const replaced = replaceAccountFile(state, 'acct-b', incoming.account);
  assert.equal(replaced.ok, true);
  assert.equal(replaced.state.accounts.length, 2);
  assert.equal(replaced.state.accounts[0].name, '甲');
  assert.equal(replaced.state.accounts[0].teams[0].name, '桃園盾');
  assert.equal(replaced.state.accounts[1].id, 'acct-b');
  assert.equal(replaced.state.accounts[1].name, '外來');
  assert.equal(replaced.state.accounts[1].owned.guanyu.red, 5);
  assert.equal(replaced.state.activeAccountId, 'acct-a');
  assert.equal(replaceAccountFile(state, 'missing', incoming.account).ok, false);

  const full = Array.from({ length: 30 }, (_, index) => emptyAccount(`acct-${index}`, `帳號${index}`));
  const blocked = addAccountFile(stateOf(full), incoming.account);
  assert.equal(blocked.ok, false);
  assert.match(blocked.error, /帳號數量過多/);
});

test('a new season can keep generals and tactics without teams', () => {
  const source = demoFill(emptyAccount('acct-a', '上季'));
  const other = emptyAccount('acct-b', '旁帳');
  other.teams = [{ id: 'team-b', name: '旁隊', notes: '', members: [null, null, null] }];
  const state = stateOf([source, other]);
  const file = exportAccountPayload(source, '1.2.3', { omitTeams: true });
  assert.equal(file.kind, 'account');
  assert.equal(file.account.teams.length, 0);
  assert.equal(file.account.owned.guanyu.red, 5);
  assert.equal(file.account.tacticsOwned.bamen, true);
  assert.equal(exportPayload(state, '1.2.3').accounts[0].teams[0].name, '桃園盾');

  const parsed = normalizeAccountFile(file);
  assert.equal(parsed.ok, true);
  const added = addAccountFile(state, parsed.account, { omitTeams: true });
  assert.equal(added.state.accounts[2].owned.guanyu.red, 5);
  assert.equal(added.state.accounts[2].tacticsOwned.bamen, true);
  assert.equal(added.state.accounts[2].teams.length, 0);
  assert.equal(added.state.accounts[0].teams[0].name, '桃園盾');
  assert.equal(added.state.accounts[1].teams[0].name, '旁隊');

  const kept = addAccountFile(state, normalizeAccountFile(exportAccountPayload(source, '1.2.3')).account);
  assert.equal(kept.state.accounts[2].teams[0].name, '桃園盾');
});

test('account cards keep season import without a clear-teams button', () => {
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const logic = readFileSync(new URL('../js/logic.js', import.meta.url), 'utf8');
  assert.equal(app.includes('清空隊伍'), false);
  assert.equal(app.includes('ask-clear-teams'), false);
  assert.equal(logic.includes('clearAccountTeams'), false);
  assert.equal(app.includes('新增為新帳號，不含隊伍'), true);
  assert.equal(app.includes('不含隊伍'), true);
  assert.match(app, /class="account-side"/);
  assert.match(app, /account-side[\s\S]*member-move[\s\S]*active-pill/);
});

test('account list order moves with the arrows and survives a backup', () => {
  const accounts = [
    emptyAccount('acct-a', '甲'),
    emptyAccount('acct-b', '乙'),
    emptyAccount('acct-c', '丙'),
  ];
  const state = stateOf(accounts, 'acct-b');
  assert.equal(moveAccount(accounts, 'acct-a', -1), accounts);
  assert.equal(moveAccount(accounts, 'acct-c', 1), accounts);
  const moved = moveAccount(accounts, 'acct-a', 1);
  assert.deepEqual(moved.map((item) => item.id), ['acct-b', 'acct-a', 'acct-c']);
  const payload = exportPayload({ ...state, accounts: moved }, '1.2.3');
  const restored = normalizeState(payload);
  assert.equal(restored.ok, true);
  assert.deepEqual(restored.state.accounts.map((item) => item.name), ['乙', '甲', '丙']);
  assert.equal(restored.state.activeAccountId, 'acct-b');
  const single = exportAccountPayload(moved[1], '1.2.3');
  assert.equal(single.account.name, '甲');
  assert.equal(single.accounts, undefined);
});

test('hostile account json is data and does not run', () => {
  const text = JSON.stringify({
    app: 'sgsz-planner',
    kind: 'account',
    accountVersion: 1,
    account: {
      id: 'acct-1',
      name: '<script>throw 1</script>',
      owned: {},
      tacticsOwned: {},
      customTactics: [],
      teams: [],
      run: 'alert(1)',
    },
  });
  const parsed = JSON.parse(text);
  parsed.account['__proto__'] = { polluted: true };
  const result = normalizeAccountFile(parsed);
  assert.equal(result.ok, true);
  assert.equal(result.account.name, '<script>throw 1</script>');
  assert.equal(result.account.run, undefined);
  assert.equal({}.polluted, undefined);
  assert.equal(normalizeState(JSON.parse(text)).ok, false);
});
