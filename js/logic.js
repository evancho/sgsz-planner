export const APP_ID = 'sgsz-planner';
export const BACKUP_VERSION = 1;
export const CAMP_ORDER = ['魏', '蜀', '吳', '群'];
export const TROOP_ORDER = ['騎', '弓', '槍', '盾', '器械'];
export const QUALITIES = ['名將', '良將', '裨將', '偏將', '軍士'];
export const TACTIC_TYPES = ['指揮', '主動', '突擊', '被動', '兵種', '陣法', '內政'];
export const COST_BUCKETS = ['7+', '6', '5', '4', '3-'];
export const DYNAMIC_FILTERS = ['已解鎖', '可解鎖', '無動態'];
export const COLLECTION_FILTERS = ['典藏', '非典藏'];
export const ROLE_FILTERS = ['軍事', '內政'];
export const SORTS = [
  { id: 'rare', label: '稀有' },
  { id: 'cost-desc', label: 'COST 高→低' },
  { id: 'cost-asc', label: 'COST 低→高' },
  { id: 'camp', label: '陣營' },
  { id: 'name', label: '名稱' },
];

const QUALITY_RANK = { 名將: 5, 良將: 4, 裨將: 3, 偏將: 2, 軍士: 1 };

export function newId(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${rand}`;
}

export function emptyAccount(id, name = '主帳') {
  return {
    id,
    name: clip(name, 24) || '主帳',
    owned: {},
    tacticsOwned: {},
    customTactics: [],
    teams: [],
  };
}

export function freshState() {
  const id = newId('acct');
  return {
    app: APP_ID,
    backupVersion: BACKUP_VERSION,
    activeAccountId: id,
    accounts: [emptyAccount(id, '主帳')],
  };
}

function clip(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function asBool(value) {
  return value === true;
}

function clampRed(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return 0;
  return Math.min(5, Math.max(0, n));
}

function cleanId(value) {
  const id = clip(value, 64);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return '';
  return id;
}

export function isAptitudeAtLeastA(letter) {
  return letter === 'S' || letter === 'A';
}

export function costBucket(cost) {
  if (cost >= 7) return '7+';
  if (cost === 6) return '6';
  if (cost === 5) return '5';
  if (cost === 4) return '4';
  return '3-';
}

export function activeChoice(selected, allValues) {
  if (!selected?.length) return null;
  if (selected.length >= allValues.length) return null;
  return new Set(selected);
}

export function dynamicState(general, ownedRecord) {
  if (!general.dynamic) return '無動態';
  if (ownedRecord?.dynamic) return '已解鎖';
  return '可解鎖';
}

export function matchesGeneral(general, ownedRecord, filters, extras) {
  const query = (filters.query || '').trim().toLowerCase();
  if (query) {
    const display = String(general.name || '').replace(/^典藏/, '');
    const hay = `${display} ${usefulInnate(general)} ${general.camp} ${ownsDiancang(ownedRecord) ? '典藏' : ''}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  const quality = activeChoice(filters.quality, QUALITIES);
  if (quality && !quality.has(general.quality)) return false;
  const camp = activeChoice(filters.camp, CAMP_ORDER);
  if (camp && !camp.has(general.camp)) return false;
  const cost = activeChoice(filters.cost, COST_BUCKETS);
  if (cost && !cost.has(costBucket(general.cost))) return false;
  const role = activeChoice(filters.role, ROLE_FILTERS);
  if (role && !role.has(general.role)) return false;
  const collection = activeChoice(filters.collection, COLLECTION_FILTERS);
  if (collection) {
    const label = ownsDiancang(ownedRecord) ? '典藏' : '非典藏';
    if (!collection.has(label)) return false;
  }
  const troops = activeChoice(filters.troop, TROOP_ORDER);
  if (troops) {
    const ok = [...troops].some((troop) => isAptitudeAtLeastA(general.apt[troop]));
    if (!ok) return false;
  }
  const dynamic = activeChoice(filters.dynamic, DYNAMIC_FILTERS);
  if (dynamic && !dynamic.has(dynamicState(general, ownedRecord))) return false;
  if (filters.quick === 'owned' && !ownedRecord) return false;
  if (filters.quick === 'free' && ownedRecord) return false;
  if (filters.quick === 'team' && !extras?.inTeam) return false;
  return true;
}

export function ownsDiancang(ownedRecord) {
  return Boolean(ownedRecord?.dynamic);
}

export function usefulInnate(general) {
  const name = String(general?.innate || '').trim();
  if (!name || name === '自帶戰法') return '';
  return name;
}

function rarityKey(general) {
  let score = (QUALITY_RANK[general.quality] || 0) * 100;
  if (general.name.startsWith('無雙')) score += 20;
  if (general.name.startsWith('SP')) score += 20;
  score += general.cost;
  return score;
}

export function sortGenerals(list, mode) {
  const copy = [...list];
  const campIndex = (camp) => {
    const index = CAMP_ORDER.indexOf(camp);
    return index === -1 ? 99 : index;
  };
  const byCampThenName = (a, b) => {
    const campDiff = campIndex(a.camp) - campIndex(b.camp);
    if (campDiff) return campDiff;
    return a.name.localeCompare(b.name, 'zh-Hant');
  };
  copy.sort((a, b) => {
    if (mode === 'cost-desc' || mode === 'cost-asc') {
      if (a.cost !== b.cost) return mode === 'cost-desc' ? b.cost - a.cost : a.cost - b.cost;
      return byCampThenName(a, b);
    }
    if (mode === 'camp') {
      const campDiff = campIndex(a.camp) - campIndex(b.camp);
      if (campDiff) return campDiff;
      if (a.cost !== b.cost) return b.cost - a.cost;
      return a.name.localeCompare(b.name, 'zh-Hant');
    }
    if (mode === 'name') return a.name.localeCompare(b.name, 'zh-Hant');
    if (mode === 'rare') {
      const rareDiff = rarityKey(b) - rarityKey(a);
      if (rareDiff) return rareDiff;
    }
    if (a.cost !== b.cost) return b.cost - a.cost;
    return byCampThenName(a, b);
  });
  return copy;
}

const TACTIC_RANK = { S: 0, A: 1 };

export function compareTactics(a, b) {
  const rankDiff = (TACTIC_RANK[a.rank] ?? 2) - (TACTIC_RANK[b.rank] ?? 2);
  if (rankDiff) return rankDiff;
  const typeDiff = (TACTIC_TYPES.indexOf(a.type) < 0 ? 99 : TACTIC_TYPES.indexOf(a.type))
    - (TACTIC_TYPES.indexOf(b.type) < 0 ? 99 : TACTIC_TYPES.indexOf(b.type));
  if (typeDiff) return typeDiff;
  return a.name.localeCompare(b.name, 'zh-Hant');
}

export function allTactics(catalogTactics, account) {
  const custom = (account?.customTactics || []).map((tactic) => ({
    ...tactic,
    source: '自訂',
    from: [],
    troops: null,
    copies: 1,
    orange: false,
    custom: true,
  }));
  return [...catalogTactics, ...custom];
}

export function tacticOwned(account, tacticId) {
  return Boolean(account.tacticsOwned?.[tacticId]);
}

export function buildUsage(account) {
  const generalTeams = new Map();
  const nameTeams = new Map();
  const tacticUses = new Map();
  for (const team of account.teams || []) {
    team.members.forEach((member, slot) => {
      if (!member?.generalId) return;
      generalTeams.set(member.generalId, {
        teamId: team.id,
        teamName: team.name,
        slot,
      });
      member.learned.forEach((tacticId, learnedIndex) => {
        if (!tacticId) return;
        if (!tacticUses.has(tacticId)) tacticUses.set(tacticId, []);
        tacticUses.get(tacticId).push({
          teamId: team.id,
          teamName: team.name,
          generalId: member.generalId,
          slot,
          learnedIndex,
        });
      });
    });
  }
  return { generalTeams, nameTeams, tacticUses };
}

export function indexNameUse(usage, generalsById) {
  usage.nameTeams = new Map();
  for (const [generalId, where] of usage.generalTeams) {
    const general = generalsById.get(generalId);
    if (!general) continue;
    if (!usage.nameTeams.has(general.nameKey)) usage.nameTeams.set(general.nameKey, []);
    usage.nameTeams.get(general.nameKey).push({ ...where, generalId });
  }
  return usage;
}

export function tacticUseCount(usage, tacticId) {
  return usage.tacticUses.get(tacticId)?.length || 0;
}

export function teamHasOtherFormation(team, tacticsById, tactic, learnedIndex, slot) {
  if (tactic.type !== '陣法') return false;
  return team.members.some((member, memberSlot) => {
    if (!member) return false;
    return member.learned.some((id, index) => {
      if (!id) return false;
      if (memberSlot === slot && index === learnedIndex) return false;
      return tacticsById.get(id)?.type === '陣法';
    });
  });
}

export function tacticBlockReason({
  account,
  team,
  slot,
  learnedIndex,
  tactic,
  general,
  tacticsById,
  usage,
}) {
  if (!tactic) return '找不到戰法';
  if (!tacticOwned(account, tactic.id)) return '未擁有';
  const member = team.members[slot];
  if (member?.learned?.some((id, index) => id === tactic.id && index !== learnedIndex)) {
    return '同一人不能裝兩次';
  }
  const uses = usage.tacticUses.get(tactic.id) || [];
  const copies = tactic.copies || 1;
  const others = uses.filter((use) => !(use.teamId === team.id && use.slot === slot && use.learnedIndex === learnedIndex));
  if (others.length >= copies) return '已佔用';
  if (teamHasOtherFormation(team, tacticsById, tactic, learnedIndex, slot)) {
    return '同隊已有陣法';
  }
  if (general) {
    if (tactic.type === '內政' && general.role !== '內政') return '內政戰法只能配內政武將';
    if (tactic.type !== '內政' && general.role === '內政') return '內政武將只能配內政戰法';
  }
  return '';
}

export function tacticTroopWarning(general, tactic) {
  if (!general || !tactic?.troops?.length) return '';
  const ok = tactic.troops.some((troop) => isAptitudeAtLeastA(general.apt[troop]));
  if (ok) return '';
  return `常見兵種 ${tactic.troops.join('、')}，此武將適性未達 A`;
}

export function generalBlockReason({ account, team, slot, general, generalsById, usage }) {
  if (!general) return '找不到武將';
  if (!account.owned?.[general.id]) return '未擁有';
  const where = usage.generalTeams.get(general.id);
  if (where && !(where.teamId === team.id && where.slot === slot)) return '已在其他隊伍';
  const nameUses = (usage.nameTeams.get(general.nameKey) || []).filter((use) => use.generalId !== general.id);
  const outside = nameUses.filter((use) => !(use.teamId === team.id && use.slot === slot));
  if (outside.length) return '同名武將已上陣';
  return '';
}

export function teamCost(team, generalsById) {
  return (team.members || []).reduce((sum, member) => {
    if (!member?.generalId) return sum;
    return sum + (generalsById.get(member.generalId)?.cost || 0);
  }, 0);
}

export function bingshuLabel(book, branches) {
  if (!book?.branch) return '';
  const branch = branches.find((item) => item.id === book.branch);
  if (!branch) return '未知兵書';
  const primary = branch.primary.find((item) => item.id === book.primary);
  const secondary = branch.secondary.find((item) => item.id === book.secondary);
  return [branch.name, primary?.name, secondary?.name].filter(Boolean).join(' · ');
}

function normalizeMember(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const generalId = cleanId(raw.generalId);
  if (!generalId) return null;
  const learned = [0, 1].map((index) => {
    const id = cleanId(raw.learned?.[index]);
    return id || null;
  });
  let bingshu = null;
  if (raw.bingshu && typeof raw.bingshu === 'object' && cleanId(raw.bingshu.branch)) {
    bingshu = {
      branch: cleanId(raw.bingshu.branch),
      primary: cleanId(raw.bingshu.primary) || null,
      secondary: cleanId(raw.bingshu.secondary) || null,
    };
  }
  return { generalId, learned, bingshu };
}

function normalizeAccount(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = cleanId(raw.id);
  if (!id) return null;
  const owned = {};
  if (raw.owned && typeof raw.owned === 'object') {
    for (const [key, value] of Object.entries(raw.owned)) {
      const generalId = cleanId(key);
      if (!generalId || !value || typeof value !== 'object') continue;
      owned[generalId] = {
        red: clampRed(value.red),
        dynamic: asBool(value.dynamic),
        awaken: asBool(value.awaken),
      };
    }
  }
  const tacticsOwned = {};
  if (raw.tacticsOwned && typeof raw.tacticsOwned === 'object') {
    for (const [key, value] of Object.entries(raw.tacticsOwned)) {
      const tacticId = cleanId(key);
      if (tacticId && value === true) tacticsOwned[tacticId] = true;
    }
  }
  const customTactics = [];
  const customIds = new Set();
  if (Array.isArray(raw.customTactics)) {
    for (const item of raw.customTactics.slice(0, 80)) {
      const customId = cleanId(item?.id);
      const name = clip(item?.name, 24);
      if (!customId || !name || customIds.has(customId)) continue;
      customIds.add(customId);
      const type = TACTIC_TYPES.includes(item.type) ? item.type : '主動';
      customTactics.push({
        id: customId,
        name,
        type,
        desc: clip(item?.desc, 200),
      });
    }
  }
  const teams = [];
  const teamIds = new Set();
  if (Array.isArray(raw.teams)) {
    for (const item of raw.teams.slice(0, 40)) {
      const teamId = cleanId(item?.id);
      if (!teamId || teamIds.has(teamId)) continue;
      teamIds.add(teamId);
      const members = [0, 1, 2].map((index) => normalizeMember(item.members?.[index]));
      teams.push({
        id: teamId,
        name: clip(item?.name, 24) || '未命名隊伍',
        notes: clip(item?.notes, 500),
        members,
      });
    }
  }
  return {
    id,
    name: clip(raw.name, 24) || '未命名帳號',
    owned,
    tacticsOwned,
    customTactics,
    teams,
  };
}

export function normalizeState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: '這不是本工具的備份檔' };
  }
  if (input.app !== APP_ID || input.backupVersion !== BACKUP_VERSION) {
    return { ok: false, error: '這不是本工具的備份檔' };
  }
  if (!Array.isArray(input.accounts) || input.accounts.length === 0) {
    return { ok: false, error: '備份裡沒有帳號' };
  }
  if (input.accounts.length > 30) {
    return { ok: false, error: '帳號數量過多' };
  }
  const accounts = [];
  const seen = new Set();
  for (const raw of input.accounts) {
    const account = normalizeAccount(raw);
    if (!account) return { ok: false, error: '帳號資料不完整' };
    if (seen.has(account.id)) return { ok: false, error: '帳號編號重複' };
    seen.add(account.id);
    accounts.push(account);
  }
  let activeAccountId = cleanId(input.activeAccountId);
  if (!seen.has(activeAccountId)) activeAccountId = accounts[0].id;
  return {
    ok: true,
    state: {
      app: APP_ID,
      backupVersion: BACKUP_VERSION,
      activeAccountId,
      accounts,
    },
  };
}

export function exportPayload(state, catalogVersion) {
  return {
    app: APP_ID,
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    catalogVersion,
    activeAccountId: state.activeAccountId,
    accounts: state.accounts,
  };
}

export function updateAccount(state, accountId, recipe) {
  return {
    ...state,
    accounts: state.accounts.map((account) => (account.id === accountId ? recipe(account) : account)),
  };
}

export function activeAccount(state) {
  return state.accounts.find((account) => account.id === state.activeAccountId) || state.accounts[0];
}

function withoutTactic(account, tacticId) {
  return {
    ...account,
    teams: account.teams.map((team) => ({
      ...team,
      members: team.members.map((member) => {
        if (!member) return null;
        return {
          ...member,
          learned: member.learned.map((id) => (id === tacticId ? null : id)),
        };
      }),
    })),
  };
}

function withoutGeneral(account, generalId, nameKey, generalsById) {
  return {
    ...account,
    teams: account.teams.map((team) => ({
      ...team,
      members: team.members.map((member) => {
        if (!member) return null;
        const general = generalsById.get(member.generalId);
        if (member.generalId === generalId) return null;
        if (nameKey && general?.nameKey === nameKey && member.generalId !== generalId) return member;
        return member;
      }),
    })),
  };
}

export function setGeneralOwned(account, general, owned) {
  const nextOwned = { ...account.owned };
  let next = account;
  if (!owned) {
    delete nextOwned[general.id];
    next = withoutGeneral(next, general.id, null, new Map());
  } else if (!nextOwned[general.id]) {
    nextOwned[general.id] = { red: 0, dynamic: false, awaken: false };
  }
  return { ...next, owned: nextOwned };
}

export function setTacticOwned(account, tacticId, owned) {
  const tacticsOwned = { ...account.tacticsOwned };
  let next = account;
  if (owned) tacticsOwned[tacticId] = true;
  else {
    delete tacticsOwned[tacticId];
    next = withoutTactic(next, tacticId);
  }
  return { ...next, tacticsOwned };
}

export function demoFill(account) {
  const own = (red, dynamic, awaken) => ({ red, dynamic, awaken });
  return {
    ...account,
    owned: {
      liubei: own(3, true, true),
      guanyu: own(5, true, true),
      zhangfei: own(2, false, true),
      zhaoyun: own(0, true, false),
      fazheng: own(1, true, true),
      zhugeliang: own(4, true, true),
      caocao: own(3, true, true),
      lvbu: own(0, true, false),
      luxun: own(2, true, true),
      zhouyu: own(1, false, true),
      caoren: own(0, false, true),
      huangyueying: own(0, false, false),
    },
    tacticsOwned: {
      bamen: true,
      fengshi: true,
      zanbi: true,
      shengqi: true,
      pozhen: true,
      guagu: true,
      yiqi: true,
      wangong: true,
      wudang: true,
      tengjia: true,
      taiping: true,
      hubao: true,
    },
    customTactics: account.customTactics || [],
    teams: [
      {
        id: 'team-demo-taoyuan',
        name: '桃園盾',
        notes: '劉關張。八門先手，關羽盛氣，張飛破陣。',
        members: [
          {
            generalId: 'guanyu',
            learned: ['shengqi', null],
            bingshu: { branch: 'xushi', primary: 'yizhi', secondary: 'guimou' },
          },
          {
            generalId: 'liubei',
            learned: ['bamen', 'zanbi'],
            bingshu: { branch: 'jiubian', primary: 'yuanqi', secondary: 'lijun' },
          },
          {
            generalId: 'zhangfei',
            learned: ['pozhen', null],
            bingshu: { branch: 'xushi', primary: 'gongqi', secondary: 'jiangwei-book' },
          },
        ],
      },
      {
        id: 'team-demo-shugong',
        name: '蜀弓',
        notes: '諸葛亮先佔位，另外兩格還沒定。',
        members: [
          {
            generalId: 'zhugeliang',
            learned: [null, null],
            bingshu: { branch: 'xushi', primary: 'houfa', secondary: 'guimou' },
          },
          null,
          null,
        ],
      },
    ],
  };
}
