import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activeChoice,
  allTactics,
  buildUsage,
  costBucket,
  compareTactics,
  deleteTeamPrompt,
  demoFill,
  emptyAccount,
  exportPayload,
  freshState,
  generalBlockReason,
  indexNameUse,
  bingshuStep,
  isDuwei,
  isInventoryTactic,
  matchesGeneral,
  matchesTacticPick,
  normalizeState,
  ownsDiancang,
  removeFromTeamPrompt,
  setGeneralOwned,
  setTacticOwned,
  sortGenerals,
  TEAM_POSITIONS,
  tacticBlockReason,
  teamCost,
  usefulInnate,
} from '../js/logic.js';

const generals = [
  {
    id: 'guanyu',
    name: '關羽',
    camp: '蜀',
    cost: 7,
    role: '軍事',
    quality: '名將',
    collection: false,
    dynamic: true,
    awaken: true,
    apt: { 騎: 'S', 弓: 'C', 槍: 'S', 盾: 'A', 器械: 'C' },
    innate: '威震華夏',
    nameKey: '關羽',
  },
  {
    id: 'diancang-zhouyu',
    name: '典藏周瑜',
    camp: '吳',
    cost: 6,
    role: '軍事',
    quality: '名將',
    collection: true,
    dynamic: true,
    awaken: true,
    apt: { 騎: 'B', 弓: 'S', 槍: 'A', 盾: 'A', 器械: 'C' },
    innate: '',
    nameKey: '周瑜',
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    camp: '吳',
    cost: 6,
    role: '軍事',
    quality: '名將',
    collection: false,
    dynamic: true,
    awaken: true,
    apt: { 騎: 'B', 弓: 'S', 槍: 'A', 盾: 'A', 器械: 'C' },
    innate: '',
    nameKey: '周瑜',
  },
  {
    id: 'xunyu',
    name: '荀彧',
    camp: '魏',
    cost: 6,
    role: '內政',
    quality: '名將',
    collection: false,
    dynamic: false,
    awaken: false,
    apt: { 騎: 'C', 弓: 'B', 槍: 'C', 盾: 'C', 器械: 'C' },
    innate: '',
    nameKey: '荀彧',
  },
];

const tactics = [
  { id: 'bamen', name: '八門金鎖陣', type: '陣法', copies: 1, troops: null },
  { id: 'fengshi', name: '鋒矢陣', type: '陣法', copies: 1, troops: ['騎', '盾', '槍'] },
  { id: 'guose', name: '國色', type: '內政', copies: 1, troops: null },
  { id: 'yiqi', name: '一騎當千', type: '突擊', copies: 1, troops: null },
];

const generalsById = new Map(generals.map((general) => [general.id, general]));
const tacticsById = new Map(tactics.map((tactic) => [tactic.id, tactic]));

function blankFilters(extra = {}) {
  return {
    query: '',
    quality: [],
    troop: [],
    camp: [],
    cost: [],
    role: [],
    collection: [],
    dynamic: [],
    quick: 'all',
    ...extra,
  };
}

test('cost buckets and empty filter groups do not hide cards', () => {
  assert.equal(costBucket(7), '7+');
  assert.equal(costBucket(8), '7+');
  assert.equal(costBucket(3), '3-');
  assert.equal(activeChoice([], ['魏', '蜀']), null);
  assert.equal(activeChoice(['魏', '蜀'], ['魏', '蜀']), null);
  assert.equal(matchesGeneral(generals[0], null, blankFilters(), {}), true);
});

test('aptitude, camp, collection and dynamic filters combine', () => {
  const guanyu = generals[0];
  assert.equal(
    matchesGeneral(guanyu, null, blankFilters({ troop: ['弓'] }), {}),
    false,
  );
  assert.equal(
    matchesGeneral(guanyu, null, blankFilters({ troop: ['槍', '弓'] }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(guanyu, { dynamic: true }, blankFilters({ camp: ['蜀'], dynamic: ['已解鎖'] }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(guanyu, null, blankFilters({ dynamic: ['可解鎖'] }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(generals[3], null, blankFilters({ dynamic: ['無動態'], role: ['內政'] }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(generals[1], null, blankFilters({ collection: ['典藏'] }), {}),
    false,
  );
  assert.equal(
    matchesGeneral(generals[1], { red: 0, dynamic: true, awaken: false }, blankFilters({ collection: ['典藏'] }), {}),
    false,
  );
  assert.equal(
    matchesGeneral(generals[1], { red: 0, dynamic: true, awaken: false }, blankFilters({ collection: ['非典藏'] }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(guanyu, { red: 5, dynamic: false, awaken: true }, blankFilters({ collection: ['典藏'] }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(guanyu, { red: 5, dynamic: true, awaken: false }, blankFilters({ dynamic: ['已解鎖'], collection: ['非典藏'] }), {}),
    true,
  );
  assert.equal(ownsDiancang({ dynamic: true, awaken: false }), false);
  assert.equal(ownsDiancang({ red: 5, dynamic: false, awaken: true }), true);
  assert.equal(ownsDiancang({ red: 5, dynamic: false }), false);
  assert.equal(
    matchesGeneral(guanyu, { dynamic: true, awaken: false }, blankFilters({ query: '動態' }), {}),
    true,
  );
  assert.equal(
    matchesGeneral(guanyu, { dynamic: true, awaken: false }, blankFilters({ query: '典藏' }), {}),
    false,
  );
  assert.equal(
    matchesGeneral(guanyu, { dynamic: false, awaken: true }, blankFilters({ query: '典藏' }), {}),
    true,
  );
  assert.equal(usefulInnate({ innate: '梟姬' }), '梟姬');
  assert.equal(usefulInnate({ innate: '自帶戰法' }), '');
  assert.equal(usefulInnate({ innate: '' }), '');
  assert.equal(
    matchesGeneral({ ...generals[1], name: '典藏周瑜', innate: '自帶戰法' }, null, blankFilters({ query: '周瑜' }), {}),
    true,
  );
  assert.equal(
    matchesGeneral({ ...generals[1], innate: '' }, null, blankFilters({ query: '自帶戰法' }), {}),
    false,
  );
  assert.equal(
    matchesGeneral(guanyu, null, blankFilters({ quality: ['良將'] }), {}),
    false,
  );
});

test('sort by cost then camp', () => {
  const sorted = sortGenerals(generals, 'cost-asc');
  assert.equal(sorted[0].cost <= sorted[1].cost, true);
  const byCamp = sortGenerals(generals, 'camp');
  assert.equal(byCamp[0].camp, '魏');
  const list = [
    { ...generals[2], id: 'wu7', name: '周瑜', camp: '吳', cost: 7 },
    { ...generals[0], id: 'shu7', name: '關羽', camp: '蜀', cost: 7 },
    { ...generals[3], id: 'wei6', name: '荀彧', camp: '魏', cost: 6 },
    { ...generals[0], id: 'wei7', name: '曹操', camp: '魏', cost: 7 },
    { ...generals[0], id: 'qun7', name: '呂布', camp: '群', cost: 7 },
  ];
  assert.deepEqual(sortGenerals(list, 'cost-desc').map((general) => `${general.camp}${general.cost}${general.name}`), [
    '魏7曹操',
    '蜀7關羽',
    '吳7周瑜',
    '群7呂布',
    '魏6荀彧',
  ]);
});

test('a new account owns no generals or tactics', () => {
  const account = emptyAccount('acct-new', '主帳');
  assert.deepEqual(account.owned, {});
  assert.deepEqual(account.tacticsOwned, {});
  assert.deepEqual(account.teams, []);
  const state = freshState();
  assert.equal(Object.keys(state.accounts[0].owned).length, 0);
  assert.equal(Object.keys(state.accounts[0].tacticsOwned).length, 0);
  assert.equal(state.accounts[0].teams.length, 0);
});

test('都尉 tag filters and groups after the same camp and cost', () => {
  const chenyi = {
    id: 'duwei-chenyi',
    name: '陳翊',
    camp: '群',
    cost: 7,
    role: '軍事',
    quality: '名將',
    tags: ['都尉'],
    apt: { 騎: 'A', 弓: 'A', 槍: 'A', 盾: 'A', 器械: 'A' },
    innate: '劍拔弩張',
    nameKey: '陳翊',
  };
  const lvbu = {
    id: 'lvbu',
    name: '呂布',
    camp: '群',
    cost: 7,
    role: '軍事',
    quality: '名將',
    apt: { 騎: 'S', 弓: 'S', 槍: 'A', 盾: 'B', 器械: 'C' },
    innate: '',
    nameKey: '呂布',
  };
  assert.equal(isDuwei(chenyi), true);
  assert.equal(isDuwei(lvbu), false);
  assert.equal(matchesGeneral(chenyi, null, blankFilters({ query: '都尉' }), {}), true);
  assert.equal(matchesGeneral(lvbu, null, blankFilters({ query: '都尉' }), {}), false);
  assert.equal(matchesGeneral(chenyi, null, blankFilters({ tag: ['都尉'] }), {}), true);
  assert.equal(matchesGeneral(lvbu, null, blankFilters({ tag: ['都尉'] }), {}), false);
  assert.equal(matchesGeneral(chenyi, null, blankFilters({ tag: ['非都尉'] }), {}), false);
  const grouped = sortGenerals([chenyi, lvbu], 'camp');
  assert.deepEqual(grouped.map((general) => general.id), ['lvbu', 'duwei-chenyi']);
});

test('tactic occupancy blocks a second assign and a second formation', () => {
  const account = demoFill(emptyAccount('acct-1', '主帳'));
  const usage = buildUsage(account);
  const team = account.teams[0];
  const reason = tacticBlockReason({
    account,
    team,
    slot: 2,
    learnedIndex: 1,
    tactic: tacticsById.get('bamen'),
    general: generalsById.get('zhangfei') || generals[0],
    tacticsById,
    usage,
  });
  assert.equal(reason, '已佔用');
  const formation = tacticBlockReason({
    account,
    team,
    slot: 1,
    learnedIndex: 1,
    tactic: tacticsById.get('fengshi'),
    general: generalsById.get('guanyu'),
    tacticsById,
    usage,
  });
  assert.equal(formation, '同隊已有陣法');
  const free = tacticBlockReason({
    account,
    team: account.teams[1],
    slot: 0,
    learnedIndex: 0,
    tactic: tacticsById.get('fengshi'),
    general: generalsById.get('zhugeliang') || {
      id: 'zhugeliang',
      role: '軍事',
      apt: { 騎: 'C', 弓: 'S', 槍: 'S', 盾: 'B', 器械: 'S' },
    },
    tacticsById,
    usage,
  });
  assert.equal(free, '');
});

test('same general and same name cannot both take the field', () => {
  const account = demoFill(emptyAccount('acct-1', '主帳'));
  account.owned.zhouyu = { red: 0, dynamic: false, awaken: false };
  account.owned['diancang-zhouyu'] = { red: 0, dynamic: false, awaken: false };
  account.teams[1].members[1] = {
    generalId: 'zhouyu',
    learned: [null, null],
    bingshu: null,
  };
  const usage = indexNameUse(buildUsage(account), generalsById);
  const blocked = generalBlockReason({
    account,
    team: account.teams[0],
    slot: 0,
    general: generalsById.get('zhouyu'),
    generalsById,
    usage,
  });
  assert.equal(blocked, '已在其他隊伍');
  const sameName = generalBlockReason({
    account,
    team: account.teams[0],
    slot: 0,
    general: generalsById.get('diancang-zhouyu'),
    generalsById,
    usage,
  });
  assert.equal(sameName, '同名武將已上陣');
});

test('unowning a general or tactic pulls them off teams', () => {
  let account = demoFill(emptyAccount('acct-1', '主帳'));
  account = setGeneralOwned(account, generalsById.get('guanyu'), false);
  assert.equal(account.owned.guanyu, undefined);
  assert.equal(account.teams[0].members[1], null);
  account = setTacticOwned(account, 'bamen', false);
  assert.equal(account.tacticsOwned.bamen, undefined);
  assert.equal(account.teams[0].members[0].learned[0], null);
});

test('backup rejects foreign json and keeps a round trip', () => {
  const bad = normalizeState({ hello: 'world' });
  assert.equal(bad.ok, false);
  const account = demoFill(emptyAccount('acct-1', '主帳'));
  const state = {
    app: 'sgsz-planner',
    backupVersion: 1,
    activeAccountId: account.id,
    accounts: [account],
  };
  const payload = exportPayload(state, '1.0.0');
  const again = normalizeState(payload);
  assert.equal(again.ok, true);
  assert.equal(again.state.backupVersion, 2);
  assert.equal(again.state.accounts[0].teams[0].name, '桃園盾');
  assert.deepEqual(
    again.state.accounts[0].teams[0].members.map((member) => member.generalId),
    ['liubei', 'guanyu', 'zhangfei'],
  );
  assert.equal(again.state.accounts[0].owned.guanyu.red, 5);
  const messy = normalizeState({
    app: 'sgsz-planner',
    backupVersion: 1,
    activeAccountId: 'missing',
    accounts: [{
      id: 'acct-9',
      name: '  分城  ',
      owned: { guanyu: { red: 9, dynamic: 1, awaken: 'yes' } },
      tacticsOwned: { bamen: true, bad: false },
      customTactics: [{ id: 'c-1', name: '<img>', type: '不是', desc: 'x' }],
      teams: [{ id: 't-1', name: '', notes: '', members: [null, { generalId: 'guanyu', learned: ['bamen'] }] }],
    }],
  });
  assert.equal(messy.ok, true);
  assert.equal(messy.state.activeAccountId, 'acct-9');
  assert.equal(messy.state.accounts[0].owned.guanyu.red, 5);
  assert.equal(messy.state.accounts[0].owned.guanyu.dynamic, false);
  assert.equal(messy.state.accounts[0].customTactics[0].type, '主動');
  assert.equal(messy.state.accounts[0].teams[0].members[0].generalId, 'guanyu');
  assert.equal(messy.state.accounts[0].teams[0].members[0].learned[1], null);
  assert.equal(messy.state.accounts[0].teams[0].members[1], null);
  assert.equal(messy.state.backupVersion, 2);
});

test('team slots list the commander first and keep each role when importing v1', () => {
  assert.deepEqual(TEAM_POSITIONS, ['主將', '副將', '副將']);
  const account = demoFill(emptyAccount('acct-1', '主帳'));
  assert.deepEqual(account.teams[0].members.map((member) => member.generalId), ['liubei', 'guanyu', 'zhangfei']);
  assert.equal(account.teams[1].members[0], null);
  assert.equal(account.teams[1].members[1].generalId, 'zhugeliang');

  const legacy = normalizeState({
    app: 'sgsz-planner',
    backupVersion: 1,
    activeAccountId: 'acct-1',
    accounts: [{
      id: 'acct-1',
      name: '槍司',
      teams: [{
        id: 't-1',
        name: '一隊',
        members: [
          { generalId: 'machao', learned: [null, null] },
          { generalId: 'huangfusong', learned: [null, null] },
          { generalId: 'zhangfei', learned: [null, null] },
        ],
      }],
    }],
  });
  assert.equal(legacy.ok, true);
  assert.equal(legacy.state.backupVersion, 2);
  assert.deepEqual(
    legacy.state.accounts[0].teams[0].members.map((member) => member.generalId),
    ['huangfusong', 'machao', 'zhangfei'],
  );

  const current = normalizeState({
    app: 'sgsz-planner',
    backupVersion: 2,
    activeAccountId: 'acct-1',
    accounts: [{
      id: 'acct-1',
      name: '槍司',
      teams: [{
        id: 't-1',
        name: '一隊',
        members: legacy.state.accounts[0].teams[0].members,
      }],
    }],
  });
  assert.equal(current.ok, true);
  assert.deepEqual(
    current.state.accounts[0].teams[0].members.map((member) => member.generalId),
    ['huangfusong', 'machao', 'zhangfei'],
  );
});

test('demo team cost counts three generals', () => {
  const account = demoFill(emptyAccount('acct-1'));
  const map = new Map([
    ['liubei', { cost: 7 }],
    ['guanyu', { cost: 7 }],
    ['zhangfei', { cost: 6 }],
  ]);
  assert.equal(teamCost(account.teams[0], map), 20);
});

test('tactic picker hides unowned tactics until the filter is opened up', () => {
  const tactics = [
    { id: 'shengqi', name: '盛氣凌敵', type: '指揮', desc: '先手' },
    { id: 'suo', name: '所向披靡', type: '主動', desc: '傷害' },
    { id: 'bamen', name: '八門金鎖陣', type: '陣法', desc: '主將先攻' },
  ];
  const owned = new Set(['shengqi', 'bamen']);
  const pick = (tactic, filters) => matchesTacticPick(tactic, { isOwned: owned.has(tactic.id), ...filters });
  assert.deepEqual(tactics.filter((tactic) => pick(tactic)).map((tactic) => tactic.id), ['shengqi', 'bamen']);
  assert.deepEqual(tactics.filter((tactic) => pick(tactic, { type: '陣法' })).map((tactic) => tactic.id), ['bamen']);
  assert.deepEqual(
    tactics.filter((tactic) => pick(tactic, { owned: 'all', query: '披靡' })).map((tactic) => tactic.id),
    ['suo'],
  );
  assert.deepEqual(tactics.filter((tactic) => pick(tactic, { owned: 'free' })).map((tactic) => tactic.id), ['suo']);
});

test('removing a general asks for that general by name', () => {
  assert.equal(removeFromTeamPrompt('SP皇甫嵩'), '確定要把SP皇甫嵩移出隊伍？');
  assert.equal(removeFromTeamPrompt('  '), '確定要把這名武將移出隊伍？');
});

test('deleting a team names it and says the delete cannot be undone', () => {
  assert.equal(deleteTeamPrompt('槍隊'), '確定刪除隊伍「槍隊」？此操作無法復原');
  assert.equal(deleteTeamPrompt('  '), '確定刪除隊伍「這支隊伍」？此操作無法復原');
});

test('bingshu steps go from system to primary book to secondary book', () => {
  assert.equal(bingshuStep(null), 'branch');
  assert.equal(bingshuStep({ branch: 'jiubian' }), 'primary');
  assert.equal(bingshuStep({ branch: 'jiubian', primary: 'yuanqi' }), 'secondary');
  assert.equal(bingshuStep({ branch: 'jiubian', primary: 'yuanqi', secondary: 'suzhan' }), 'branch');
});

test('inventory list drops innate tactics and keeps custom ones', () => {
  const catalog = [
    { id: 'xiansheng', name: '先聲奪人', source: '自帶', type: '指揮' },
    { id: 'yongwu', name: '用武通神', source: '傳承', type: '指揮' },
    { id: 'fuji', name: '撫輯軍民', source: '事件', type: '指揮' },
    { id: 'tuo-duohun', name: '拓·奪魂挾魄', source: '賽季', type: '主動' },
  ];
  const account = emptyAccount('acct-1');
  account.customTactics = [{ id: 'custom-1', name: '自訂突擊', type: '突擊', desc: '' }];
  const listed = allTactics(catalog, account).filter(isInventoryTactic);
  assert.deepEqual(listed.map((tactic) => tactic.name), ['用武通神', '撫輯軍民', '拓·奪魂挾魄', '自訂突擊']);
  assert.equal(listed.some((tactic) => tactic.source === '自帶'), false);
  assert.equal(usefulInnate({ innate: '先聲奪人' }), '先聲奪人');
});

test('tactics sort S before A, then type, then name', () => {
  const rows = [
    { name: '坐守孤城', type: '主動', rank: 'A' },
    { name: '刮骨療毒', type: '主動', rank: 'S' },
    { name: '盛氣凌敵', type: '指揮', rank: 'S' },
    { name: '暫避其鋒', type: '指揮', rank: 'S' },
  ].sort(compareTactics);
  assert.deepEqual(rows.map((row) => row.name), ['盛氣凌敵', '暫避其鋒', '刮骨療毒', '坐守孤城']);
});
