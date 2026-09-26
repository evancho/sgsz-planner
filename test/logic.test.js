import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activeChoice,
  buildUsage,
  costBucket,
  demoFill,
  emptyAccount,
  exportPayload,
  generalBlockReason,
  indexNameUse,
  matchesGeneral,
  normalizeState,
  ownsDiancang,
  setGeneralOwned,
  setTacticOwned,
  sortGenerals,
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
    true,
  );
  assert.equal(
    matchesGeneral(guanyu, { red: 5, dynamic: false, awaken: true }, blankFilters({ collection: ['典藏'] }), {}),
    false,
  );
  assert.equal(ownsDiancang({ dynamic: true }), true);
  assert.equal(ownsDiancang({ red: 5, dynamic: false }), false);
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
  assert.equal(account.teams[0].members[0], null);
  account = setTacticOwned(account, 'bamen', false);
  assert.equal(account.tacticsOwned.bamen, undefined);
  assert.equal(account.teams[0].members[1].learned[0], null);
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
  assert.equal(again.state.accounts[0].teams[0].name, '桃園盾');
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
  assert.equal(messy.state.accounts[0].teams[0].members[1].learned[1], null);
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
