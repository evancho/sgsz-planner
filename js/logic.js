export const APP_ID = 'sgsz-planner';
export const BACKUP_VERSION = 2;
export const ACCOUNT_FILE_VERSION = 1;
/** Index 0 is 主將. The following slots are 副將, in list order. */
export const TEAM_POSITIONS = ['主將', '副將', '副將'];
export const CAMP_ORDER = ['魏', '蜀', '吳', '群'];
export const TROOP_ORDER = ['騎', '弓', '槍', '盾', '器械'];
export const QUALITIES = ['名將', '良將', '裨將', '偏將', '軍士'];
export const TACTIC_TYPES = ['指揮', '主動', '突擊', '被動', '兵種', '陣法', '內政'];
export const COST_BUCKETS = ['7+', '6', '5', '4', '3-'];
export const RED_FILTERS = ['0', '1', '2', '3', '4', '5'];
export const DYNAMIC_FILTERS = ['已解鎖', '可解鎖', '無動態'];
export const COLLECTION_FILTERS = ['典藏', '非典藏'];
export const ROLE_FILTERS = ['軍事', '內政'];
export const TAG_FILTERS = ['都尉', '非都尉'];
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
    const ok = [...troops].some((troop) => isAptitudeAtLeastA(general.apt[troop]));
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

/** 已有隊伍佔滿的戰法從新隊伍拿掉。同一支新隊伍裡的重複不在這裡處理。 */
export function dropUsedTactics(members, usage, tacticsById) {
  const counts = new Map();
  for (const [id, uses] of usage?.tacticUses || []) counts.set(id, uses.length);
  const dropped = [];
  const seen = new Set();
  const next = (members || []).map((member) => {
    if (!member) return member;
    const learned = [0, 1].map((index) => {
      const id = member.learned?.[index] || null;
      if (!id) return null;
      const copies = tacticsById?.get(id)?.copies || 1;
      if ((counts.get(id) || 0) >= copies) {
        if (!seen.has(id)) {
          seen.add(id);
          dropped.push({ id, name: tacticsById?.get(id)?.name || id });
        }
        return null;
      }
      return id;
    });
    return { ...member, learned };
  });
  return { members: next, dropped };
}

export function tacticDropText(dropped) {
  if (!dropped?.length) return '';
  return `戰法 ${dropped.map((item) => item.name).join('、')} 已在其他隊伍，已從新隊伍移除。`;
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
    if (generalId && !account?.owned?.[generalId] && !seenGenerals.has(generalId)) {
      seenGenerals.add(generalId);
      generals.push(member.generalName || generalName(generalId) || generalId);
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
  return { generalId, learned, bingshu };
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
      const members = orderTeamMembers(item.members, backupVersion);
      teams.push({
        id: teamId,
        name: clip(item?.name, 24) || '未命名隊伍',
        notes: clip(item?.notes, 500),
        substitute: item?.substitute === true,
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
  const next = { ...account, id, teams: options.omitTeams ? [] : account.teams };
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
    return {
      generalId: member.generalId,
      learned: member.learned.slice(),
      bingshu: member.bingshu ? { ...member.bingshu } : null,
    };
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

function templateCountryOrder(country) {
  const index = TEMPLATE_COUNTRIES.indexOf(country);
  return index === -1 ? TEMPLATE_COUNTRIES.length : index;
}

/** T0、T0.5、T1… 由低到高。沒有 T 編號的強度（例如黑科技）排在後面。 */
function templateRankOrder(rank) {
  const match = /^T(\d+(?:\.\d+)?)$/.exec(String(rank || '').trim());
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

/** 已依國家、強度排好的清單，把反灰的隊伍移到最後，組內順序不變。 */
export function placeBlockedTemplatesLast(teams, isBlocked) {
  const open = [];
  const blocked = [];
  for (const team of teams || []) {
    if (isBlocked?.(team)) blocked.push(team);
    else open.push(team);
  }
  return [...open, ...blocked];
}

/** 劇本、國家用下拉篩選。文字比對隊伍名稱或武將名稱。結果先依國家，再依強度。 */
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
  }).sort((a, b) => {
    const countryDiff = templateCountryOrder(a.country) - templateCountryOrder(b.country);
    if (countryDiff) return countryDiff;
    return templateRankOrder(a.rank) - templateRankOrder(b.rank);
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
