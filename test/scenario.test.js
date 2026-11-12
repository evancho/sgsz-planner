import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyCampOverride,
  campOverrideCounts,
  coexistenceLines,
  effectiveApt,
  emptyAccount,
  exportAccountPayload,
  fitsScenario,
  generalListed,
  scenarioHidesDuwei,
  duweiBlockedMessage,
  matchesGeneral,
  meritWarningLines,
  nextCampOverride,
  normalizeAccountFile,
  normalizeCamps,
  normalizeRecommended,
  normalizeScenario,
  normalizeState,
  SCENARIOS,
  presentCamp,
  recommendedFromAlternative,
  resolveBingshuRaw,
  teamCountry,
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


test('兵演春秋 is a first-class scenario and does not inherit 漢焰 limits', () => {
  assert.deepEqual(SCENARIOS.map((row) => row.id), ['regular', 'yingxiong', 'bingyan', 'hanyan']);
  assert.equal(normalizeScenario('兵演春秋'), 'bingyan');
  assert.equal(fitsScenario({ name: '麾軍結陣' }, 'bingyan'), true);
  assert.equal(fitsScenario({ scenarios: ['bingyan'] }, 'bingyan'), true);
  assert.equal(fitsScenario({ scenarios: ['bingyan'] }, 'yingxiong'), false);
  assert.equal(fitsScenario({ scenarios: ['yingxiong'] }, 'bingyan'), false);
  const teams = normalizeRecommended([
    { id: 'bingyan-demo', scenario: 'bingyan', title: '示範', status: '待核', rank: 'T0', rankStatus: '待核', origin: 'sgsdeck', originLabel: 'sgsdeck', source: 'https://sgsdeck.com/recommended/example', members: [
      { generalId: 'lvbu', generalName: '呂布', learned: ['wangong', null], learnedNames: ['彎弓飲羽', '破甲'], points: '武力', unlisted: ['破甲'] },
      { generalId: 'guojia', generalName: '郭嘉', learned: ['sanshi'], learnedNames: ['三勢陣'] },
      { generalId: 'wushuang-xiaoqiao', generalName: '無雙小喬', learned: ['wenwu'], learnedNames: ['文武雙全'] },
    ] },
  ]);
  assert.equal(teams[0].scenario, 'bingyan');
  assert.equal(teams[0].origin, 'sgsdeck');
  assert.equal(teams[0].status, '待核');
  assert.equal(teams[0].members[0].points, '武力');
  assert.deepEqual(teams[0].members[0].unlisted, ['破甲']);
});


test('兵演春秋沿用漢室轉換與漢焰傳承事件，並與漢焰同樣排除都尉、不收漢焰劇本戰法', () => {
  const convert = { max: 3, toHan: ['caocao', 'lvbu'], status: '已核' };
  const cao = { id: 'caocao', name: '曹操', camp: '魏' };
  const diao = { id: 'diaochan', name: '貂蟬', camp: '漢' };
  const catalog = new Map([cao, diao].map((row) => [row.id, row]));
  assert.equal(nextCampOverride(cao, {}, convert, catalog).show, true);
  assert.equal(nextCampOverride(cao, {}, convert, catalog).label, '轉漢');
  assert.equal(nextCampOverride(diao, {}, convert, catalog).show, true);
  assert.equal(nextCampOverride(diao, {}, convert, catalog).label, '轉群');
  assert.equal(fitsScenario({ name: '藏器待時' }, 'bingyan'), true);
  assert.equal(fitsScenario({ name: '桃園結義' }, 'bingyan'), true);
  assert.equal(fitsScenario({ scenarios: ['hanyan'] }, 'bingyan'), false);
  assert.equal(generalListed({ id: 'sp-caocao', name: 'SP曹操', camp: '漢' }, 'bingyan'), true);
  const duwei = { id: 'duwei-shenheng', name: '沈姮', tags: ['都尉'] };
  assert.equal(scenarioHidesDuwei('bingyan'), true);
  assert.equal(scenarioHidesDuwei('hanyan'), true);
  assert.equal(scenarioHidesDuwei('yingxiong'), false);
  assert.equal(scenarioHidesDuwei('regular'), false);
  assert.equal(duweiBlockedMessage('bingyan'), '兵演春秋不能使用都尉');
  assert.equal(duweiBlockedMessage('hanyan'), '漢焰長明不能使用都尉');
  assert.equal(generalListed(duwei, 'bingyan'), false);
  assert.equal(generalListed(duwei, 'hanyan'), false);
  assert.equal(generalListed(duwei, 'yingxiong'), true);
  assert.equal(generalListed(duwei, 'regular'), true);
  assert.equal(generalListed(duwei, 'bingyan', { showAll: true }), false);
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
    accounts: [{ id: 'acct-han', name: '漢帳', camps: { guanyu: '漢', diaochan: '群', bad: '魏' } }],
  });
  assert.deepEqual(restored.state.accounts[0].camps, { guanyu: '漢', diaochan: '群' });
});

test('群轉漢與漢轉群最多三名且方向互斥', () => {
  const convert = { max: 3, toHan: ['caocao', 'lvbu', 'jiaxu', 'sunjian'] };
  const cao = { id: 'caocao', name: '曹操', camp: '魏' };
  const lv = { id: 'lvbu', name: '呂布', camp: '群' };
  const jx = { id: 'jiaxu', name: '賈詡', camp: '魏' };
  const diao = { id: 'diaochan', name: '貂蟬', camp: '漢' };
  const luzhi = { id: 'sp-luzhi', name: 'SP盧植', camp: '漢' };
  const spcao = { id: 'sp-caocao', name: 'SP曹操', camp: '漢' };
  const sunjian = { id: 'sunjian', name: '孫堅', camp: '吳' };
  const y40 = { id: 'y40-lvbu', name: '40Y呂布', camp: '漢' };
  const catalog = new Map([cao, lv, jx, diao, luzhi, spcao, sunjian, y40].map((row) => [row.id, row]));
  assert.equal(nextCampOverride(cao, {}, convert, catalog).label, '轉漢');
  assert.equal(nextCampOverride(diao, {}, convert, catalog).label, '轉群');
  assert.deepEqual(presentCamp(cao, { caocao: '漢' }), { ...cao, camp: '漢', campOrigin: '魏' });
  assert.deepEqual(presentCamp(diao, { diaochan: '群' }), { ...diao, camp: '群', campOrigin: '漢' });
  let camps = applyCampOverride({}, 'caocao', '漢');
  camps = applyCampOverride(camps, 'lvbu', '漢');
  camps = applyCampOverride(camps, 'jiaxu', '漢');
  assert.deepEqual(campOverrideCounts(camps, catalog), { toHan: 3, toQun: 0 });
  assert.equal(nextCampOverride(cao, camps, convert, catalog).label, '恢復魏');
  assert.match(nextCampOverride(sunjian, camps, convert, catalog).reason, /最多 3/);
  assert.match(nextCampOverride(diao, camps, convert, catalog).reason, /不能同時轉群/);
  camps = applyCampOverride({}, 'diaochan', '群');
  camps = applyCampOverride(camps, 'sp-luzhi', '群');
  camps = applyCampOverride(camps, 'sp-caocao', '群');
  assert.deepEqual(campOverrideCounts(camps, catalog), { toHan: 0, toQun: 3 });
  assert.match(nextCampOverride(cao, camps, convert, catalog).reason, /不能同時轉漢/);
  assert.match(nextCampOverride(y40, camps, convert, catalog).reason, /最多 3/);
  assert.equal(nextCampOverride(luzhi, camps, convert, catalog).label, '恢復漢');
  assert.equal(nextCampOverride(spcao, camps, convert, catalog).show, true);
});

test('舊 camps 與圖鑑相同或未知 ID 不佔轉換名額且不刪資料', () => {
  const convert = { max: 3, toHan: ['gongsunzan', 'caocao'] };
  const luzhi = { id: 'sp-luzhi', name: 'SP盧植', camp: '漢' };
  const diao = { id: 'sp-diaochan', name: 'SP貂蟬', camp: '漢' };
  const dong = { id: 'dongzhuo', name: '董卓', camp: '漢' };
  const gongsun = { id: 'gongsunzan', name: '公孫瓚', camp: '群' };
  const spcao = { id: 'sp-caocao', name: 'SP曹操', camp: '漢' };
  const catalog = new Map([luzhi, diao, dong, gongsun, spcao].map((row) => [row.id, row]));
  const stale = { 'sp-luzhi': '漢', 'sp-diaochan': '漢', dongzhuo: '漢', 'ghost-general': '漢' };
  assert.deepEqual(normalizeCamps(stale), stale);
  assert.deepEqual(campOverrideCounts(stale, catalog), { toHan: 0, toQun: 0 });
  assert.equal(nextCampOverride(gongsun, stale, convert, catalog).blocked, false);
  assert.equal(nextCampOverride(gongsun, stale, convert, catalog).label, '轉漢');
  assert.equal(nextCampOverride(spcao, stale, convert, catalog).blocked, false);
  assert.equal(nextCampOverride(spcao, stale, convert, catalog).label, '轉群');
  assert.equal(nextCampOverride(luzhi, stale, convert, catalog).label, '轉群');
  const restored = normalizeState({
    app: 'sgsz-planner',
    backupVersion: 2,
    accounts: [{ id: 'acct-stale', name: '舊轉', camps: stale }],
  });
  assert.deepEqual(restored.state.accounts[0].camps, stale);
});

test('隊伍國家跟隨 resolveCamp，有效陣營可與圖鑑不同', () => {
  const members = [{ generalId: 'sp-luzhi' }, { generalId: 'sp-diaochan' }, { generalId: 'sp-caocao' }];
  assert.equal(teamCountry(members, () => '漢'), '漢');
  assert.equal(teamCountry(members, (id) => (id === 'sp-caocao' ? '群' : '漢')), '混合');
  assert.equal(teamCountry(members, (id) => (id === 'sp-caocao' ? '群' : '群')), '群');
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

test('recommended rankStatus stays verified and alternatives can be applied', () => {
  const seat = (generalId, generalName, learnedNames = ['臨危救主', '解煩衛']) => ({
    generalId,
    generalName,
    learned: [null, null],
    learnedNames,
  });
  const [team] = normalizeRecommended([{
    id: 'hanyan-main',
    scenario: 'hanyan',
    title: '主卡',
    status: '已核',
    rank: 'T0.5',
    rankStatus: '已核',
    members: [seat('sp-machao', 'SP馬超'), seat('sp-huangfusong', 'SP皇甫嵩'), seat('xuyou', '許攸')],
    alternatives: [{
      id: 'hanyan-alt',
      title: '官方整理版',
      status: '已核',
      originLabel: '官方推薦',
      diffs: ['許攸只列臨危救主'],
      members: [seat('sp-machao', 'SP馬超'), seat('sp-huangfusong', 'SP皇甫嵩'), seat('xuyou', '許攸', ['臨危救主', '解煩衛'])],
      strategy: ['強攻'],
      tricks: ['甲', '乙', '丙', '丁', '戊'],
    }, {
      id: 'desc-only',
      title: '描述型弓',
      status: '已核',
      diffs: ['只要弓、沒有逐格戰法'],
    }],
  }]);
  assert.equal(team.rankStatus, '已核');
  assert.equal(team.alternatives.length, 1);
  assert.equal(team.alternatives[0].members[2].generalId, 'xuyou');
  assert.equal(recommendedFromAlternative(team, { id: 'desc-only', title: '描述型弓', diffs: ['弓'] }), null);
  const applied = recommendedFromAlternative(team, team.alternatives[0]);
  assert.equal(applied.title, '官方整理版');
  assert.equal(applied.members[2].generalId, 'xuyou');
  assert.deepEqual(applied.strategy, ['強攻']);
  assert.equal(applied.alternatives, undefined);
  const built = teamFromRecommended(applied, 'team-alt');
  assert.match(built.name, /官方整理版/);
  assert.equal(built.members[2].generalId, 'xuyou');
});

test('bingshuRaw abbreviations resolve when structured bingshu is absent', () => {
  assert.deepEqual(resolveBingshuRaw('三軍統軍錘鍊'), {
    branch: 'shiji',
    primary: 'sanjun',
    secondary: ['tongjun', 'chuilian'],
  });
  assert.deepEqual(resolveBingshuRaw('以退＋善戰＋精準'), {
    branch: 'yongjian',
    primary: 'yitui',
    secondary: ['shanzhan', 'jingzhun'],
  });
  assert.deepEqual(resolveBingshuRaw('蠻勇武略執銳／示敵百戰掩虛'), {
    branch: 'zuozhan',
    primary: 'manyong',
    secondary: ['wulue', 'zhirui'],
  });
  const built = teamFromRecommended({
    title: '測',
    members: [{
      generalId: 'sp-guojia',
      generalName: 'SP郭嘉',
      learned: ['duohun', 'dangfeng'],
      learnedNames: [],
      bingshuRaw: '以退＋善戰＋精準',
    }, null, null],
  }, 'team-book');
  assert.equal(built.members[0].bingshu.primary, 'yitui');
  assert.deepEqual(built.members[0].bingshu.secondary, ['shanzhan', 'jingzhun']);
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
