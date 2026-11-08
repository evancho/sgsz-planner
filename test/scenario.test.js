import assert from 'node:assert/strict';
import test from 'node:test';
import {
  coexistenceLines,
  effectiveApt,
  emptyAccount,
  exportAccountPayload,
  fitsScenario,
  matchesGeneral,
  meritWarningLines,
  normalizeAccountFile,
  normalizeRecommended,
  normalizeState,
  teamFromRecommended,
} from '../js/logic.js';

const xunbing = {
  id: 'xunbing',
  name: '訓兵振旅',
  scenarios: ['hanyan'],
  review: '待核',
  excludes: [],
  limits: { account: 2, team: 1 },
  effect: { kind: 'apt', letter: 'S', troops: null, skipTags: ['仙人'] },
};

test('old backups without a scenario become 英雄命世 and keep owned tactics', () => {
  const restored = normalizeState({
    app: 'sgsz-planner',
    backupVersion: 2,
    accounts: [{ id: 'acct-old', name: '舊帳', owned: { guanyu: { red: 1 } }, tacticsOwned: { luli: true } }],
  });
  assert.equal(restored.ok, true);
  assert.equal(restored.state.accounts[0].scenario, 'yingxiong');
  assert.equal(restored.state.accounts[0].tacticsOwned.luli, true);
  const payload = exportAccountPayload(restored.state.accounts[0], '1.2.34');
  assert.equal(payload.account.scenario, 'yingxiong');
  const again = normalizeAccountFile(payload);
  assert.equal(again.account.scenario, 'yingxiong');
});

test('unmarked tactics fit every scenario and marked ones use the array', () => {
  assert.equal(fitsScenario({ name: '麾軍結陣' }, 'hanyan'), true);
  assert.equal(fitsScenario({ scenarios: ['yingxiong'] }, 'yingxiong'), true);
  assert.equal(fitsScenario({ scenarios: ['yingxiong'] }, 'hanyan'), false);
  assert.equal(fitsScenario({ scenarios: ['yingxiong', 'hanyan'] }, 'hanyan'), true);
});

test('漢 camp override round-trips and is not scenario limited', () => {
  const restored = normalizeState({
    app: 'sgsz-planner',
    backupVersion: 2,
    accounts: [{ id: 'acct-han', name: '漢帳', camps: { guanyu: '漢', bad: '魏' } }],
  });
  assert.deepEqual(restored.state.accounts[0].camps, { guanyu: '漢' });
});

test('訓兵振旅 makes non-仙人 aptitudes S and warns past the limits', () => {
  const general = { id: 'daqiao', name: '大喬', apt: { 騎: 'C', 盾: 'C', 弓: 'B', 槍: 'C', 器械: 'C' }, tags: [] };
  const immortal = { id: 'xian', name: '仙人', apt: { 騎: 'C', 盾: 'C', 弓: 'C', 槍: 'C', 器械: 'C' }, tags: ['仙人'] };
  const owned = { red: 0, dynamic: false, awaken: false, merits: ['xunbing'] };
  assert.equal(effectiveApt(general, owned, [xunbing]).騎, 'S');
  assert.equal(effectiveApt(immortal, owned, [xunbing]).騎, 'C');
  assert.equal(matchesGeneral(general, owned, { troop: ['騎'] }, { apt: effectiveApt(general, owned, [xunbing]) }), true);
  assert.equal(matchesGeneral(general, { red: 0 }, { troop: ['騎'] }, {}), false);
  const account = emptyAccount('acct-m', '漢焰', 'hanyan');
  account.owned = {
    a: { red: 0, dynamic: false, awaken: false, merits: ['xunbing'] },
    b: { red: 0, dynamic: false, awaken: false, merits: ['xunbing'] },
    c: { red: 0, dynamic: false, awaken: false, merits: ['xunbing'] },
  };
  account.teams = [{
    id: 'team-1',
    name: '同隊',
    members: [{ generalId: 'a' }, { generalId: 'b' }, null],
  }];
  const lines = meritWarningLines(account, [xunbing], (id) => id);
  assert.equal(lines.some((line) => line.includes('最多 2 名')), true);
  assert.equal(lines.some((line) => line.includes('一隊最多 1 名')), true);
});

test('mutually exclusive merits warn without needing treasure rows', () => {
  const xiwu = { ...xunbing, id: 'xiwu', name: '習武扶漢', excludes: ['xunbing'] };
  const marked = { ...xunbing, excludes: ['xiwu'] };
  const account = emptyAccount('acct-x', '互斥', 'hanyan');
  account.owned = { a: { red: 0, dynamic: false, awaken: false, merits: ['xunbing', 'xiwu'] } };
  const lines = meritWarningLines(account, [marked, xiwu], () => '關羽');
  assert.equal(lines.some((line) => line.includes('不能同時標')), true);
});

test('recommended teams keep strategy, trick order, empty tactics and source', () => {
  const [team] = normalizeRecommended([{
    id: 'hanyan-demo',
    scenario: 'hanyan',
    title: '示例',
    review: '待核',
    strategy: ['整軍'],
    tricks: ['甲', '乙'],
    source: 'https://sgsdeck.com/recommended/example',
    members: [{
      generalId: 'sp-luzhi',
      generalName: 'SP盧植',
      learned: ['yanxing', null],
      learnedNames: ['雁行陣', '桃園結義'],
      bingshu: { branch: 'shiji', primary: 'sanjun', secondary: ['jiuzhan', 'tongjun'] },
    }],
  }]);
  assert.deepEqual(team.strategy, ['整軍']);
  assert.equal(team.status, '待核');
  assert.deepEqual(team.tricks, ['甲', '乙', '', '', '']);
  assert.equal(team.members[0].learned[1], null);
  assert.equal(team.members[0].learnedNames[1], '桃園結義');
  const built = teamFromRecommended(team, 'team-1');
  assert.deepEqual(built.strategy, ['整軍']);
  assert.equal(built.members[0].learned[1], null);
  assert.equal(built.members[0].vacated[1], '桃園結義');
  assert.equal(built.members[0].bingshu.primary, 'sanjun');
  assert.match(built.notes, /sgsdeck/);
});

test('player teams keep unbound tricks, apply flag, author and per-team status', () => {
  const [ready, held] = normalizeRecommended([
    {
      id: 'baha-ready',
      scenario: 'hanyan',
      title: '已核隊',
      status: '已核',
      origin: 'bahamut',
      applyReady: true,
      tricksBound: false,
      author: '作者甲',
      authorAccount: 'acct',
      source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=1',
      tricks: ['甲', '乙', '丙', '丁', '戊', '己'],
      members: [{ generalName: '40呂', tacticsRaw: '藏器、血刃', learned: [null, null], learnedNames: [] }],
    },
    {
      id: 'baha-held',
      scenario: 'hanyan',
      title: '待核隊',
      status: '待核',
      origin: 'bahamut',
      applyReady: false,
      note: '同隊重複戰法',
      members: [{ generalId: 'jiaxu', generalName: '賈詡', learned: [null, null], learnedNames: [] }],
    },
  ]);
  assert.equal(ready.status, '已核');
  assert.equal(held.status, '待核');
  assert.equal(ready.originLabel, '巴哈玩家版');
  assert.equal(ready.authorAccount, 'acct');
  assert.equal(ready.tricks.length, 6);
  assert.equal(ready.tricksBound, false);
  assert.equal(held.applyReady, false);
  assert.equal(held.note, '同隊重複戰法');
  assert.equal(ready.members[0].tacticsRaw, '藏器、血刃');
});

test('大米隊伍自成來源，斜線替代不進裝備槽，劇本限定另標', () => {
  const [team] = normalizeRecommended([{
    id: 'dami-demo',
    scenario: 'hanyan',
    title: '蜀智盾',
    status: '待核',
    origin: 'dami',
    applyReady: false,
    scenarioOnly: true,
    author: '三國志黑暗大米',
    source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=6536',
    note: '使用者提供截圖；作者巴哈頁聯絡方式吻合，漢焰版原帖與伺服器區域未確認',
    members: [{
      generalId: 'madai',
      generalName: '馬岱',
      learned: ['yulin', 'feigong'],
      learnedNames: ['魚鱗陣', '非攻制勝'],
      remark: '第二戰法可換藤甲兵',
    }],
  }]);
  assert.equal(team.origin, 'dami');
  assert.equal(team.originLabel, '大米團隊（截圖）');
  assert.equal(team.scenarioOnly, true);
  assert.equal(team.applyReady, false);
  assert.equal(team.members[0].learned.includes('tengjia'), false);
});

test('the same tactic on two teams warns, and a variant does not count as the original', () => {
  const account = emptyAccount('acct-c', '衝突');
  account.teams = [
    { id: 'a', name: '甲隊', members: [{ generalId: 'guanyu', learned: ['caochuan', null] }] },
    { id: 'b', name: '乙隊', members: [{ generalId: 'guanyu', learned: ['tuo-caochuan', null] }] },
    { id: 'c', name: '丙隊', members: [{ generalId: 'zhangfei', learned: ['caochuan', null] }] },
  ];
  const lines = coexistenceLines(account, {
    general: (id) => id,
    tactic: (id) => id,
    nameKey: (id) => id,
  });
  assert.equal(lines.some((line) => line.includes('caochuan') && line.includes('甲隊') && line.includes('丙隊')), true);
  assert.equal(lines.some((line) => line.includes('tuo-caochuan') && line.includes('丙隊')), false);
  assert.equal(lines.some((line) => line.includes('guanyu') && line.includes('甲隊') && line.includes('乙隊')), true);
});
