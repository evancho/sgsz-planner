export const APP_ID = 'sgsz-planner';
export const BACKUP_VERSION = 2;
export const ACCOUNT_FILE_VERSION = 1;
/** Index 0 is 主將. The following slots are 副將, in list order. */
export const TEAM_POSITIONS = ['主將', '副將', '副將'];
export const CAMP_ORDER = ['魏', '蜀', '吳', '群', '漢'];
export const TROOP_ORDER = ['騎', '弓', '槍', '盾', '器械'];
export const QUALITIES = ['名將', '良將', '裨將', '偏將', '軍士'];
export const TACTIC_TYPES = ['指揮', '主動', '突擊', '被動', '兵種', '陣法', '內政'];
export const COST_BUCKETS = ['7+', '6', '5', '4', '3-'];
export const RED_FILTERS = ['0', '1', '2', '3', '4', '5'];
export const DYNAMIC_FILTERS = ['已解鎖', '可解鎖', '無動態'];
export const COLLECTION_FILTERS = ['典藏', '非典藏'];
export const ROLE_FILTERS = ['軍事', '內政'];
export const TAG_FILTERS = ['都尉', '非都尉'];
/** 目前推薦隊伍用到的方略。奇略名稱先不限制。 */
export const STRATEGY_CHOICES = ['整軍', '強攻', '襲擾', '謀算', '久戰'];
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

export const SCENARIOS = [
  { id: 'regular', name: '常規劇本' },
  { id: 'yingxiong', name: '英雄命世' },
  { id: 'hanyan', name: '漢焰長明' },
];
/** 舊帳號沒有劇本欄位時，視為上一季英雄命世。 */
export const DEFAULT_ACCOUNT_SCENARIO = 'yingxiong';

export function normalizeScenario(value) {
  const raw = String(value || '').trim();
  if (SCENARIOS.some((item) => item.id === raw)) return raw;
  const byName = SCENARIOS.find((item) => item.name === raw);
  return byName ? byName.id : DEFAULT_ACCOUNT_SCENARIO;
}

export function scenarioName(id) {
  return SCENARIOS.find((item) => item.id === normalizeScenario(id)).name;
}

/** 沒有適用劇本陣列的資料，所有劇本都顯示。有陣列時才限定。 */
export function fitsScenario(item, scenarioId) {
  const marks = item?.scenarios;
  if (!Array.isArray(marks) || marks.length === 0) return true;
  return marks.includes(normalizeScenario(scenarioId));
}

export function meritIdList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const id = cleanId(item);
    if (id && !out.includes(id)) out.push(id);
  }
  return out.slice(0, 8);
}

export function emptyAccount(id, name = '主帳', scenario = DEFAULT_ACCOUNT_SCENARIO) {
  return {
    id,
    name: clip(name, 24) || '主帳',
    scenario: normalizeScenario(scenario),
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
    updatedAt: new Date().toISOString(),
    activeAccountId: id,
    accounts: [emptyAccount(id, '主帳')],
  };
}

/** Parse backup timestamps for last-write-wins. Prefer updatedAt, then exportedAt. */
export function backupUpdatedAt(payload) {
  if (!payload || typeof payload !== 'object') return 0;
  const raw = payload.updatedAt || payload.exportedAt || '';
  const time = Date.parse(String(raw));
  return Number.isFinite(time) ? time : 0;
}

/**
 * Compare two backup payloads. Returns which side wins for whole-state sync.
 * @returns {{ choice: 'local'|'remote'|'equal', localAt: number, remoteAt: number }}
 */
export function pickNewerBackup(local, remote) {
  const localAt = backupUpdatedAt(local);
  const remoteAt = backupUpdatedAt(remote);
  if (remoteAt > localAt) return { choice: 'remote', localAt, remoteAt };
  if (localAt > remoteAt) return { choice: 'local', localAt, remoteAt };
  return { choice: 'equal', localAt, remoteAt };
}

/** Count roster substance so empty installs cannot wipe a filled backup. */
export function backupSubstance(payload) {
  const accounts = Array.isArray(payload?.accounts) ? payload.accounts : [];
  let owned = 0;
  let tactics = 0;
  let teams = 0;
  let customs = 0;
  for (const account of accounts) {
    owned += Object.keys(account?.owned || {}).length;
    tactics += Object.keys(account?.tacticsOwned || {}).length;
    teams += Array.isArray(account?.teams) ? account.teams.length : 0;
    customs += Array.isArray(account?.customTactics) ? account.customTactics.length : 0;
  }
  return {
    accounts: accounts.length,
    owned,
    tactics,
    teams,
    customs,
    total: owned + tactics + teams + customs,
  };
}

export function isSparseBackup(payload) {
  return backupSubstance(payload).total === 0;
}

/**
 * Last-write-wins, but a sparse (empty) side never overwrites a non-sparse side.
 * @returns {{ choice: 'local'|'remote'|'equal', localAt: number, remoteAt: number, protected: false|'local-sparse'|'remote-sparse' }}
 */
export function pickSyncBackup(local, remote) {
  const base = pickNewerBackup(local, remote);
  const localSparse = isSparseBackup(local);
  const remoteSparse = isSparseBackup(remote);
  if (localSparse && !remoteSparse) {
    return { ...base, choice: 'remote', protected: 'local-sparse' };
  }
  if (remoteSparse && !localSparse) {
    return { ...base, choice: 'local', protected: 'remote-sparse' };
  }
  return { ...base, protected: false };
}

/** Stable-ish fingerprint so we can detect real content differences. */
export function backupFingerprint(payload) {
  return JSON.stringify({
    updatedAt: payload?.updatedAt || payload?.exportedAt || '',
    accounts: payload?.accounts || [],
  });
}

export function backupsDiffer(local, remote) {
  if (!local || !remote) return true;
  return backupFingerprint(local) !== backupFingerprint(remote);
}

export function archiveBackupFileName(when = new Date(), side = 'backup') {
  const stamp = when.toISOString().replace(/[:.]/g, '-');
  const label = side === 'local' || side === 'remote' ? side : 'backup';
  return `sgsz-planner-archive-${label}-${stamp}.json`;
}

/** Bump updatedAt before persisting a local edit. */
export function touchUpdatedAt(state, when = new Date()) {
  return { ...state, updatedAt: when.toISOString() };
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

export function isDuwei(general) {
  return Array.isArray(general?.tags) && general.tags.includes('都尉');
}

export function matchesGeneral(general, ownedRecord, filters, extras) {
  const query = (filters.query || '').trim().toLowerCase();
  if (query) {
    const display = String(general.name || '').replace(/^典藏/, '');
    const tags = Array.isArray(general.tags) ? general.tags.join(' ') : '';
    const marks = [
      ownedRecord?.dynamic ? '動態' : '',
      ownsDiancang(ownedRecord) ? '典藏' : '',
    ].filter(Boolean).join(' ');
    const hay = `${display} ${usefulInnate(general)} ${general.camp} ${tags} ${marks}`.toLowerCase();
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
    const apt = extras?.apt || general.apt;
    const ok = [...troops].some((troop) => isAptitudeAtLeastA(apt?.[troop]));
    if (!ok) return false;
  }
  const dynamic = activeChoice(filters.dynamic, DYNAMIC_FILTERS);
  if (dynamic && !dynamic.has(dynamicState(general, ownedRecord))) return false;
  const tag = activeChoice(filters.tag, TAG_FILTERS);
  if (tag) {
    const label = isDuwei(general) ? '都尉' : '非都尉';
    if (!tag.has(label)) return false;
  }
  if (filters.quick === 'owned' && !ownedRecord) return false;
  if (filters.quick === 'free' && ownedRecord) return false;
  if (filters.quick === 'team' && !extras?.inTeam) return false;
  return true;
}

/** 畫面上的「典藏」對應備份欄位 awaken，不是 dynamic。 */
export function ownsDiancang(ownedRecord) {
  return Boolean(ownedRecord?.awaken);
}

/** 選擇武將的紅度排序：紅度，加上已開動態、已標典藏各 1 分。 */
export function redSortScore(ownedRecord) {
  if (!ownedRecord) return 0;
  return clampRed(ownedRecord.red) + (ownedRecord.dynamic ? 1 : 0) + (ownsDiancang(ownedRecord) ? 1 : 0);
}

/** 高分在前。同分保持原來的順序。 */
export function sortByRedScore(list, ownedOf) {
  return list
    .map((general, index) => ({ general, index, score: redSortScore(ownedOf(general)) }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((item) => item.general);
}

export function matchesOwnedRed(ownedRecord, selected) {
  const choice = activeChoice(selected, RED_FILTERS);
  if (!choice) return true;
  return choice.has(String(clampRed(ownedRecord?.red)));
}

/** 武將列表與隊伍卡片共用：紅 0、未開動態、未標典藏都不顯示。 */
export function ownedStatusLabels(ownedRecord) {
  if (!ownedRecord) return [];
  const labels = [];
  if (ownedRecord.dynamic) labels.push('動態');
  if (ownsDiancang(ownedRecord)) labels.push('典藏');
  if (ownedRecord.red > 0) labels.push(`紅${ownedRecord.red}`);
  return labels;
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
  const byDuweiThenName = (a, b) => {
    const duweiDiff = Number(isDuwei(a)) - Number(isDuwei(b));
    if (duweiDiff) return duweiDiff;
    return a.name.localeCompare(b.name, 'zh-Hant');
  };
  const byCampThenName = (a, b) => {
    const campDiff = campIndex(a.camp) - campIndex(b.camp);
    if (campDiff) return campDiff;
    return byDuweiThenName(a, b);
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
      return byDuweiThenName(a, b);
    }
    if (mode === 'name') return byDuweiThenName(a, b);
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

// 戰法頁可勾選、可裝進傳承槽的來源。圖鑑裡的「賽季」就是賽季商店。
export const INVENTORY_SOURCES = ['傳承', '事件', '賽季', '賽季商店', '自訂'];

export function isInventoryTactic(tactic) {
  return INVENTORY_SOURCES.includes(tactic?.source);
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

/** Picker filter. `owned` defaults to already-owned tactics. */
export function matchesTacticPick(tactic, filters = {}) {
  const type = filters.type || '全部';
  if (type !== '全部' && tactic.type !== type) return false;
  const owned = filters.owned || 'owned';
  if (owned === 'owned' && !filters.isOwned) return false;
  if (owned === 'free' && filters.isOwned) return false;
  const query = String(filters.query || '').trim().toLowerCase();
  if (!query) return true;
  const hay = `${tactic.name} ${tactic.desc} ${tactic.type}`.toLowerCase();
  return hay.includes(query);
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

/** 新隊伍的武將是否已在其他隊伍，或同名卡已上陣。 */
export function generalOverlaps(account, members, generalsById) {
  const usage = indexNameUse(buildUsage(account), generalsById || new Map());
  const hits = [];
  const seen = new Set();
  for (const member of members || []) {
    const generalId = member?.generalId;
    if (!generalId || seen.has(generalId)) continue;
    const general = generalsById?.get(generalId);
    const name = general?.name || member.generalName || generalId;
    const where = usage.generalTeams.get(generalId);
    if (where) {
      seen.add(generalId);
      hits.push({ generalId, name, teamName: where.teamName });
      continue;
    }
    if (!general?.nameKey) continue;
    const outside = (usage.nameTeams.get(general.nameKey) || []).filter((use) => use.generalId !== generalId);
    if (!outside.length) continue;
    seen.add(generalId);
    hits.push({ generalId, name, teamName: outside[0].teamName });
  }
  return hits;
}

export function overlapBlockText(overlaps) {
  if (!overlaps?.length) return '';
  const who = overlaps.map((hit) => `${hit.name}已在「${hit.teamName}」`).join('、');
  return `${who}，不能加入。勾選替代隊伍可略過。`;
}

/** 空槽記住原本的戰法名。槽位重新放上戰法後，那個提示就拿掉。 */
function memberWithLearned(member, learned, fresh = []) {
  const vacated = [0, 1].map((index) => {
    if (learned[index]) return null;
    return clip(fresh[index] || member?.vacated?.[index], 32) || null;
  });
  const next = { ...member, learned };
  if (vacated.some(Boolean)) next.vacated = vacated;
  else delete next.vacated;
  return next;
}

/** 已有隊伍佔滿的戰法從新隊伍拿掉。同一支新隊伍裡的重複不在這裡處理。 */
export function dropUsedTactics(members, usage, tacticsById) {
  const counts = new Map();
  for (const [id, uses] of usage?.tacticUses || []) counts.set(id, uses.length);
  const dropped = [];
  const seen = new Set();
  const next = (members || []).map((member) => {
    if (!member) return member;
    const fresh = [null, null];
    const learned = [0, 1].map((index) => {
      const id = member.learned?.[index] || null;
      if (!id) return null;
      const copies = tacticsById?.get(id)?.copies || 1;
      if ((counts.get(id) || 0) >= copies) {
        const name = tacticsById?.get(id)?.name || id;
        fresh[index] = name;
        if (!seen.has(id)) {
          seen.add(id);
          dropped.push({ id, name });
        }
        return null;
      }
      return id;
    });
    return memberWithLearned(member, learned, fresh);
  });
  return { members: next, dropped };
}

export function tacticDropText(dropped) {
  if (!dropped?.length) return '';
  return `戰法 ${dropped.map((item) => item.name).join('、')} 已在其他隊伍，已從新隊伍移除。`;
}

/** 帳號還沒有的傳承從新隊伍拿掉，槽位留空。 */
export function dropUnownedTactics(members, account, lookup = {}) {
  const tacticName = lookup.tacticName || ((id) => id);
  const dropped = [];
  const seen = new Set();
  const next = (members || []).map((member) => {
    if (!member) return member;
    const fresh = [null, null];
    const learned = [0, 1].map((index) => {
      const id = member.learned?.[index] || null;
      if (!id) return null;
      if (account?.tacticsOwned?.[id]) return id;
      const name = tacticName(id) || id;
      fresh[index] = name;
      if (!seen.has(id)) {
        seen.add(id);
        dropped.push({ id, name });
      }
      return null;
    });
    return memberWithLearned(member, learned, fresh);
  });
  return { members: next, dropped };
}

export function tacticConflictLine(dropped) {
  if (!dropped?.length) return '';
  return `戰法 ${dropped.map((item) => item.name).join('、')} 已在其他隊伍`;
}

/** 帳號還沒有的武將、傳承戰法。圖鑑未收、寫在未收錄裡的戰法也算缺少。兵書不算。 */
export function ownershipGaps(members, account, lookup = {}) {
  const generals = [];
  const tactics = [];
  const seenGenerals = new Set();
  const seenTactics = new Set();
  const generalName = lookup.generalName || ((id) => id);
  const tacticName = lookup.tacticName || ((id) => id);
  for (const member of members || []) {
    if (!member) continue;
    const generalId = member.generalId;
    if (!generalId && member.generalName && !seenGenerals.has(member.generalName)) {
      seenGenerals.add(member.generalName);
      generals.push(member.generalName);
    }
    if (generalId && !account?.owned?.[generalId] && !seenGenerals.has(generalId)) {
      seenGenerals.add(generalId);
      generals.push(member.generalName || generalName(generalId) || generalId);
    }
    for (let index = 0; index < 2; index += 1) {
      if (member.learned?.[index]) continue;
      const name = String(member.learnedNames?.[index] || '').trim();
      const key = `named:${name}`;
      if (!name || seenTactics.has(key)) continue;
      seenTactics.add(key);
      tactics.push(name);
    }
    for (const tacticId of member.learned || []) {
      if (!tacticId || seenTactics.has(tacticId)) continue;
      if (account?.tacticsOwned?.[tacticId]) continue;
      seenTactics.add(tacticId);
      tactics.push(tacticName(tacticId) || tacticId);
    }
    for (const line of member.unlisted || []) {
      const text = String(line || '').trim();
      if (!text.startsWith('戰法 ')) continue;
      const name = text.slice(3).trim();
      const key = `unlisted:${name}`;
      if (!name || seenTactics.has(key)) continue;
      seenTactics.add(key);
      tactics.push(name);
    }
  }
  return { generals, tactics };
}

export function ownershipGapLine(gaps) {
  const parts = [];
  if (gaps?.generals?.length) parts.push(`缺少武將 ${gaps.generals.join('、')}`);
  if (gaps?.tactics?.length) parts.push(`缺少戰法 ${gaps.tactics.join('、')}`);
  return parts.join('；');
}

/** 缺武將才擋下整隊。 */
export function generalGapLine(gaps) {
  if (!gaps?.generals?.length) return '';
  return `缺少武將 ${gaps.generals.join('、')}`;
}

/** 只缺戰法時仍可加入，那些槽位留空。 */
export function tacticGapLine(gaps) {
  if (!gaps?.tactics?.length) return '';
  return `缺少戰法 ${gaps.tactics.join('、')}，加入時留空`;
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

export function removeFromTeamPrompt(name) {
  const who = String(name || '').trim() || '這名武將';
  return `確定要把${who}移出隊伍？`;
}

export function deleteTeamPrompt(name) {
  const title = String(name || '').trim() || '這支隊伍';
  return `確定刪除隊伍「${title}」？此操作無法復原`;
}

/** 列表的左右箭頭：-1 往前，+1 往後。到邊界就不動。 */
export function moveTeam(teams, teamId, dir) {
  if (!Array.isArray(teams)) return teams;
  const index = teams.findIndex((team) => team?.id === teamId);
  const next = index + dir;
  if (index < 0 || next < 0 || next >= teams.length) return teams;
  const copy = teams.slice();
  const hold = copy[index];
  copy[index] = copy[next];
  copy[next] = hold;
  return copy;
}

/** 帳號列表的左右箭頭，語意與隊伍列表相同。 */
export function moveAccount(accounts, accountId, dir) {
  return moveTeam(accounts, accountId, dir);
}

export function teamCost(team, generalsById) {
  return (team.members || []).reduce((sum, member) => {
    if (!member?.generalId) return sum;
    return sum + (generalsById.get(member.generalId)?.cost || 0);
  }, 0);
}

/** 兩個副兵書。舊備份的 secondary 是單一字串，讀成第一格。 */
export function secondarySlots(book) {
  if (!book) return [null, null];
  const raw = book.secondary;
  if (Array.isArray(raw)) return [0, 1].map((index) => cleanId(raw[index]) || null);
  return [cleanId(raw) || null, null];
}

/** 點選或取消一個副兵書。已滿兩個時，新的選項不會再加進去。 */
export function toggleSecondary(slots, id) {
  const next = [slots?.[0] || null, slots?.[1] || null];
  const index = next.indexOf(id);
  if (index >= 0) {
    next[index] = null;
    const kept = next.filter(Boolean);
    return [kept[0] || null, kept[1] || null];
  }
  if (!next[0]) return [id, next[1]];
  if (!next[1]) return [next[0], id];
  return next;
}

/** Next 兵書 step: 體系, then 主兵書, then 副兵書. Both secondaries finish the book. */
export function bingshuStep(book) {
  if (!book?.branch) return 'branch';
  if (!book.primary) return 'primary';
  const [first, second] = secondarySlots(book);
  if (!first || !second) return 'secondary';
  return 'branch';
}

export function bingshuLabel(book, branches) {
  if (!book?.branch) return '';
  const branch = branches.find((item) => item.id === book.branch);
  if (!branch) return '未知兵書';
  const primary = branch.primary.find((item) => item.id === book.primary);
  const names = secondarySlots(book)
    .map((id) => branch.secondary.find((item) => item.id === id)?.name)
    .filter(Boolean);
  return [branch.name, primary?.name, ...names].filter(Boolean).join(' · ');
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
      secondary: secondarySlots(raw.bingshu),
    };
  }
  const base = { generalId, bingshu, vacated: raw.vacated };
  const traits = stringList(raw.traits, 6);
  if (traits.length) base.traits = traits;
  const aptNeed = aptNeedOf(raw.aptNeed);
  if (aptNeed) base.aptNeed = aptNeed;
  return memberWithLearned(base, learned);
}

/** Backup v1 stored 副將、主將、副將. Later backups store 主將 first. */
export function orderTeamMembers(members, backupVersion) {
  const normalized = [0, 1, 2].map((index) => normalizeMember(members?.[index]));
  if (backupVersion === 1) return [normalized[1], normalized[0], normalized[2]];
  return normalized;
}

function normalizeAccount(raw, backupVersion) {
  if (!raw || typeof raw !== 'object') return null;
  const id = cleanId(raw.id);
  if (!id) return null;
  const owned = {};
  if (raw.owned && typeof raw.owned === 'object') {
    for (const [key, value] of Object.entries(raw.owned)) {
      const generalId = cleanId(key);
      if (!generalId || !value || typeof value !== 'object') continue;
      const record = {
        red: clampRed(value.red),
        dynamic: asBool(value.dynamic),
        awaken: asBool(value.awaken),
      };
      const merits = meritIdList(value.merits);
      if (merits.length) record.merits = merits;
      owned[generalId] = record;
    }
  }
  const camps = {};
  if (raw.camps && typeof raw.camps === 'object') {
    for (const [key, value] of Object.entries(raw.camps)) {
      const generalId = cleanId(key);
      if (generalId && value === '漢') camps[generalId] = '漢';
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
      const members = orderTeamMembers(item.members, backupVersion);
      const team = {
        id: teamId,
        name: clip(item?.name, 24) || '未命名隊伍',
        notes: clip(item?.notes, 500),
        substitute: item?.substitute === true,
        members,
      };
      const strategy = stringList(item?.strategy, 1);
      const tricks = trickSlots(item?.tricks);
      if (strategy.length) team.strategy = strategy;
      if (tricks.some(Boolean)) team.tricks = tricks;
      teams.push(team);
    }
  }
  const account = {
    id,
    name: clip(raw.name, 24) || '未命名帳號',
    scenario: normalizeScenario(raw.scenario),
    owned,
    tacticsOwned,
    customTactics,
    teams,
  };
  if (Object.keys(camps).length) account.camps = camps;
  return account;
}

function stringList(value, max = 8) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => clip(item, 24)).filter(Boolean).slice(0, max);
}

/** 奇略固定第 2 到第 6 回合。空格留著，不把後面的往前補。 */
function trickSlots(value) {
  const raw = Array.isArray(value) ? value : [];
  return [0, 1, 2, 3, 4].map((index) => clip(raw[index], 24));
}

export function recordStatus(value) {
  if (value === '待核') return '待核';
  if (value === '已核' || value === '已確認') return '已核';
  return '已核';
}

/** 擁有紀錄裡，換到這個劇本後會被藏起來的名稱。資料本身不刪。 */
export function hiddenScenarioNames(account, scenarioId, lookup = {}) {
  const scenario = normalizeScenario(scenarioId);
  const tactics = [];
  const generals = [];
  for (const id of Object.keys(account?.tacticsOwned || {})) {
    if (!account.tacticsOwned[id]) continue;
    const item = lookup.tactic?.(id);
    if (item && !fitsScenario(item, scenario)) tactics.push(item.name);
  }
  for (const id of Object.keys(account?.owned || {})) {
    const item = lookup.general?.(id);
    if (item && !fitsScenario(item, scenario)) generals.push(item.name);
  }
  return { generals, tactics };
}

/** 劇本推薦隊伍。戰法可以留空；方略與奇略順序分開保存。 */
export function normalizeRecommended(list) {
  if (!Array.isArray(list)) return [];
  const teams = [];
  const seen = new Set();
  for (const raw of list.slice(0, 120)) {
    const id = cleanId(raw?.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const members = [0, 1, 2].map((index) => {
      const member = raw?.members?.[index];
      if (!member || typeof member !== 'object') return null;
      const generalId = cleanId(member.generalId) || null;
      const generalName = clip(member.generalName, 24);
      if (!generalId && !generalName) return null;
      const next = {
        generalId,
        generalName,
        learned: [0, 1].map((slot) => cleanId(member.learned?.[slot]) || null),
        learnedNames: [0, 1].map((slot) => clip(member.learnedNames?.[slot], 40)),
      };
      const bingshu = normalizeBook(member.bingshu);
      if (bingshu) next.bingshu = bingshu;
      const tacticsRaw = clip(member.tacticsRaw, 80);
      const bingshuRaw = clip(member.bingshuRaw, 80);
      if (tacticsRaw) next.tacticsRaw = tacticsRaw;
      if (bingshuRaw) next.bingshuRaw = bingshuRaw;
      const remark = clip(member.remark, 160);
      if (remark) next.remark = remark;
      const traits = stringList(member.traits, 6);
      if (traits.length) next.traits = traits;
      const aptNeed = aptNeedOf(member.aptNeed || member.apt);
      if (aptNeed) next.aptNeed = aptNeed;
      return next;
    });
    const team = {
      id,
      scenario: normalizeScenario(raw.scenario),
      title: clip(raw.title, 40) || '推薦隊伍',
      rank: clip(raw.rank, 8),
      status: recordStatus(raw.status || raw.review),
      strategy: stringList(raw.strategy, 1),
      tricks: raw.tricksBound === false ? stringList(raw.tricks, 8) : trickSlots(raw.tricks),
      members,
    };
    if (raw.tricksBound === false) team.tricksBound = false;
    if (raw.applyReady === false) team.applyReady = false;
    if (raw.origin === 'bahamut') {
      team.origin = 'bahamut';
      team.originLabel = '巴哈玩家版';
    } else if (raw.origin === 'dami') {
      team.origin = 'dami';
      team.originLabel = '大米團隊（截圖）';
    }
    if (raw.scenarioOnly === true) team.scenarioOnly = true;
    const author = clip(raw.author, 24);
    const authorAccount = clip(raw.authorAccount, 32);
    const postedAt = clip(raw.postedAt, 40);
    if (author) team.author = author;
    if (authorAccount) team.authorAccount = authorAccount;
    if (postedAt) team.postedAt = postedAt;
    const source = clip(raw.source, 180);
    const officialSource = clip(raw.officialSource, 180);
    const note = clip(raw.note, 240);
    if (source) team.source = source;
    if (officialSource) team.officialSource = officialSource;
    if (note) team.note = note;
    if (team.rank) {
      team.rankStatus = '待核';
      const rankBasis = clip(raw.rankBasis, 240);
      const rankConfidence = ['低', '中低', '中', '中高'].includes(raw.rankConfidence) ? raw.rankConfidence : '';
      const rankSources = normalizeRankSources(raw.rankSources);
      if (rankBasis) team.rankBasis = rankBasis;
      if (rankConfidence) team.rankConfidence = rankConfidence;
      if (rankSources.length) team.rankSources = rankSources;
    }
    const alternatives = normalizeAlternatives(raw.alternatives);
    if (alternatives.length) team.alternatives = alternatives;
    teams.push(team);
  }
  return teams;
}

function normalizeRankSources(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 4).map((raw) => {
    const url = clip(raw?.url, 180);
    if (!/^https:\/\//.test(url)) return null;
    return { label: clip(raw?.label, 24) || '來源', url };
  }).filter(Boolean);
}

function normalizeAlternatives(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 8).map((raw) => {
    if (!raw || typeof raw !== 'object') return null;
    const item = {
      id: cleanId(raw.id) || '',
      title: clip(raw.title, 40) || '替代配置',
      status: recordStatus(raw.status),
      diffs: (Array.isArray(raw.diffs) ? raw.diffs : []).map((line) => clip(line, 160)).filter(Boolean).slice(0, 8),
    };
    const originLabel = clip(raw.originLabel, 24);
    const author = clip(raw.author, 24);
    const source = clip(raw.source, 180);
    const officialSource = clip(raw.officialSource, 180);
    if (originLabel) item.originLabel = originLabel;
    if (author) item.author = author;
    if (source) item.source = source;
    if (officialSource) item.officialSource = officialSource;
    return item;
  }).filter(Boolean);
}

function aptNeedOf(raw) {
  const troop = clip(raw?.troop, 4);
  const letter = String(raw?.letter || '');
  if (!TROOP_ORDER.includes(troop) || !/^[SABC]$/.test(letter)) return null;
  return { troop, letter };
}

function normalizeBook(raw) {
  if (!raw || typeof raw !== 'object' || !cleanId(raw.branch)) return null;
  return {
    branch: cleanId(raw.branch),
    primary: cleanId(raw.primary) || null,
    secondary: [cleanId(raw.secondary?.[0]) || null, cleanId(raw.secondary?.[1]) || null],
  };
}

function recommendedNotes(rec) {
  const lines = [];
  if (rec.source) lines.push(`來源 ${rec.source}`);
  if (rec.officialSource) lines.push(`官方 ${rec.officialSource}`);
  if (rec.note) lines.push(rec.note);
  for (const member of rec.members || []) {
    if (member?.remark) lines.push(`${member.generalName || ''} ${member.remark}`.trim());
  }
  return clip(lines.join('；'), 500);
}

export function teamFromRecommended(rec, teamId) {
  const label = [rec.rank, rec.title].filter(Boolean).join(' ') || '推薦隊伍';
  const strategy = rec.strategy || [];
  const tricks = rec.tricks || [];
  const team = {
    id: teamId,
    name: clip(label, 24) || '推薦隊伍',
    notes: recommendedNotes(rec),
    substitute: false,
    members: [0, 1, 2].map((index) => {
      const member = rec.members?.[index];
      if (!member?.generalId) return null;
      const learned = [member.learned?.[0] || null, member.learned?.[1] || null];
      const vacated = [0, 1].map((slot) => (learned[slot] ? null : member.learnedNames?.[slot] || null));
      const base = { generalId: member.generalId, bingshu: member.bingshu || null, vacated };
      if (member.traits?.length) base.traits = member.traits;
      if (member.aptNeed) base.aptNeed = member.aptNeed;
      return memberWithLearned(base, learned, vacated);
    }),
  };
  if (strategy.length) team.strategy = strategy;
  if (tricks.length) team.tricks = tricks;
  return team;
}

export function normalizeMeritDefs(list) {
  if (!Array.isArray(list)) return [];
  const merits = [];
  const seen = new Set();
  for (const raw of list.slice(0, 40)) {
    const id = cleanId(raw?.id);
    const name = clip(raw?.name, 24);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    const limits = {};
    const accountLimit = Number(raw?.limits?.account);
    const teamLimit = Number(raw?.limits?.team);
    if (Number.isInteger(accountLimit) && accountLimit > 0) limits.account = accountLimit;
    if (Number.isInteger(teamLimit) && teamLimit > 0) limits.team = teamLimit;
    let effect = null;
    if (raw?.effect?.kind === 'apt' && /^[SABC]$/.test(raw.effect.letter || '')) {
      const troops = Array.isArray(raw.effect.troops)
        ? raw.effect.troops.map((item) => clip(item, 8)).filter((item) => TROOP_ORDER.includes(item))
        : [];
      const skipTags = Array.isArray(raw.effect.skipTags)
        ? raw.effect.skipTags.map((item) => clip(item, 12)).filter(Boolean).slice(0, 8)
        : [];
      effect = {
        kind: 'apt',
        letter: raw.effect.letter,
        troops: troops.length ? troops : null,
        skipTags,
      };
    }
    merits.push({
      id,
      name,
      scenarios: scenarioIdList(raw.scenarios),
      status: recordStatus(raw.status || raw.review),
      excludes: meritIdList(raw.excludes).filter((item) => item !== id),
      limits,
      effect,
    });
  }
  return merits;
}

function scenarioIdList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const raw = String(item || '').trim();
    const id = SCENARIOS.some((row) => row.id === raw)
      ? raw
      : SCENARIOS.find((row) => row.name === raw)?.id;
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

export function normalizeScenarioPack(raw) {
  return {
    weapons: [],
    recommended: normalizeRecommended(raw?.recommended),
    merits: normalizeMeritDefs(raw?.merits),
    hanConvert: normalizeHanConvert(raw?.hanConvert),
  };
}

function normalizeHanConvert(raw) {
  const ids = [];
  const seen = new Set();
  for (const value of Array.isArray(raw?.ids) ? raw.ids : []) {
    const id = cleanId(value);
    if (!id || seen.has(id) || ids.length >= 20) continue;
    seen.add(id);
    ids.push(id);
  }
  return {
    status: '待核',
    source: clip(raw?.source, 180),
    officialPost: clip(raw?.officialPost, 180),
    note: clip(raw?.note, 240),
    ids,
  };
}

export function meritsForScenario(merits, scenarioId) {
  return (merits || []).filter((merit) => fitsScenario(merit, scenarioId));
}

export function effectiveApt(general, ownedRecord, merits) {
  const apt = { ...(general?.apt || {}) };
  const marks = meritIdList(ownedRecord?.merits);
  if (!marks.length) return apt;
  const tags = Array.isArray(general?.tags) ? general.tags : [];
  for (const merit of merits || []) {
    if (!marks.includes(merit.id) || merit.effect?.kind !== 'apt') continue;
    if ((merit.effect.skipTags || []).some((tag) => tags.includes(tag))) continue;
    const troops = merit.effect.troops?.length ? merit.effect.troops : TROOP_ORDER;
    for (const troop of troops) apt[troop] = merit.effect.letter;
  }
  return apt;
}

function exclusionPairs(merits) {
  const pairs = [];
  const seen = new Set();
  for (const merit of merits || []) {
    for (const otherId of merit.excludes || []) {
      const key = [merit.id, otherId].sort().join('\0');
      if (seen.has(key)) continue;
      seen.add(key);
      const other = merits.find((item) => item.id === otherId) || { id: otherId, name: otherId };
      pairs.push([merit, other]);
    }
  }
  return pairs;
}

export function meritWarnings(account, meritDefs) {
  const warnings = [];
  const defs = meritDefs || [];
  const owned = account?.owned || {};
  for (const merit of defs) {
    const holders = Object.keys(owned).filter((id) => meritIdList(owned[id]?.merits).includes(merit.id));
    if (merit.limits?.account && holders.length > merit.limits.account) {
      warnings.push({
        kind: 'account',
        meritId: merit.id,
        name: merit.name,
        limit: merit.limits.account,
        generalIds: holders,
      });
    }
    if (merit.limits?.team) {
      for (const team of account?.teams || []) {
        const inTeam = [];
        for (const member of team?.members || []) {
          const generalId = member?.generalId;
          if (!generalId || inTeam.includes(generalId)) continue;
          if (meritIdList(owned[generalId]?.merits).includes(merit.id)) inTeam.push(generalId);
        }
        if (inTeam.length > merit.limits.team) {
          warnings.push({
            kind: 'team',
            meritId: merit.id,
            name: merit.name,
            teamId: team.id,
            teamName: team.name || '未命名隊伍',
            limit: merit.limits.team,
            generalIds: inTeam,
          });
        }
      }
    }
  }
  for (const [generalId, record] of Object.entries(owned)) {
    const marks = meritIdList(record?.merits);
    for (const [left, right] of exclusionPairs(defs)) {
      if (marks.includes(left.id) && marks.includes(right.id)) {
        warnings.push({
          kind: 'exclude-general',
          generalIds: [generalId],
          a: left.name,
          b: right.name,
        });
      }
    }
  }
  for (const team of account?.teams || []) {
    const present = new Set();
    for (const member of team?.members || []) {
      for (const id of meritIdList(owned[member?.generalId]?.merits)) present.add(id);
    }
    for (const [left, right] of exclusionPairs(defs)) {
      if (present.has(left.id) && present.has(right.id)) {
        warnings.push({
          kind: 'exclude-team',
          teamId: team.id,
          teamName: team.name || '未命名隊伍',
          a: left.name,
          b: right.name,
        });
      }
    }
  }
  return warnings;
}

/** 同一武將或同一戰法出現在兩隊以上。拓·／轉·／精· 與原版 id 不同，不算衝突。 */
export function coexistenceLines(account, nameOf = {}) {
  const generalName = nameOf.general || ((id) => id);
  const tacticName = nameOf.tactic || ((id) => id);
  const nameKeyOf = nameOf.nameKey || (() => '');
  const generals = new Map();
  const names = new Map();
  const tactics = new Map();
  const add = (map, key, teamName) => {
    if (!key) return;
    const list = map.get(key) || [];
    if (!list.includes(teamName)) list.push(teamName);
    map.set(key, list);
  };
  for (const team of account?.teams || []) {
    const teamName = team?.name || '未命名隊伍';
    const seenGeneral = new Set();
    const seenName = new Set();
    const seenTactic = new Set();
    for (const member of team?.members || []) {
      const generalId = member?.generalId;
      if (generalId && !seenGeneral.has(generalId)) {
        seenGeneral.add(generalId);
        add(generals, generalId, teamName);
        const key = nameKeyOf(generalId);
        if (key && !seenName.has(key)) {
          seenName.add(key);
          const bucket = names.get(key) || { teams: [], ids: new Set() };
          if (!bucket.teams.includes(teamName)) bucket.teams.push(teamName);
          bucket.ids.add(generalId);
          names.set(key, bucket);
        }
      }
      for (const tacticId of member?.learned || []) {
        if (!tacticId || seenTactic.has(tacticId)) continue;
        seenTactic.add(tacticId);
        add(tactics, tacticId, teamName);
      }
    }
  }
  const lines = [];
  for (const [id, teams] of generals) {
    if (teams.length < 2) continue;
    lines.push(`武將 ${generalName(id)} 出現在 ${teams.join('、')}`);
  }
  for (const [key, bucket] of names) {
    if (bucket.ids.size < 2 || bucket.teams.length < 2) continue;
    lines.push(`同名武將 ${key} 出現在 ${bucket.teams.join('、')}`);
  }
  for (const [id, teams] of tactics) {
    if (teams.length < 2) continue;
    lines.push(`戰法 ${tacticName(id)} 出現在 ${teams.join('、')}`);
  }
  return lines;
}

export function meritWarningLines(account, meritDefs, nameOf = (id) => id) {
  return meritWarnings(account, meritDefs).map((warning) => {
    const names = (warning.generalIds || []).map((id) => nameOf(id) || id).join('、');
    if (warning.kind === 'account') {
      return `${warning.name}一個帳號最多 ${warning.limit} 名，目前 ${warning.generalIds.length} 名：${names}`;
    }
    if (warning.kind === 'team') {
      return `「${warning.teamName}」的${warning.name}一隊最多 ${warning.limit} 名，目前 ${warning.generalIds.length} 名：${names}`;
    }
    if (warning.kind === 'exclude-general') return `${names}不能同時標${warning.a}與${warning.b}`;
    if (warning.kind === 'exclude-team') return `「${warning.teamName}」不能同時有${warning.a}與${warning.b}`;
    return '';
  }).filter(Boolean);
}

export function normalizeState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: '這不是本工具的備份檔' };
  }
  if (input.kind === 'account') {
    return { ok: false, error: '這是單帳號檔，請到帳號頁載入' };
  }
  const backupVersion = input.backupVersion;
  if (input.app !== APP_ID || (backupVersion !== 1 && backupVersion !== BACKUP_VERSION)) {
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
    const account = normalizeAccount(raw, backupVersion);
    if (!account) return { ok: false, error: '帳號資料不完整' };
    if (seen.has(account.id)) return { ok: false, error: '帳號編號重複' };
    seen.add(account.id);
    accounts.push(account);
  }
  let activeAccountId = cleanId(input.activeAccountId);
  if (!seen.has(activeAccountId)) activeAccountId = accounts[0].id;
  // Prefer updatedAt, then exportedAt. Leave empty for legacy local data so LWW
  // does not invent "now" and accidentally beat a real cloud backup.
  const stamp = input.updatedAt || input.exportedAt || '';
  const updatedAt = backupUpdatedAt({ updatedAt: stamp }) ? String(stamp) : '';
  return {
    ok: true,
    state: {
      app: APP_ID,
      backupVersion: BACKUP_VERSION,
      updatedAt,
      activeAccountId,
      accounts,
    },
  };
}

export function exportPayload(state, catalogVersion) {
  return {
    app: APP_ID,
    backupVersion: BACKUP_VERSION,
    updatedAt: state.updatedAt || new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    catalogVersion,
    activeAccountId: state.activeAccountId,
    accounts: state.accounts,
  };
}

export function exportAccountPayload(account, catalogVersion, options = {}) {
  return {
    app: APP_ID,
    kind: 'account',
    accountVersion: ACCOUNT_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    catalogVersion,
    account: {
      id: account.id,
      name: account.name,
      scenario: normalizeScenario(account.scenario),
      camps: account.camps || {},
      owned: account.owned,
      tacticsOwned: account.tacticsOwned,
      customTactics: account.customTactics,
      teams: options.omitTeams ? [] : account.teams,
    },
  };
}

export function normalizeAccountFile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: '這不是單帳號檔' };
  }
  const looksLikeBackup = Array.isArray(input.accounts) || input.backupVersion != null;
  if (input.kind === 'account' && looksLikeBackup) {
    return { ok: false, error: '這不是單帳號檔' };
  }
  if (looksLikeBackup) {
    return { ok: false, error: '這是整包備份，請到備份頁匯入' };
  }
  if (input.app !== APP_ID || input.kind !== 'account') {
    return { ok: false, error: '這不是單帳號檔' };
  }
  if (input.accountVersion !== ACCOUNT_FILE_VERSION) {
    return { ok: false, error: '這份單帳號的版本不相容' };
  }
  const account = normalizeAccount(input.account, BACKUP_VERSION);
  if (!account) return { ok: false, error: '單帳號資料不完整' };
  return { ok: true, account };
}

export function addAccountFile(state, account, options = {}) {
  if (!state || !Array.isArray(state.accounts) || state.accounts.length >= 30) {
    return { ok: false, error: '帳號數量過多' };
  }
  const id = newId('acct');
  const next = {
    ...account,
    id,
    scenario: normalizeScenario(options.scenario || account.scenario),
    teams: options.omitTeams ? [] : account.teams,
  };
  return {
    ok: true,
    state: {
      ...state,
      activeAccountId: id,
      accounts: [...state.accounts, next],
    },
  };
}

export function replaceAccountFile(state, targetId, account) {
  const index = state?.accounts?.findIndex((item) => item.id === targetId) ?? -1;
  if (index < 0) return { ok: false, error: '找不到要覆寫的帳號' };
  const accounts = state.accounts.slice();
  accounts[index] = { ...account, id: targetId };
  return { ok: true, state: { ...state, accounts } };
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
            generalId: 'liubei',
            learned: ['bamen', 'zanbi'],
            bingshu: { branch: 'jiubian', primary: 'yuanqi', secondary: 'lijun' },
          },
          {
            generalId: 'guanyu',
            learned: ['shengqi', null],
            bingshu: { branch: 'xushi', primary: 'yizhi', secondary: 'guimou' },
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
          null,
          {
            generalId: 'zhugeliang',
            learned: [null, null],
            bingshu: { branch: 'xushi', primary: 'houfa', secondary: 'guimou' },
          },
          null,
        ],
      },
    ],
  };
}

export const SHARE_VERSION = 1;
export const SHARE_MAX_LENGTH = 4000;

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function base64UrlToBytes(text) {
  const pad = text.length % 4 === 0 ? '' : '='.repeat(4 - (text.length % 4));
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/') + pad);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function shareError(error) {
  return { ok: false, error };
}

/** 一支隊伍壓成 URL token。只含三人、傳承、兵書，以及這三人的紅度／動態／典藏。 */
export function encodeTeamShare(team, owned = {}) {
  const members = [0, 1, 2].map((index) => {
    const member = team?.members?.[index];
    const generalId = cleanId(member?.generalId);
    if (!generalId) return null;
    const record = owned?.[generalId] || {};
    let book = null;
    const branch = cleanId(member.bingshu?.branch);
    if (branch) {
      const [first, second] = secondarySlots(member.bingshu);
      book = [branch, cleanId(member.bingshu.primary) || '', first || ''];
      if (second) book.push(second);
    }
    return {
      g: generalId,
      r: clampRed(record.red),
      d: record.dynamic ? 1 : 0,
      a: record.awaken ? 1 : 0,
      t: [0, 1].map((slot) => cleanId(member.learned?.[slot]) || ''),
      b: book,
    };
  });
  const payload = {
    v: SHARE_VERSION,
    name: clip(team?.name, 24) || '分享隊伍',
    members,
  };
  const token = `1.${bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))}`;
  if (token.length > SHARE_MAX_LENGTH) return shareError('這支隊伍的分享連結太長');
  return { ok: true, token };
}

/** 從整段網址、#/share/… 或 token 取出分享碼。不執行內容。 */
export function shareTokenFromText(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return '';
  const hash = raw.match(/#\/share\/([^?#\s]+)/);
  const path = hash || raw.match(/(?:^|\/)share\/([^?#\s]+)/);
  if (!path) return raw;
  try {
    return decodeURIComponent(path[1]);
  } catch {
    return path[1];
  }
}

/** 還原分享 token。不執行內容，只接受固定欄位。 */
export function decodeTeamShare(token) {
  if (typeof token !== 'string' || token.length === 0 || token.length > SHARE_MAX_LENGTH) {
    return shareError('分享連結無法讀取');
  }
  const match = /^(\d+)\.([A-Za-z0-9_-]+)$/.exec(token);
  if (!match) return shareError('分享連結無法讀取');
  if (match[1] !== String(SHARE_VERSION)) return shareError('這份分享的版本不相容');
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(match[2])));
  } catch {
    return shareError('分享連結無法讀取');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return shareError('分享連結無法讀取');
  if (parsed.v !== SHARE_VERSION) return shareError('這份分享的版本不相容');
  if (!Array.isArray(parsed.members) || parsed.members.length !== 3) return shareError('分享連結無法讀取');
  const members = [];
  for (const raw of parsed.members) {
    if (raw == null) {
      members.push(null);
      continue;
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) return shareError('分享連結無法讀取');
    const generalId = cleanId(raw.g);
    if (!generalId) return shareError('分享連結無法讀取');
    if (raw.t != null && !Array.isArray(raw.t)) return shareError('分享連結無法讀取');
    if (raw.b != null && (!Array.isArray(raw.b) || raw.b.length > 4)) return shareError('分享連結無法讀取');
    const learned = [0, 1].map((index) => cleanId(raw.t?.[index]) || null);
    let bingshu = null;
    if (raw.b != null) {
      const branch = cleanId(raw.b[0]);
      if (!branch) return shareError('分享連結無法讀取');
      bingshu = {
        branch,
        primary: cleanId(raw.b[1]) || null,
        secondary: [cleanId(raw.b[2]) || null, cleanId(raw.b[3]) || null],
      };
    }
    members.push({
      generalId,
      learned,
      bingshu,
      red: clampRed(raw.r),
      dynamic: raw.d === 1 || raw.d === true,
      awaken: raw.a === 1 || raw.a === true,
    });
  }
  return {
    ok: true,
    share: { name: clip(parsed.name, 24) || '分享隊伍', members },
  };
}

function mergeShareOwned(existing, member) {
  if (!existing) {
    return { red: member.red, dynamic: member.dynamic, awaken: member.awaken };
  }
  return {
    red: Math.max(clampRed(existing.red), member.red),
    dynamic: Boolean(existing.dynamic) || member.dynamic,
    awaken: Boolean(existing.awaken) || member.awaken,
  };
}

/** 缺少清單只列戰法：尚未擁有，或圖鑑沒有。武將、兵書、紅度、動態、典藏都不在這裡。 */
export function shareGaps(share, account, lookup) {
  const missing = [];
  const seen = new Set();
  for (const member of share.members) {
    if (!member) continue;
    for (const tacticId of member.learned) {
      if (!tacticId) continue;
      const name = lookup.tacticName(tacticId);
      const reason = !name ? '圖鑑沒有' : account.tacticsOwned?.[tacticId] ? '' : '未擁有';
      if (!reason) continue;
      const key = `${tacticId}:${reason}`;
      if (seen.has(key)) continue;
      seen.add(key);
      missing.push(name ? { kind: 'tactic', id: tacticId, name, reason } : { kind: 'tactic', id: tacticId, reason });
    }
  }
  return missing;
}

/** 把這一隊加進帳號。紅度、動態、典藏只補不足，不調低。戰法照配置放上，不因此擋下。 */
export function applyTeamShare(account, share, teamId, options = {}) {
  const id = cleanId(teamId);
  if (!id || account.teams.some((team) => team.id === id)) return shareError('分享連結無法讀取');
  if (account.teams.length >= 40) return shareError('隊伍已滿，無法再載入');
  const owned = { ...account.owned };
  const members = share.members.map((member) => {
    if (!member) return null;
    owned[member.generalId] = mergeShareOwned(owned[member.generalId], member);
    return memberWithLearned({
      generalId: member.generalId,
      vacated: member.vacated,
      bingshu: member.bingshu ? { ...member.bingshu } : null,
    }, member.learned.slice());
  });
  return {
    ok: true,
    account: {
      ...account,
      owned,
      teams: [...account.teams, {
        id,
        name: share.name,
        notes: '',
        substitute: options.substitute === true,
        members,
      }],
    },
  };
}

export const TEMPLATE_COUNTRIES = ['魏', '蜀', '吳', '群', '混合'];

export function templateScenarios(teams) {
  const seen = [];
  for (const team of teams || []) {
    if (team?.scenario && !seen.includes(team.scenario)) seen.push(team.scenario);
  }
  return seen;
}

/** T0、T0.5、T1… 由低到高。沒有 T 編號的強度（例如黑科技）排在後面。 */
function templateRankOrder(rank) {
  const match = /^T(\d+(?:\.\d+)?)$/.exec(String(rank || '').trim());
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

/** 已擁有武將的紅度加總。動態、典藏各再加 1。還沒擁有的武將不算。 */
export function templateOwnedRed(template, account) {
  let total = 0;
  const seen = new Set();
  for (const member of template?.members || []) {
    const id = member?.generalId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const owned = account?.owned?.[id];
    if (!owned) continue;
    total += redSortScore(owned);
  }
  return total;
}

/** 反灰的隊伍移到最後，前後兩段各自保持原順序。 */
export function placeBlockedTemplatesLast(teams, isBlocked) {
  const open = [];
  const blocked = [];
  for (const team of teams || []) {
    if (isBlocked?.(team)) blocked.push(team);
    else open.push(team);
  }
  return [...open, ...blocked];
}

/** 強度：T0 在前，同強度再依紅度。紅度：總紅度高的在前，同分再看強度。 */
export function orderTeamTemplates(teams, redOf = () => 0, mode = 'rank') {
  return [...(teams || [])].sort((a, b) => {
    const rankDiff = templateRankOrder(a.rank) - templateRankOrder(b.rank);
    const redDiff = (Number(redOf(b)) || 0) - (Number(redOf(a)) || 0);
    if (mode === 'red') {
      if (redDiff) return redDiff;
      return rankDiff;
    }
    if (rankDiff) return rankDiff;
    return redDiff;
  });
}

/** 劇本、國家用下拉篩選。文字比對隊伍名稱或武將名稱。 */
export function filterTeamTemplates(teams, filters = {}) {
  const scenario = String(filters.scenario || '');
  const country = String(filters.country || '');
  const query = String(filters.query || '').trim();
  return (teams || []).filter((team) => {
    if (scenario && team.scenario !== scenario) return false;
    if (country && team.country !== country) return false;
    if (!query) return true;
    if (String(team.title || '').includes(query)) return true;
    return (team.members || []).some((member) => String(member.generalName || '').includes(query));
  });
}

/** 載入後強度接在隊伍名稱前面。 */
export function templateDisplayName(template) {
  return clip([template?.rank, template?.title].filter(Boolean).join(' '), 24) || '未命名隊伍';
}

/** 載入後加點併進備註。圖鑑沒有的戰法、兵書也留在備註。 */
export function templateNotes(template) {
  const lines = (template?.members || []).map((member) => {
    const main = [member?.points, member?.remark].map((part) => String(part || '').trim()).filter(Boolean).join('、');
    const missing = Array.isArray(member?.unlisted)
      ? member.unlisted.map((part) => String(part || '').trim()).filter(Boolean)
      : [];
    const extra = missing.length ? `未收錄 ${missing.join('、')}` : '';
    const body = [main, extra].filter(Boolean).join('；');
    if (!body) return '';
    const who = String(member?.generalName || '').trim();
    return who ? `${who} ${body}` : body;
  }).filter(Boolean);
  return clip(lines.join('；'), 500);
}

function templateMember(member) {
  if (!member || typeof member !== 'object') return null;
  const generalId = cleanId(member.generalId);
  if (!generalId) return null;
  const learned = [0, 1].map((index) => cleanId(member.learned?.[index]) || null);
  let bingshu = null;
  if (member.bingshu && typeof member.bingshu === 'object' && cleanId(member.bingshu.branch)) {
    bingshu = {
      branch: cleanId(member.bingshu.branch),
      primary: cleanId(member.bingshu.primary) || null,
      secondary: [cleanId(member.bingshu.secondary?.[0]) || null, cleanId(member.bingshu.secondary?.[1]) || null],
    };
  }
  return { generalId, learned, bingshu };
}

export function teamFromTemplate(template, id) {
  return {
    id,
    name: templateDisplayName(template),
    notes: templateNotes(template),
    members: [0, 1, 2].map((index) => templateMember(template?.members?.[index])),
  };
}
