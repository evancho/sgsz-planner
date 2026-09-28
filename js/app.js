import {
  CAMP_ORDER,
  COLLECTION_FILTERS,
  COST_BUCKETS,
  DYNAMIC_FILTERS,
  QUALITIES,
  ROLE_FILTERS,
  SORTS,
  TAG_FILTERS,
  TACTIC_TYPES,
  TEAM_POSITIONS,
  TROOP_ORDER,
  activeAccount,
  allTactics,
  bingshuLabel,
  bingshuStep,
  buildUsage,
  compareTactics,
  applyTeamShare,
  decodeTeamShare,
  shareGaps,
  deleteTeamPrompt,
  demoFill,
  emptyAccount,
  encodeTeamShare,
  exportPayload,
  generalBlockReason,
  indexNameUse,
  isDuwei,
  isInventoryTactic,
  matchesGeneral,
  matchesTacticPick,
  newId,
  normalizeState,
  ownedStatusLabels,
  removeFromTeamPrompt,
  setGeneralOwned,
  setTacticOwned,
  sortGenerals,
  tacticBlockReason,
  tacticOwned,
  tacticTroopWarning,
  tacticUseCount,
  teamCost,
  updateAccount,
  usefulInnate,
} from './logic.js';
import { loadState, saveState } from './store.js';

const ui = {
  catalog: null,
  state: null,
  filters: emptyFilters(),
  sort: 'cost-desc',
  quick: 'all',
  query: '',
  tacticQuery: '',
  inheritQuery: '',
  filterOpen: false,
  picker: null,
  bingshu: null,
  shareLink: '',
  shareName: '',
  shareApplied: null,
  dialog: null,
  pendingImport: null,
  draft: { name: '', type: '主動', desc: '' },
  toast: '',
  justOpened: false,
  openGenerals: {},
  nameDraft: {},
  installHidden: localStorage.getItem('sgsz-hide-install') === '1',
};

const CAMP_CLASS = { 魏: 'wei', 蜀: 'shu', 吳: 'wu', 群: 'qun' };

function emptyFilters() {
  return {
    quality: [],
    troop: [],
    camp: [],
    cost: [],
    role: [],
    collection: [],
    dynamic: [],
    tag: [],
  };
}

function plainName(general) {
  return String(general?.name || '').replace(/^典藏/, '');
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function toast(message) {
  ui.toast = message;
  const node = document.querySelector('.toast');
  if (node) node.textContent = message;
  clearTimeout(ui.toastTimer);
  ui.toastTimer = setTimeout(() => {
    ui.toast = '';
    const live = document.querySelector('.toast');
    if (live) live.textContent = '';
  }, 2800);
}

function collapseGeneral(id) {
  if (!id || !ui.openGenerals[id]) return;
  const next = { ...ui.openGenerals };
  delete next[id];
  ui.openGenerals = next;
}

function commit(next) {
  ui.state = next;
  try {
    saveState(ui.state);
  } catch {
    toast('儲存空間不足，這次變更可能沒寫入。');
  }
  render();
}

function account() {
  return activeAccount(ui.state);
}

function generalsById() {
  return ui.catalog.generalsById;
}

function tacticsFor(current = account()) {
  return allTactics(ui.catalog.tactics, current);
}

function tacticsById(current = account()) {
  return new Map(tacticsFor(current).map((tactic) => [tactic.id, tactic]));
}

function usageFor(current = account()) {
  return indexNameUse(buildUsage(current), generalsById());
}

function route() {
  const path = (location.hash || '#/generals').replace(/^#/, '').split('?')[0];
  const parts = path.split('/').filter(Boolean);
  let teamId = '';
  if (parts[0] === 'teams' && parts[1]) {
    try { teamId = decodeURIComponent(parts[1]); } catch { teamId = ''; }
  }
  if (parts[0] === 'accounts') return { name: 'accounts' };
  if (parts[0] === 'tactics' && parts[1] === 'event') return { name: 'tactics', mode: 'event' };
  if (parts[0] === 'tactics' && parts[1] === 'inherit') return { name: 'inherit' };
  if (parts[0] === 'tactics') return { name: 'tactics', mode: 'all' };
  if (parts[0] === 'teams' && parts[1]) return { name: 'team', id: teamId };
  if (parts[0] === 'teams') return { name: 'teams' };
  if (parts[0] === 'share' && parts[1]) {
    let token = '';
    try { token = decodeURIComponent(parts[1]); } catch { token = ''; }
    return { name: 'share', token };
  }
  if (parts[0] === 'backup') return { name: 'backup' };
  if (parts[0] === 'changelog') return { name: 'changelog' };
  return { name: 'generals' };
}

function icon(name) {
  const paths = {
    accounts: '<circle cx="12" cy="8" r="3"/><path d="M5 19c1.2-3 3.4-4.5 7-4.5S17.8 16 19 19"/>',
    generals: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    tactics: '<path d="M7 4h8l4 4v12H7z"/><path d="M15 4v4h4M9 12h6M9 16h6"/>',
    teams: '<circle cx="8" cy="9" r="2"/><circle cx="16" cy="9" r="2"/><circle cx="12" cy="8" r="2"/><path d="M4 19c.8-2.4 2.4-3.5 4.5-3.5M15.5 15.5c2.1 0 3.7 1.1 4.5 3.5M9 16.2c.8-1.4 2-2.2 3.5-2.2S15.2 14.8 16 16.2"/>',
    backup: '<path d="M4 8h16v11H4z"/><path d="M8 8V5h8v3M8 13h8"/>',
  };
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${paths[name]}</svg>`;
}

function shell(body) {
  const current = account();
  const routeName = route().name;
  const here = routeName === 'team' || routeName === 'share' ? 'teams' : routeName === 'inherit' ? 'tactics' : routeName;
  const tabs = [
    ['accounts', '帳號'],
    ['generals', '武將'],
    ['tactics', '戰法'],
    ['teams', '隊伍'],
    ['backup', '備份'],
  ];
  return `
    <div class="shell">
      <header class="top">
        <a class="brand" href="#/generals">
          <span class="mark" aria-hidden="true">陣</span>
          <span>
            <span class="eyebrow">三國志戰略版</span>
            <h1>配將簿</h1>
          </span>
        </a>
        <label class="account-switch">帳號
          <select data-action="switch-account" aria-label="切換帳號">
            ${ui.state.accounts.map((item) => `<option value="${esc(item.id)}" ${item.id === current.id ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}
          </select>
        </label>
      </header>
      ${installBanner()}
      ${updateBanner()}
      <main id="main">${body}</main>
      <nav class="tabbar" aria-label="主要功能">
        ${tabs.map(([id, label]) => `<a href="#/${id}" ${here === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span></a>`).join('')}
      </nav>
      ${overlay()}
      <div class="toast" role="status">${esc(ui.toast)}</div>
    </div>`;
}

function updateBanner() {
  if (!ui.updateReady) return '';
  return `<div class="banner" id="update-banner" role="status"><span>有新版本可用</span><button type="button" class="btn" data-action="apply-update">重新載入</button></div>`;
}

function installBanner() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (ui.installHidden || standalone) return '';
  return `<div class="banner"><span>iPhone 可用 Safari 的「分享 → 加入主畫面」，之後沒網路也能開。</span><button type="button" class="btn-ghost" data-action="dismiss-install">知道了</button></div>`;
}

function overlay() {
  return `${pickerHtml()}${bingshuSheet()}${shareSheet()}${dialogHtml()}`;
}

function colophon() {
  const release = ui.catalog.release;
  const stamp = release ? `${release.version} · ${release.date}` : '';
  return `<p class="colophon">版本 ${stamp ? `<a href="#/changelog">${esc(stamp)}</a>` : '—'} · <a href="#/changelog">更新紀錄</a></p>`;
}

function accountsView() {
  const current = account();
  return `
    <section class="accounts">
      <div class="page-head">
        <div>
          <h2>帳號</h2>
          <p class="sub">每個帳號各自擁有武將、戰法與隊伍。</p>
        </div>
        <button type="button" class="btn primary" data-action="add-account">新增帳號</button>
      </div>
      <div class="account-list">
        ${ui.state.accounts.map((item) => accountCard(item, item.id === current.id)).join('')}
      </div>
      <div class="help-grid">
        ${help('加入主畫面', '用 iPhone Safari 打開這個網站，點分享，再點「加入主畫面」。圖示會像 App 一樣留在桌面，並在第一次載入後離線可用。')}
        ${help('多帳號', '上方選單可直接切換。武將紅度、戰法有無、隊伍都跟著帳號走，不會混在一起。')}
        ${help('備份', '到備份頁下載 JSON。換手機時用「匯入」整包還原，包含全部帳號。')}
        <a class="help-card" href="#/changelog">
          <h3>更新紀錄</h3>
          <p class="help">目前 ${esc(ui.catalog.release?.version || '')} · ${esc(ui.catalog.release?.date || '')}。查看每次更新改了什麼。</p>
        </a>
      </div>
      ${colophon()}
    </section>`;
}

function accountNameValue(item) {
  return Object.prototype.hasOwnProperty.call(ui.nameDraft, item.id) ? ui.nameDraft[item.id] : item.name;
}

function help(title, text) {
  return `<article class="help-card"><h3>${title}</h3><p class="help">${text}</p></article>`;
}

function accountCard(item, active) {
  const owned = Object.keys(item.owned).length;
  const tactics = Object.keys(item.tacticsOwned).length;
  return `
    <article class="account-card">
      <header>
        <label for="nickname-${esc(item.id)}">名稱
          <input class="field" type="text" id="nickname-${esc(item.id)}" name="nickname" data-model="account-name" data-id="${esc(item.id)}" value="${esc(accountNameValue(item))}" maxlength="24" autocomplete="nickname" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" enterkeyhint="done">
        </label>
        ${active ? '<span class="active-pill">使用中</span>' : `<button type="button" class="btn" data-action="use-account" data-id="${esc(item.id)}">切換</button>`}
      </header>
      <p class="counts"><span>武將 ${owned}</span><span>戰法 ${tactics}</span><span>隊伍 ${item.teams.length}</span></p>
      <div class="btn-row">
        <button type="button" class="btn" data-action="ask-demo" data-id="${esc(item.id)}">載入範例配隊</button>
        <button type="button" class="btn-ghost" data-action="ask-delete-account" data-id="${esc(item.id)}">刪除</button>
      </div>
    </article>`;
}

function generalsView() {
  const current = account();
  const usage = usageFor(current);
  const filters = { ...ui.filters, query: ui.query, quick: ui.quick };
  const matched = sortGenerals(
    ui.catalog.generals.filter((general) => matchesGeneral(general, current.owned[general.id], filters, {
      inTeam: usage.generalTeams.has(general.id),
    })),
    ui.sort,
  );
  return `
    <section class="generals-page ${ui.filterOpen ? 'filter-open' : ''}">
      <div class="page-head">
        <div>
          <h2>武將</h2>
          <p class="sub">名將 ${ui.catalog.generals.length} · 已擁有 ${Object.keys(current.owned).length} · 顯示 ${matched.length}</p>
        </div>
        <button type="button" class="btn only-mobile" data-action="open-filter">篩選</button>
      </div>
      <div class="layout">
        ${filterPanel()}
        <div>
          <div class="toolbar">
            <label class="sr" for="general-search">搜尋武將</label>
            <input id="general-search" class="search" data-model="query" value="${esc(ui.query)}" placeholder="搜尋名稱或自帶戰法" autocomplete="off">
            <div class="chips" role="toolbar" aria-label="快速篩選">
              ${quickChip('all', '全部')}
              ${quickChip('owned', '已擁有')}
              ${quickChip('free', '未擁有')}
              ${quickChip('team', '部隊中')}
            </div>
          </div>
          <div class="roster">
            ${matched.map((general) => generalCard(general, current, usage)).join('') || '<div class="empty"><p>沒有符合的武將。</p><p class="faint">圖鑑目前只收名將。把品質改回名將，或清空篩選。</p></div>'}
          </div>
          ${colophon()}
        </div>
      </div>
    </section>`;
}

function quickChip(id, label) {
  return `<button type="button" class="chip" data-action="set-quick" data-value="${id}" aria-checked="${ui.quick === id}">${label}</button>`;
}

function filterPanel() {
  return `
    <aside class="filter-panel" data-scroll="filter">
      <div class="filter-card">
        <div class="row-between">
          <h3>排序</h3>
          <button type="button" class="btn only-mobile" data-action="close-filter">完成</button>
        </div>
        <div class="filter-row"><span>排序</span><div class="chips">${SORTS.map((item) => `<button type="button" class="chip" data-action="set-sort" data-value="${item.id}" aria-checked="${ui.sort === item.id}">${item.label}</button>`).join('')}</div></div>
        ${filterGroup('品質', 'quality', QUALITIES)}
        ${filterGroup('適性A以上', 'troop', TROOP_ORDER)}
        ${filterGroup('陣營', 'camp', CAMP_ORDER)}
        ${filterGroup('都尉', 'tag', TAG_FILTERS)}
        ${filterGroup('COST', 'cost', COST_BUCKETS)}
        ${filterGroup('類型', 'role', ROLE_FILTERS)}
        ${filterGroup('典藏', 'collection', COLLECTION_FILTERS)}
        ${filterGroup('動態形象', 'dynamic', DYNAMIC_FILTERS)}
        <div class="btn-row" style="margin-top:12px">
          <button type="button" class="btn" data-action="filter-all">全部選擇</button>
          <button type="button" class="btn-ghost" data-action="filter-clear">清除</button>
        </div>
      </div>
    </aside>`;
}

function filterGroup(label, key, values) {
  return `
    <div class="filter-row">
      <span>${label}</span>
      <div class="chips">
        ${values.map((value) => `<button type="button" class="chip" data-action="toggle-filter" data-group="${key}" data-value="${esc(value)}" aria-checked="${ui.filters[key].includes(value)}">${esc(value)}</button>`).join('')}
      </div>
    </div>`;
}

function duweiMark(general) {
  if (!isDuwei(general)) return '';
  return '<span class="mini duwei" title="英雄命示都尉。統御以 7 計，天賦身經百戰可 +1。">都尉</span>';
}

function generalCard(general, current, usage) {
  const owned = current.owned[general.id];
  const where = usage.generalTeams.get(general.id);
  const open = Boolean(owned && ui.openGenerals[general.id]);
  const innate = usefulInnate(general);
  const name = plainName(general);
  const duwei = isDuwei(general);
  const chipHtml = [
    duweiMark(general),
    ownedMarkHtml(owned),
    where ? `<a class="stamp" href="#/teams/${esc(where.teamId)}">部隊中</a>` : '',
  ].filter(Boolean).join('');
  const nameEl = owned
    ? `<button type="button" class="grow-name" data-action="toggle-expand" data-id="${esc(general.id)}" aria-expanded="${open}"><strong>${esc(name)}</strong></button>`
    : `<div class="grow-name"><strong>${esc(name)}</strong></div>`;
  const costTitle = duwei ? '統御 7；天賦身經百戰可 +1' : `統御 ${general.cost}`;
  return `
    <article class="gcard grow ${CAMP_CLASS[general.camp] || 'qun'} ${open ? 'open' : ''} ${chipHtml ? 'has-chips' : ''}">
      <div class="grow-row">
        <span class="camp">${esc(general.camp)}</span>
        <span class="cost" title="${esc(costTitle)}">C${general.cost}</span>
        ${nameEl}
        <div class="apt-row">${aptHtml(general.apt)}</div>
        <button type="button" class="check ${owned ? 'on' : ''}" data-action="toggle-own" data-id="${esc(general.id)}" aria-pressed="${owned ? 'true' : 'false'}"><span class="box"></span>擁有</button>
        ${chipHtml ? `<div class="grow-chips">${chipHtml}</div>` : ''}
      </div>
      ${open ? `<div class="grow-more">${ownedControls(general, owned)}${innate ? `<p class="faint innate">自帶 · ${esc(innate)}</p>` : ''}${duwei ? '<p class="faint">統御以 7 計；天賦身經百戰可 +1。</p>' : ''}</div>` : ''}
    </article>`;
}

function ownedMarkHtml(owned) {
  return ownedStatusLabels(owned).map((label) => `<span class="mini">${esc(label)}</span>`).join('');
}

function aptLabel(troop) {
  return troop === '器械' ? '器' : troop;
}

function aptHtml(apt) {
  return TROOP_ORDER.map((troop) => `<span class="apt apt-${apt[troop]}"><i>${aptLabel(troop)}</i>${apt[troop]}</span>`).join('');
}

function ownedControls(general, owned) {
  const reds = [0, 1, 2, 3, 4, 5].map((red) => `<button type="button" class="pip ${owned.red === red ? 'on' : ''}" data-action="set-red" data-id="${esc(general.id)}" data-red="${red}" aria-label="紅度 ${red}">${red}</button>`).join('');
  return `
    <div class="reds" role="radiogroup" aria-label="紅度"><span class="faint">紅度</span>${reds}</div>
    ${general.dynamic ? seg(general.id, 'dynamic', '動態', owned.dynamic) : ''}
    ${general.awaken ? seg(general.id, 'awaken', '典藏', owned.awaken) : ''}`;
}

function seg(id, flag, label, on) {
  return `
    <div class="seg" role="group" aria-label="${label}">
      <span class="faint">${label}</span>
      <button type="button" class="chip ${on ? 'on' : ''}" data-action="set-flag" data-id="${esc(id)}" data-flag="${flag}" data-value="1" aria-checked="${on}">有</button>
      <button type="button" class="chip ${!on ? 'on' : ''}" data-action="set-flag" data-id="${esc(id)}" data-flag="${flag}" data-value="0" aria-checked="${!on}">無</button>
    </div>`;
}

function tacticsView(mode) {
  const current = account();
  const usage = usageFor(current);
    const query = ui.tacticQuery.trim().toLowerCase();
  const list = tacticsFor(current).filter((tactic) => {
    if (!isInventoryTactic(tactic)) return false;
    if (mode === 'event' && tactic.source !== '事件') return false;
    if (ui.tacticTab && ui.tacticTab !== '全部' && tactic.type !== ui.tacticTab) return false;
    if (!query) return true;
    return `${tactic.name} ${tactic.desc} ${tactic.type}`.toLowerCase().includes(query);
  }).sort(compareTactics);
  const tabs = ['全部', ...TACTIC_TYPES];
  return `
    <section>
      <div class="page-head">
        <div>
          <h2>${mode === 'event' ? '事件戰法' : '戰法'}</h2>
          <p class="sub">${mode === 'event' ? '賽季事件兌換的戰法。先排 S 級，再排 A 級。勾選代表這個帳號已經有了。' : '這裡列出可勾選的傳承、事件、賽季商店，以及自己新增的戰法。列表先排 S 級，再排 A 級。已裝進隊伍的會變成灰色已佔用，不能再裝第二次。'}</p>
        </div>
      </div>
      <div class="entry-row">
        <a class="btn ${mode === 'all' ? 'primary' : ''}" href="#/tactics">全部戰法</a>
        <a class="btn ${mode === 'event' ? 'primary' : ''}" href="#/tactics/event">事件</a>
        <a class="btn" href="#/tactics/inherit">戰法傳承</a>
        <button type="button" class="btn" data-action="open-add-tactic">新增非橙戰法</button>
      </div>
      <div class="chips" role="tablist" aria-label="戰法類型">
        ${tabs.map((tab) => `<button type="button" class="chip" data-action="set-tab" data-value="${tab}" aria-checked="${(ui.tacticTab || '全部') === tab}">${tab}</button>`).join('')}
      </div>
      <label class="sr" for="tactic-search">搜尋戰法</label>
      <input id="tactic-search" class="search" style="margin:12px 0" data-model="tactic-query" value="${esc(ui.tacticQuery)}" placeholder="搜尋戰法名稱或說明" autocomplete="off">
      <div class="list">
        ${list.map((tactic) => tacticRow(tactic, current, usage)).join('') || '<div class="empty">沒有符合的戰法。</div>'}
      </div>
      ${colophon()}
    </section>`;
}

function seasonChip(tactic) {
  if (tactic.source !== '賽季') return '';
  if (String(tactic.name).startsWith('拓·')) return '<span class="mini season">拓</span>';
  if (String(tactic.name).startsWith('精·')) return '<span class="mini season">精</span>';
  return '<span class="mini season">賽季</span>';
}

function tacticRow(tactic, current, usage) {
  const owned = tacticOwned(current, tactic.id);
  const used = tacticUseCount(usage, tactic.id);
  const copies = tactic.copies || 1;
  const remain = owned ? Math.max(0, copies - used) : 0;
  const state = !owned ? 'none' : used >= copies ? 'used' : 'ready';
  const label = !owned ? '未擁有' : used >= copies ? '已佔用' : '可配置';
  const where = (usage.tacticUses.get(tactic.id) || []).map((use) => {
    const general = generalsById().get(use.generalId);
    return `${use.teamName} · ${general?.name || '未知武將'}`;
  }).join('、');
  return `
    <article class="trow">
      <button type="button" class="check ${owned ? 'on' : ''}" data-action="toggle-tactic" data-id="${esc(tactic.id)}" aria-pressed="${owned}"><span class="box"></span>擁有</button>
      <div class="body">
        <h3>${esc(tactic.name)}
          ${seasonChip(tactic)}
          ${rankTag(tactic)}
          <span class="tag">${esc(tactic.type)}</span>
          <span class="tag ghost">${esc(tactic.source)}</span>
          ${tactic.custom ? '<span class="mini">自訂</span>' : ''}
        </h3>
        <p class="muted">${esc(tactic.desc)}</p>
        ${where ? `<p class="faint">${esc(where)}</p>` : ''}
        ${tactic.custom ? `<button type="button" class="btn-ghost" data-action="ask-delete-custom" data-id="${esc(tactic.id)}">刪除自訂</button>` : ''}
      </div>
      <div class="quota ${state}"><span>${label}</span><b>${remain}/${copies}</b></div>
    </article>`;
}

function rankTag(tactic) {
  if (tactic.rank !== 'S' && tactic.rank !== 'A') return '';
  const grade = tactic.rank === 'S' ? 's' : 'a';
  return `<span class="tag grade-${grade}" aria-label="等級 ${tactic.rank}">${tactic.rank}</span>`;
}

function inheritView() {
  const current = account();
  const query = ui.inheritQuery.trim();
  const list = ui.catalog.tactics.filter((tactic) => tactic.source === '傳承' && (!query || `${tactic.name}${tactic.desc}`.includes(query))).sort(compareTactics);
  return `
    <section>
      <div class="page-head">
        <div>
          <h2>戰法傳承</h2>
          <p class="sub">對照常見傳承來源。這裡只幫這個帳號做記號，不會消耗武將。</p>
        </div>
        <a class="btn" href="#/tactics">返回戰法</a>
      </div>
      <input id="inherit-search" class="search" data-model="inherit-query" value="${esc(ui.inheritQuery)}" placeholder="搜尋傳承戰法" autocomplete="off">
      <div class="list" style="margin-top:12px">
        ${list.map((tactic) => inheritRow(tactic, current)).join('')}
      </div>
      ${colophon()}
    </section>`;
}

function inheritRow(tactic, current) {
  const sources = tactic.from.map((id) => generalsById().get(id)).filter(Boolean);
  const sourceText = sources.length
    ? sources.map((general) => `${plainName(general)}${current.owned[general.id] ? '（已擁有）' : ''}`).join('、')
    : '來源待補，可直接標記';
  const owned = tacticOwned(current, tactic.id);
  return `
    <article class="trow">
      <div class="body">
        <h3>${esc(tactic.name)} ${rankTag(tactic)} <span class="tag">${esc(tactic.type)}</span></h3>
        <p class="muted">${esc(tactic.desc)}</p>
        <p class="faint">常見來源：${esc(sourceText)}</p>
      </div>
      ${owned ? '<span class="mini">已擁有</span>' : `<button type="button" class="btn" data-action="mark-tactic" data-id="${esc(tactic.id)}">標記已擁有</button>`}
    </article>`;
}

function teamsView() {
  const current = account();
  const map = generalsById();
  return `
    <section>
      <div class="page-head">
        <div>
          <h2>隊伍</h2>
          <p class="sub">一隊三名武將。第一位是主將，後面兩位是副將。主戰法固定為自帶，旁邊兩格是傳承。</p>
        </div>
        <button type="button" class="btn primary" data-action="add-team">新增隊伍</button>
      </div>
      <div class="stack">
        ${current.teams.map((team) => teamCard(team, map)).join('') || '<div class="empty"><p>還沒有隊伍。</p><p class="faint">可以先載入範例，或自己新增。</p></div>'}
      </div>
      ${colophon()}
    </section>`;
}

function teamCard(team, map) {
  const names = team.members.map((member) => map.get(member?.generalId)?.name || '空').join(' / ');
  return `
    <article class="team-card">
      <a class="team-card-main" href="#/teams/${esc(team.id)}">
        <div class="row-between"><h3>${esc(team.name)}</h3><span class="cost">統御 ${teamCost(team, map)}</span></div>
        <p>${esc(names)}</p>
        ${team.notes ? `<p class="muted">${esc(team.notes)}</p>` : ''}
      </a>
      <button type="button" class="btn" data-action="share-team" data-id="${esc(team.id)}">分享</button>
    </article>`;
}

function teamView(id) {
  const current = account();
  const team = current.teams.find((item) => item.id === id);
  if (!team) return `<div class="empty"><p>找不到這支隊伍。</p><a href="#/teams">回隊伍列表</a></div>`;
  const map = generalsById();
  return `
    <section>
      ${shareAppliedNote(id)}
      <div class="page-head">
        <div>
          <a class="faint" href="#/teams">隊伍</a>
          <h2><label class="sr" for="team-name">隊伍名稱</label><input id="team-name" class="field" data-model="team-name" data-id="${esc(team.id)}" value="${esc(team.name)}" maxlength="24" autocomplete="off"></h2>
        </div>
        <div class="btn-row">
          <button type="button" class="btn" data-action="share-team" data-id="${esc(team.id)}">分享</button>
          <button type="button" class="btn-ghost" data-action="ask-delete-team" data-id="${esc(team.id)}">刪除隊伍</button>
        </div>
      </div>
      <label>備註
        <textarea id="team-notes" class="notes" data-model="team-notes" data-id="${esc(team.id)}" maxlength="500">${esc(team.notes)}</textarea>
      </label>
      <p class="sub" style="margin:10px 0">統御合計 ${teamCost(team, map)}。數字只供配隊參考，賽季上限不在這裡鎖死。</p>
      <div class="team-grid">
        ${team.members.map((member, slot) => memberCard(team, member, slot, current)).join('')}
      </div>
      ${colophon()}
    </section>`;
}

function shareUrl(token) {
  const url = new URL(location.href);
  url.hash = `#/share/${token}`;
  return url.toString();
}

function shareGapLines(share, current) {
  return shareGaps(share, current, {
    hasGeneral: (id) => generalsById().has(id),
    tacticName: (id) => tacticsById(current).get(id)?.name || '',
    hasBranch: (id) => ui.catalog.branches.some((item) => item.id === id),
  }).map((gap) => {
    if (gap.kind === 'general') return `武將 ${gap.id}（圖鑑沒有）`;
    if (gap.kind === 'book') return `兵書 ${gap.id}（圖鑑沒有）`;
    if (gap.reason === '圖鑑沒有') return `戰法 ${gap.id}（圖鑑沒有）`;
    return `戰法 ${gap.name}（未擁有）`;
  });
}

function shareMissingHtml(lines) {
  const items = lines.length ? lines.map((line) => `<li>${esc(line)}</li>`).join('') : '<li>無</li>';
  return `<p class="share-missing-label">缺少：</p><ul class="share-missing">${items}</ul>`;
}

function shareAppliedNote(teamId) {
  const note = ui.shareApplied;
  if (!note || note.teamId !== teamId) return '';
  return `
    <div class="help-card share-applied">
      <h3>已套用</h3>
      <p>「${esc(note.name)}」已加進這個帳號。其他隊伍沒有被取代。</p>
      ${shareMissingHtml(note.missing)}
      <button type="button" class="btn" data-action="dismiss-share-applied">知道了</button>
    </div>`;
}

function shareMarks(member) {
  return ownedStatusLabels({
    red: member.red,
    dynamic: member.dynamic,
    awaken: member.awaken,
  }).join(' · ');
}

function shareView(token) {
  const decoded = decodeTeamShare(token);
  if (!decoded.ok) {
    return `<section><div class="empty"><p>${esc(decoded.error)}</p><a href="#/teams">回隊伍</a></div></section>`;
  }
  const current = account();
  const generals = generalsById();
  const tactics = tacticsById(current);
  const seen = new Set();
  const cards = decoded.share.members.map((member, index) => {
    if (!member) return `<li><span class="tag">${TEAM_POSITIONS[index]}</span> 這個位置是空的。</li>`;
    if (seen.has(member.generalId)) seen.add(`dup:${member.generalId}`);
    seen.add(member.generalId);
    const general = generals.get(member.generalId);
    const tacticNames = member.learned.map((id) => {
      if (!id) return '';
      const tactic = tactics.get(id);
      return tactic ? tactic.name : id;
    }).filter(Boolean);
    let book = '';
    if (member.bingshu) {
      const known = ui.catalog.branches.some((item) => item.id === member.bingshu.branch);
      book = known ? bingshuLabel(member.bingshu, ui.catalog.branches) : member.bingshu.branch;
    }
    const marks = shareMarks(member);
    const name = general ? plainName(general) : member.generalId;
    return `<li><span class="tag">${TEAM_POSITIONS[index]}</span> <strong>${esc(name)}</strong>${marks ? ` · ${esc(marks)}` : ''}${tacticNames.length ? `<br>傳承 ${esc(tacticNames.join('、'))}` : ''}${book ? `<br>兵書 ${esc(book)}` : ''}</li>`;
  }).join('');
  const missing = shareGapLines(decoded.share, current);
  return `
    <section>
      <div class="page-head">
        <div>
          <a class="faint" href="#/teams">隊伍</a>
          <h2>${esc(decoded.share.name)}</h2>
        </div>
      </div>
      <p>只會把「${esc(decoded.share.name)}」這一隊加進帳號「${esc(current.name)}」。上方可以先換帳號。按下之後才會寫入，不會改動已經有的隊伍，也不會還原整份備份。</p>
      <p class="sub">缺少的戰法，以及圖鑑沒有的武將，仍會留在配置裡，不會擋下整隊。</p>
      <div class="help-card share-applied">
        <h3>已套用</h3>
        <p>下面是即將寫入的配置。</p>
        <ol class="share-preview">${cards}</ol>
        ${shareMissingHtml(missing)}
      </div>
      <button type="button" class="btn primary" data-action="load-share">載入此隊伍</button>
      ${colophon()}
    </section>`;
}

function shareSheet() {
  if (!ui.shareLink) return '';
  return sheet('分享隊伍', `
    <p>這條連結只含「${esc(ui.shareName)}」這一隊，不會帶出其他隊伍。對方打開後，還要再按「載入此隊伍」，才會把這一隊加進他當時選中的帳號。</p>
    <label>分享連結
      <input id="share-link" class="field" readonly value="${esc(ui.shareLink)}">
    </label>
    <button type="button" class="btn primary" data-action="copy-share" data-autofocus>複製連結</button>
  `);
}

function memberCard(team, member, slot, current) {
  const general = member ? generalsById().get(member.generalId) : null;
  const books = ui.catalog.branches;
  const label = member?.bingshu ? bingshuLabel(member.bingshu, books) : '';
  const marks = general ? ownedMarkHtml(current.owned[general.id]) : '';
  return `
    <article class="member">
      <div class="member-top">
        <div class="member-id">
          <span class="tag">${TEAM_POSITIONS[slot]}</span>
          ${general ? `
            <h3>${esc(plainName(general))}${duweiMark(general)}</h3>
            <span class="member-meta">${esc(general.camp)} · C${general.cost}${isDuwei(general) ? '（天賦可 +1）' : ''} · ${esc(general.role)}</span>
            <div class="apt-row">${aptHtml(general.apt)}</div>
            ${marks ? `<div class="member-marks">${marks}</div>` : ''}
          ` : ''}
        </div>
        <span class="member-move">
          <button type="button" class="icon-btn" data-action="move-member" data-team="${esc(team.id)}" data-slot="${slot}" data-dir="-1" ${slot === 0 ? 'disabled' : ''} aria-label="左移">←</button>
          <button type="button" class="icon-btn" data-action="move-member" data-team="${esc(team.id)}" data-slot="${slot}" data-dir="1" ${slot === 2 ? 'disabled' : ''} aria-label="右移">→</button>
        </span>
      </div>
      ${general ? `
        <div class="member-learn">
          ${learnedButton(team, member, slot, 0)}
          ${learnedButton(team, member, slot, 1)}
        </div>
        <div class="member-actions">
          ${general.role === '內政'
            ? '<p class="faint">內政武將在遊戲裡不能開兵書。</p>'
            : `<button type="button" class="btn ${label ? '' : 'primary'} member-book" data-action="open-bingshu" data-team="${esc(team.id)}" data-slot="${slot}">${label ? `兵書 · ${esc(label)}` : '選擇兵書'}</button>`}
          <button type="button" class="btn-ghost" data-action="ask-clear-general" data-team="${esc(team.id)}" data-slot="${slot}">移出隊伍</button>
        </div>
      ` : member ? `
        <p class="warn">圖鑑沒有 ${esc(member.generalId)}</p>
        <button type="button" class="btn-ghost" data-action="ask-clear-general" data-team="${esc(team.id)}" data-slot="${slot}">移出隊伍</button>
      ` : `
        <p class="muted">這個位置還空著。</p>
        <button type="button" class="slot-btn" data-action="open-general" data-team="${esc(team.id)}" data-slot="${slot}">選擇武將</button>
      `}
    </article>`;
}

function learnedButton(team, member, slot, index) {
  const tacticId = member.learned[index];
  const tactic = tacticId ? tacticsById().get(tacticId) : null;
  const text = tactic ? tactic.name : tacticId ? `未知戰法 ${tacticId}` : '選擇傳承戰法';
  return `<button type="button" class="slot-btn" data-action="open-tactic" data-team="${esc(team.id)}" data-slot="${slot}" data-learned="${index}"><span class="faint">傳承 ${index + 1}</span><strong>${esc(text)}</strong></button>`;
}

function nodeButton(node, on, layer) {
  return `<button type="button" class="node ${on ? 'on' : ''}" data-action="pick-node" data-layer="${layer}" data-node="${esc(node.id)}"><strong>${esc(node.name)}</strong><small>${esc(node.desc)}</small></button>`;
}

function bingshuContext(current = account()) {
  if (!ui.bingshu) return null;
  const team = current.teams.find((item) => item.id === ui.bingshu.teamId);
  const member = team?.members?.[ui.bingshu.slot] || null;
  return { team, member, book: member?.bingshu || null };
}

function bingshuSheet() {
  const ctx = bingshuContext();
  if (!ctx?.team || !ctx.member) return '';
  const general = generalsById().get(ctx.member.generalId);
  if (!general) return '';
  if (general.role === '內政') {
    return sheet(`${plainName(general)}的兵書`, `
      <p>內政武將無法開啟兵書。</p>
      <button type="button" class="btn" data-action="close-bingshu">關閉</button>
    `);
  }
  const selected = ctx.book;
  const step = ui.bingshu.step || bingshuStep(selected);
  const branch = ui.catalog.branches.find((item) => item.id === selected?.branch);
  const steps = [
    ['branch', '1 體系', true],
    ['primary', '2 主兵書', Boolean(selected?.branch)],
    ['secondary', '3 副兵書', Boolean(selected?.primary)],
  ];
  const hints = {
    branch: '先選體系。選完會進到主兵書。',
    primary: `體系是${branch?.name || ''}。再選主兵書，點同一項可取消。`,
    secondary: '最後選副兵書。點同一項可取消。',
  };
  let body = '';
  if (step === 'primary' && branch) {
    body = `<div class="nodes">${branch.primary.map((node) => nodeButton(node, selected?.primary === node.id, 'primary')).join('')}</div>`;
  } else if (step === 'secondary' && branch) {
    body = `<div class="nodes">${branch.secondary.map((node) => nodeButton(node, selected?.secondary === node.id, 'secondary')).join('')}</div>`;
  } else {
    body = `<div class="branches">${ui.catalog.branches.map((item) => `<button type="button" class="branch ${selected?.branch === item.id ? 'on' : ''}" data-action="pick-branch" data-branch="${esc(item.id)}">${esc(item.name)}<small>${esc(item.blurb)}</small></button>`).join('')}</div>`;
  }
  const path = bingshuLabel(selected, ui.catalog.branches);
  return `
    <div class="backdrop" data-action="backdrop-close">
      <section class="sheet bingshu-sheet" role="dialog" aria-modal="true" aria-label="${esc(plainName(general))}的兵書" tabindex="-1" data-autofocus>
        <div class="bingshu-head row-between">
          <h3>${esc(plainName(general))}的兵書</h3>
          <button type="button" class="btn-ghost" data-action="close-bingshu">關閉</button>
        </div>
        <div class="bingshu-steps" role="tablist" aria-label="兵書步驟">
          ${steps.map(([id, label, enabled], index) => `${index ? '<span class="step-arrow" aria-hidden="true">→</span>' : ''}<button type="button" class="chip" data-action="bingshu-step" data-step="${id}" aria-checked="${step === id}" ${enabled ? '' : 'disabled'}>${label}</button>`).join('')}
        </div>
        <p class="faint bingshu-hint">${esc(hints[step] || hints.branch)}</p>
        <div class="bingshu-body">${body}</div>
        <footer class="sheet-foot">
          <p class="path">${esc(path || '還沒選完')}</p>
          <div class="btn-row">
            ${selected ? '<button type="button" class="btn-ghost" data-action="clear-bingshu">清除</button>' : ''}
            <button type="button" class="btn primary" data-action="close-bingshu">完成</button>
          </div>
        </footer>
      </section>
    </div>`;
}

function changelogView() {
  const release = ui.catalog.release || { version: '', date: '', releases: [] };
  const releases = Array.isArray(release.releases) ? release.releases : [];
  return `
    <section>
      <div class="page-head">
        <div>
          <h2>更新紀錄</h2>
          <p class="sub">目前 ${esc(release.version)} · ${esc(release.date)}</p>
        </div>
        <a class="btn" href="#/accounts">返回帳號</a>
      </div>
      <div class="stack">
        ${releases.map((item, index) => `
          <article class="help-card release">
            <h3>${esc(item.version)} <span class="mini">${esc(item.date)}</span>${index === 0 ? ' <span class="active-pill">目前</span>' : ''}</h3>
            <ul class="changes">${(item.changes || []).map((line) => `<li>${esc(line)}</li>`).join('')}</ul>
          </article>`).join('') || '<div class="empty">還沒有更新紀錄。</div>'}
      </div>
      ${colophon()}
    </section>`;
}

function backupView() {
  const payload = JSON.stringify(exportPayload(ui.state, ui.catalog.version), null, 2);
  return `
    <section>
      <div class="page-head">
        <div>
          <h2>備份</h2>
          <p class="sub">匯出包含全部帳號。匯入會取代這台裝置上的配將資料。</p>
        </div>
      </div>
      <div class="backup-grid">
        <article class="panel" style="padding:14px">
          <h3>匯出</h3>
          <p class="muted">可以下載，也可以全選複製。</p>
          <textarea id="backup-text" readonly>${esc(payload)}</textarea>
          <div class="btn-row" style="margin-top:10px">
            <button type="button" class="btn primary" data-action="download-backup">下載 JSON</button>
          </div>
        </article>
        <article class="panel" style="padding:14px">
          <h3>匯入</h3>
          <label class="btn" style="display:inline-block">選擇檔案
            <input id="import-file" class="sr" type="file" accept="application/json,.json" data-action="import-file">
          </label>
          <label style="display:block;margin-top:10px">或貼上 JSON
            <textarea id="import-text" placeholder="把備份內容貼在這裡"></textarea>
          </label>
          <button type="button" class="btn" data-action="import-text" style="margin-top:10px">從文字匯入</button>
        </article>
      </div>
      ${colophon()}
    </section>`;
}

function pickerHtml() {
  if (!ui.picker) return '';
  if (ui.picker.kind === 'general') return generalPicker();
  if (ui.picker.kind === 'tactic') return tacticPicker();
  if (ui.picker.kind === 'custom') return customPicker();
  return '';
}

function generalPicker() {
  const current = account();
  const team = current.teams.find((item) => item.id === ui.picker.teamId);
  if (!team) return '';
  const usage = usageFor(current);
  const query = ui.picker.query.trim();
  const options = ui.catalog.generals.filter((general) => current.owned[general.id] && (!query || plainName(general).includes(query) || general.name.includes(query) || (isDuwei(general) && '都尉'.includes(query))));
  return sheet('選擇武將', `
    <input id="picker-search" data-autofocus data-model="picker-query" class="search" value="${esc(ui.picker.query)}" placeholder="搜尋已擁有武將" autocomplete="off">
    <button type="button" class="choice" data-action="clear-general" data-team="${esc(team.id)}" data-slot="${ui.picker.slot}">這個位置留空</button>
    ${options.map((general) => {
      const reason = generalBlockReason({
        account: current,
        team,
        slot: ui.picker.slot,
        general,
        generalsById: generalsById(),
        usage,
      });
      return `<button type="button" class="choice" data-action="pick-general" data-id="${esc(general.id)}" ${reason ? 'disabled' : ''}>${esc(general.camp)} C${general.cost} ${esc(plainName(general))}${isDuwei(general) ? ' · 都尉' : ''}${reason ? ` · ${esc(reason)}` : ''}</button>`;
    }).join('') || '<p class="muted">還沒有勾選擁有的武將。</p>'}
  `);
}

function tacticPicker() {
  const current = account();
  const team = current.teams.find((item) => item.id === ui.picker.teamId);
  const member = team?.members[ui.picker.slot];
  const general = member ? generalsById().get(member.generalId) : null;
  if (!team || !member) return '';
  const usage = usageFor(current);
  const map = tacticsById(current);
  const owned = ui.picker.owned || 'owned';
  const type = ui.picker.type || '全部';
  const options = tacticsFor(current).filter((tactic) => isInventoryTactic(tactic) && matchesTacticPick(tactic, {
    query: ui.picker.query,
    type,
    owned,
    isOwned: tacticOwned(current, tactic.id),
  })).sort(compareTactics);
  const ownTabs = [['owned', '已擁有'], ['all', '全部']];
  const typeTabs = ['全部', ...TACTIC_TYPES];
  const empty = owned === 'owned'
    ? '沒有已擁有的戰法。可以改看「全部」。'
    : '沒有符合的戰法。';
  return `
    <div class="backdrop" data-action="backdrop-close">
      <section class="sheet picker-sheet" role="dialog" aria-modal="true" aria-label="選擇傳承戰法" tabindex="-1">
        <div class="picker-head row-between">
          <h3>選擇傳承戰法</h3>
          <button type="button" class="btn-ghost" data-action="close-picker">關閉</button>
        </div>
        <div class="picker-filters">
          <div class="chips" role="tablist" aria-label="擁有狀態">
            ${ownTabs.map(([id, label]) => `<button type="button" class="chip" data-action="set-picker-owned" data-value="${id}" aria-checked="${owned === id}">${label}</button>`).join('')}
          </div>
          <div class="chips" role="tablist" aria-label="戰法類型">
            ${typeTabs.map((tab) => `<button type="button" class="chip" data-action="set-picker-type" data-value="${tab}" aria-checked="${type === tab}">${tab}</button>`).join('')}
          </div>
          <label class="sr" for="picker-search">搜尋戰法</label>
          <input id="picker-search" data-autofocus data-model="picker-query" class="search" value="${esc(ui.picker.query)}" placeholder="搜尋戰法名稱或說明" autocomplete="off">
          <p class="faint picker-count">${options.length} 個戰法</p>
        </div>
        <div class="picker-list">
          <button type="button" class="choice" data-action="pick-tactic" data-id="">卸下這個戰法</button>
          ${options.map((tactic) => {
            const reason = tacticBlockReason({
              account: current,
              team,
              slot: ui.picker.slot,
              learnedIndex: ui.picker.learned,
              tactic,
              general,
              tacticsById: map,
              usage,
            });
            const warning = reason ? '' : tacticTroopWarning(general, tactic);
            return `<button type="button" class="choice" data-action="pick-tactic" data-id="${esc(tactic.id)}" ${reason ? 'disabled' : ''}><strong>${esc(tactic.name)}</strong> ${seasonChip(tactic)} ${rankTag(tactic)} <span class="tag">${esc(tactic.type)}</span>${reason ? ` <span class="faint">${esc(reason)}</span>` : ''}${warning ? `<br><span class="warn">${esc(warning)}</span>` : ''}</button>`;
          }).join('') || `<p class="muted">${empty}</p>`}
        </div>
      </section>
    </div>`;
}

function customPicker() {
  return sheet('新增非橙戰法', `
    <label>名稱<input id="draft-name" data-autofocus class="field" data-model="draft-name" maxlength="24" value="${esc(ui.draft.name)}" autocomplete="off"></label>
    <label>類型<select id="draft-type" class="field" data-action="draft-type">${TACTIC_TYPES.map((type) => `<option ${ui.draft.type === type ? 'selected' : ''}>${type}</option>`).join('')}</select></label>
    <label>說明<textarea id="draft-desc" data-model="draft-desc" maxlength="200">${esc(ui.draft.desc)}</textarea></label>
    <button type="button" class="btn primary" data-action="save-custom">加入此帳號</button>
  `);
}

function sheet(title, body) {
  return `
    <div class="backdrop" data-action="backdrop-close">
      <section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}" data-scroll="sheet" tabindex="-1">
        <div class="row-between"><h3>${esc(title)}</h3><button type="button" class="btn-ghost" data-action="close-picker">關閉</button></div>
        ${body}
      </section>
    </div>`;
}

function dialogHtml() {
  if (!ui.dialog) return '';
  const body = ui.dialog.html || `<p>${esc(ui.dialog.text || '')}</p>`;
  return `
    <div class="backdrop" data-action="backdrop-close">
      <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1">
        <h3 id="dialog-title">${esc(ui.dialog.title)}</h3>
        ${body}
        <div class="btn-row" style="margin-top:12px">
          <button type="button" class="btn primary" data-autofocus data-action="confirm-dialog">${esc(ui.dialog.confirm || '確定')}</button>
          <button type="button" class="btn-ghost" data-action="cancel-dialog">取消</button>
        </div>
      </section>
    </div>`;
}

function view() {
  const here = route();
  if (here.name === 'accounts') return accountsView();
  if (here.name === 'generals') return generalsView();
  if (here.name === 'tactics') return tacticsView(here.mode);
  if (here.name === 'inherit') return inheritView();
  if (here.name === 'teams') return teamsView();
  if (here.name === 'team') return teamView(here.id);
  if (here.name === 'share') return shareView(here.token);
  if (here.name === 'backup') return backupView();
  if (here.name === 'changelog') return changelogView();
  return generalsView();
}

function render() {
  const y = window.scrollY;
  const sheet = document.querySelector('[data-scroll]');
  const sheetKey = sheet?.dataset.scroll || '';
  const sheetY = sheet?.scrollTop || 0;
  const focus = document.activeElement;
  const focusId = focus?.id || '';
  const selection = focus && typeof focus.selectionStart === 'number'
    ? [focus.selectionStart, focus.selectionEnd]
    : null;
  const here = route();
  const titles = {
    accounts: '帳號',
    generals: '武將',
    tactics: '戰法',
    inherit: '戰法傳承',
    teams: '隊伍',
    team: '編隊',
    share: '分享隊伍',
    backup: '備份',
  };
  document.title = `${titles[here.name] || '配將簿'} · 配將簿`;
  document.getElementById('app').innerHTML = shell(view());
  const lock = Boolean(ui.dialog || ui.picker || ui.bingshu || (ui.filterOpen && window.innerWidth < 980));
  document.body.classList.toggle('lock', lock);
  const nextSheet = sheetKey ? document.querySelector(`[data-scroll="${sheetKey}"]`) : null;
  if (nextSheet) nextSheet.scrollTop = sheetY;
  if (ui.justOpened) {
    ui.justOpened = false;
    document.querySelector('[data-autofocus]')?.focus();
  } else if (focusId) {
    const node = document.getElementById(focusId);
    if (node) {
      node.focus();
      if (selection && node.setSelectionRange) {
        try { node.setSelectionRange(selection[0], selection[1]); } catch { /* ignore */ }
      }
    }
  }
  window.scrollTo(0, y);
}

function openDialog(dialog) {
  ui.dialog = dialog;
  ui.justOpened = true;
  render();
}

function onClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if ((action === 'backdrop-close') && event.target !== el) return;
  if (action === 'backdrop-close') {
    ui.dialog = null;
    ui.pendingImport = null;
    ui.picker = null;
    ui.bingshu = null;
    ui.shareLink = '';
    ui.shareName = '';
    render();
    return;
  }
  const current = account();
  switch (action) {
    case 'dismiss-install':
      ui.installHidden = true;
      localStorage.setItem('sgsz-hide-install', '1');
      render();
      break;
    case 'apply-update':
      applyUpdate();
      break;
    case 'add-account': {
      const id = newId('acct');
      const next = {
        ...ui.state,
        activeAccountId: id,
        accounts: [...ui.state.accounts, emptyAccount(id, `帳號${ui.state.accounts.length + 1}`)],
      };
      commit(next);
      toast('已新增帳號');
      break;
    }
    case 'use-account':
      commit({ ...ui.state, activeAccountId: el.dataset.id });
      break;
    case 'ask-delete-account':
      if (ui.state.accounts.length <= 1) {
        toast('至少要留一個帳號');
        render();
        return;
      }
      openDialog({
        kind: 'delete-account',
        id: el.dataset.id,
        title: '刪除帳號',
        text: '這個帳號的武將、戰法與隊伍會一起刪掉。',
        confirm: '刪除',
      });
      break;
    case 'ask-demo':
      openDialog({
        kind: 'demo',
        id: el.dataset.id,
        title: '載入範例配隊',
        text: '會改寫這個帳號的擁有狀態與隊伍。自訂戰法會留著。',
        confirm: '載入',
      });
      break;
    case 'open-filter':
      ui.filterOpen = true;
      ui.justOpened = true;
      render();
      break;
    case 'close-filter':
      ui.filterOpen = false;
      render();
      break;
    case 'filter-all':
      ui.filters = {
        quality: [...QUALITIES],
        troop: [...TROOP_ORDER],
        camp: [...CAMP_ORDER],
        cost: [...COST_BUCKETS],
        role: [...ROLE_FILTERS],
        collection: [...COLLECTION_FILTERS],
        dynamic: [...DYNAMIC_FILTERS],
        tag: [...TAG_FILTERS],
      };
      render();
      break;
    case 'filter-clear':
      ui.filters = emptyFilters();
      render();
      break;
    case 'toggle-filter': {
      const group = ui.filters[el.dataset.group];
      const value = el.dataset.value;
      ui.filters = {
        ...ui.filters,
        [el.dataset.group]: group.includes(value) ? group.filter((item) => item !== value) : [...group, value],
      };
      render();
      break;
    }
    case 'set-sort':
      ui.sort = el.dataset.value;
      render();
      break;
    case 'set-quick':
      ui.quick = el.dataset.value;
      render();
      break;
    case 'toggle-expand': {
      if (event.target.closest('a')) return;
      const id = el.dataset.id;
      ui.openGenerals = { ...ui.openGenerals, [id]: !ui.openGenerals[id] };
      render();
      break;
    }
    case 'toggle-own': {
      const general = generalsById().get(el.dataset.id);
      if (!general) return;
      const owned = !current.owned[general.id];
      if (owned) ui.openGenerals = { ...ui.openGenerals, [general.id]: true };
      else {
        const next = { ...ui.openGenerals };
        delete next[general.id];
        ui.openGenerals = next;
      }
      commit(updateAccount(ui.state, current.id, (item) => setGeneralOwned(item, general, owned)));
      if (!owned) toast('已取消擁有，並從隊伍移出');
      break;
    }
    case 'set-red':
      collapseGeneral(el.dataset.id);
      commit(updateAccount(ui.state, current.id, (item) => ({
        ...item,
        owned: {
          ...item.owned,
          [el.dataset.id]: { ...item.owned[el.dataset.id], red: Number(el.dataset.red) },
        },
      })));
      break;
    case 'set-flag':
      collapseGeneral(el.dataset.id);
      commit(updateAccount(ui.state, current.id, (item) => ({
        ...item,
        owned: {
          ...item.owned,
          [el.dataset.id]: {
            ...item.owned[el.dataset.id],
            [el.dataset.flag]: el.dataset.value === '1',
          },
        },
      })));
      break;
    case 'set-tab':
      ui.tacticTab = el.dataset.value;
      render();
      break;
    case 'toggle-tactic': {
      const id = el.dataset.id;
      const owned = !tacticOwned(current, id);
      commit(updateAccount(ui.state, current.id, (item) => setTacticOwned(item, id, owned)));
      if (!owned) toast('已取消擁有，並從隊伍卸下');
      break;
    }
    case 'mark-tactic':
      commit(updateAccount(ui.state, current.id, (item) => setTacticOwned(item, el.dataset.id, true)));
      toast('已標記擁有');
      break;
    case 'open-add-tactic':
      ui.draft = { name: '', type: '主動', desc: '' };
      ui.picker = { kind: 'custom' };
      ui.justOpened = true;
      render();
      break;
    case 'save-custom':
      saveCustom(current);
      break;
    case 'ask-delete-custom':
      openDialog({
        kind: 'delete-custom',
        id: el.dataset.id,
        title: '刪除自訂戰法',
        text: '若它正裝在隊伍上，會一併卸下。',
        confirm: '刪除',
      });
      break;
    case 'add-team': {
      const id = newId('team');
      commit(updateAccount(ui.state, current.id, (item) => ({
        ...item,
        teams: [...item.teams, { id, name: '新隊伍', notes: '', members: [null, null, null] }],
      })));
      location.hash = `#/teams/${id}`;
      break;
    }
    case 'ask-delete-team': {
      ui.picker = null;
      ui.bingshu = null;
      const team = current.teams.find((item) => item.id === el.dataset.id);
      openDialog({
        kind: 'delete-team',
        id: el.dataset.id,
        title: '刪除隊伍',
        text: deleteTeamPrompt(team?.name),
        confirm: '確定',
      });
      break;
    }
    case 'open-general':
      ui.picker = { kind: 'general', teamId: el.dataset.team, slot: Number(el.dataset.slot), query: '' };
      ui.justOpened = true;
      render();
      break;
    case 'open-tactic':
      ui.bingshu = null;
      ui.picker = {
        kind: 'tactic',
        teamId: el.dataset.team,
        slot: Number(el.dataset.slot),
        learned: Number(el.dataset.learned),
        query: '',
        owned: 'owned',
        type: '全部',
      };
      ui.justOpened = true;
      render();
      break;
    case 'set-picker-owned':
      if (ui.picker?.kind === 'tactic') ui.picker = { ...ui.picker, owned: el.dataset.value };
      render();
      break;
    case 'set-picker-type':
      if (ui.picker?.kind === 'tactic') ui.picker = { ...ui.picker, type: el.dataset.value };
      render();
      break;
    case 'close-picker':
      ui.picker = null;
      ui.shareLink = '';
      ui.shareName = '';
      render();
      break;
    case 'share-team': {
      const team = current.teams.find((item) => item.id === el.dataset.id);
      if (!team) break;
      const encoded = encodeTeamShare(team, current.owned);
      if (!encoded.ok) {
        toast(encoded.error);
        break;
      }
      ui.picker = null;
      ui.bingshu = null;
      ui.shareName = team.name;
      ui.shareLink = shareUrl(encoded.token);
      ui.justOpened = true;
      render();
      break;
    }
    case 'copy-share': {
      const link = ui.shareLink;
      const input = document.getElementById('share-link');
      navigator.clipboard?.writeText(link).then(() => {
        toast('已複製連結');
      }).catch(() => {
        input?.focus();
        input?.select();
        toast('請手動複製連結');
      });
      break;
    }
    case 'load-share': {
      const decoded = decodeTeamShare(route().token || '');
      if (!decoded.ok) {
        toast(decoded.error);
        break;
      }
      const teamId = newId('team');
      const missing = shareGapLines(decoded.share, current);
      const applied = applyTeamShare(current, decoded.share, teamId);
      if (!applied.ok) {
        toast(applied.error);
        break;
      }
      ui.shareApplied = { teamId, name: decoded.share.name, missing };
      commit({
        ...ui.state,
        accounts: ui.state.accounts.map((item) => (item.id === current.id ? applied.account : item)),
      });
      ui.shareLink = '';
      ui.shareName = '';
      location.hash = `#/teams/${teamId}`;
      break;
    }
    case 'dismiss-share-applied':
      ui.shareApplied = null;
      render();
      break;
    case 'pick-general':
      assignGeneral(current, ui.picker.teamId, ui.picker.slot, el.dataset.id);
      break;
    case 'ask-clear-general': {
      ui.picker = null;
      ui.bingshu = null;
      const slot = Number(el.dataset.slot);
      const team = current.teams.find((item) => item.id === el.dataset.team);
      const member = team?.members?.[slot];
      const general = member ? generalsById().get(member.generalId) : null;
      const name = general ? plainName(general) : '';
      openDialog({
        kind: 'clear-general',
        teamId: el.dataset.team,
        slot,
        title: '移出隊伍',
        text: removeFromTeamPrompt(name),
        confirm: '確定',
      });
      break;
    }
    case 'clear-general':
      assignGeneral(current, el.dataset.team, Number(el.dataset.slot), '');
      break;
    case 'pick-tactic':
      assignTactic(current, ui.picker.teamId, ui.picker.slot, ui.picker.learned, el.dataset.id);
      break;
    case 'move-member':
      moveMember(current, el.dataset.team, Number(el.dataset.slot), Number(el.dataset.dir));
      break;
    case 'open-bingshu': {
      ui.picker = null;
      const slot = Number(el.dataset.slot);
      const team = current.teams.find((item) => item.id === el.dataset.team);
      const book = team?.members?.[slot]?.bingshu || null;
      ui.bingshu = { teamId: el.dataset.team, slot, step: bingshuStep(book) };
      ui.justOpened = true;
      render();
      break;
    }
    case 'close-bingshu':
      ui.bingshu = null;
      render();
      break;
    case 'bingshu-step': {
      const ctx = bingshuContext(current);
      const next = el.dataset.step;
      if (next === 'primary' && !ctx?.book?.branch) break;
      if (next === 'secondary' && !ctx?.book?.primary) break;
      ui.bingshu = { ...ui.bingshu, step: next };
      render();
      break;
    }
    case 'pick-branch':
      ui.bingshu = { ...ui.bingshu, step: 'primary' };
      setBingshu(current, (book) => (book?.branch === el.dataset.branch
        ? book
        : { branch: el.dataset.branch, primary: null, secondary: null }));
      break;
    case 'pick-node': {
      const layer = el.dataset.layer;
      const next = el.dataset.node;
      const turningOff = bingshuContext(current)?.book?.[layer] === next;
      if (layer === 'primary') ui.bingshu = { ...ui.bingshu, step: turningOff ? 'primary' : 'secondary' };
      setBingshu(current, (book) => {
        if (!book?.branch) return book;
        return { ...book, [layer]: book[layer] === next ? null : next };
      });
      break;
    }
    case 'clear-bingshu':
      ui.bingshu = { ...ui.bingshu, step: 'branch' };
      setBingshu(current, () => null);
      break;
    case 'download-backup':
      downloadBackup();
      break;
    case 'import-text':
      stageImport(document.getElementById('import-text')?.value || '');
      break;
    case 'confirm-dialog':
      confirmDialog();
      break;
    case 'cancel-dialog':
      ui.dialog = null;
      ui.pendingImport = null;
      render();
      break;
    default:
      break;
  }
}

function onInput(event) {
  const el = event.target;
  const model = el.dataset.model;
  if (!model) return;
  if (model === 'query') ui.query = el.value;
  else if (model === 'tactic-query') ui.tacticQuery = el.value;
  else if (model === 'inherit-query') ui.inheritQuery = el.value;
  else if (model === 'picker-query' && ui.picker) ui.picker = { ...ui.picker, query: el.value };
  else if (model === 'draft-name') ui.draft = { ...ui.draft, name: el.value };
  else if (model === 'draft-desc') ui.draft = { ...ui.draft, desc: el.value };
  else if (model === 'account-name') {
    ui.nameDraft[el.dataset.id] = el.value;
    return;
  } else if (model === 'team-name' || model === 'team-notes') {
    const field = model === 'team-name' ? 'name' : 'notes';
    const value = el.value.slice(0, field === 'name' ? 24 : 500);
    commit(updateAccount(ui.state, account().id, (item) => ({
      ...item,
      teams: item.teams.map((team) => (team.id === el.dataset.id ? { ...team, [field]: value } : team)),
    })));
    return;
  } else return;
  render();
}

function onChange(event) {
  const el = event.target;
  if (el.dataset.action === 'switch-account') {
    commit({ ...ui.state, activeAccountId: el.value });
  } else if (el.dataset.action === 'draft-type') {
    ui.draft = { ...ui.draft, type: el.value };
  } else if (el.dataset.action === 'import-file') {
    const file = el.files?.[0];
    el.value = '';
    if (!file) return;
    file.text().then((text) => stageImport(text)).catch(() => toast('檔案讀取失敗'));
  }
}

function persistAccountName(el) {
  const id = el.dataset.id;
  if (!id) return;
  const name = el.value.trim().slice(0, 24) || '未命名帳號';
  if (el.value !== name) el.value = name;
  delete ui.nameDraft[id];
  const existing = ui.state.accounts.find((item) => item.id === id);
  if (!existing || existing.name === name) return;
  ui.state = updateAccount(ui.state, id, (item) => ({ ...item, name }));
  try {
    saveState(ui.state);
  } catch {
    toast('儲存空間不足，這次變更可能沒寫入。');
  }
  document.querySelectorAll('select[data-action="switch-account"] option').forEach((option) => {
    if (option.value === id) option.textContent = name;
  });
}

function onBlur(event) {
  const el = event.target;
  if (el.dataset.model === 'account-name') persistAccountName(el);
  if (el.dataset.model === 'team-name' && !el.value.trim()) {
    commit(updateAccount(ui.state, account().id, (item) => ({
      ...item,
      teams: item.teams.map((team) => (team.id === el.dataset.id ? { ...team, name: '未命名隊伍' } : team)),
    })));
  }
}

function saveCustom(current) {
  const name = ui.draft.name.trim().slice(0, 24);
  const desc = ui.draft.desc.trim().slice(0, 200);
  if (!name) {
    toast('請先寫戰法名稱');
    return;
  }
  const type = TACTIC_TYPES.includes(ui.draft.type) ? ui.draft.type : '主動';
  const id = newId('c');
  ui.picker = null;
  toast('已加入自訂戰法');
  commit(updateAccount(ui.state, current.id, (item) => ({
    ...item,
    customTactics: [...item.customTactics, { id, name, type, desc }],
    tacticsOwned: { ...item.tacticsOwned, [id]: true },
  })));
}

function mapMembers(current, teamId, slot, recipe) {
  commit(updateAccount(ui.state, current.id, (item) => ({
    ...item,
    teams: item.teams.map((team) => {
      if (team.id !== teamId) return team;
      const members = team.members.slice();
      members[slot] = recipe(members[slot], team);
      return { ...team, members };
    }),
  })));
  ui.picker = null;
}

function assignGeneral(current, teamId, slot, generalId) {
  if (!generalId) {
    mapMembers(current, teamId, slot, () => null);
    return;
  }
  const general = generalsById().get(generalId);
  const team = current.teams.find((item) => item.id === teamId);
  const reason = generalBlockReason({
    account: current,
    team,
    slot,
    general,
    generalsById: generalsById(),
    usage: usageFor(current),
  });
  if (reason) {
    toast(reason);
    return;
  }
  mapMembers(current, teamId, slot, (member) => (
    member?.generalId === generalId ? member : { generalId, learned: [null, null], bingshu: null }
  ));
}

function assignTactic(current, teamId, slot, learnedIndex, tacticId) {
  const team = current.teams.find((item) => item.id === teamId);
  const member = team?.members[slot];
  if (!member) return;
  if (!tacticId) {
    mapMembers(current, teamId, slot, (existing) => {
      const learned = existing.learned.slice();
      learned[learnedIndex] = null;
      return { ...existing, learned };
    });
    return;
  }
  const tactic = tacticsById(current).get(tacticId);
  const reason = tacticBlockReason({
    account: current,
    team,
    slot,
    learnedIndex,
    tactic,
    general: generalsById().get(member.generalId),
    tacticsById: tacticsById(current),
    usage: usageFor(current),
  });
  if (reason) {
    toast(reason);
    return;
  }
  mapMembers(current, teamId, slot, (existing) => {
    const learned = existing.learned.slice();
    learned[learnedIndex] = tacticId;
    return { ...existing, learned };
  });
}

function moveMember(current, teamId, slot, dir) {
  const next = slot + dir;
  if (next < 0 || next > 2) return;
  commit(updateAccount(ui.state, current.id, (item) => ({
    ...item,
    teams: item.teams.map((team) => {
      if (team.id !== teamId) return team;
      const members = team.members.slice();
      const hold = members[slot];
      members[slot] = members[next];
      members[next] = hold;
      return { ...team, members };
    }),
  })));
  if (ui.bingshu?.teamId === teamId) {
    if (ui.bingshu.slot === slot) ui.bingshu = { teamId, slot: next, step: null };
    else if (ui.bingshu.slot === next) ui.bingshu = { teamId, slot, step: null };
  }
}

function setBingshu(current, recipe) {
  if (!ui.bingshu) return;
  const { teamId, slot } = ui.bingshu;
  commit(updateAccount(ui.state, current.id, (item) => ({
    ...item,
    teams: item.teams.map((team) => {
      if (team.id !== teamId) return team;
      const members = team.members.slice();
      const member = members[slot];
      if (!member) return team;
      members[slot] = { ...member, bingshu: recipe(member.bingshu) };
      return { ...team, members };
    }),
  })));
}

function downloadBackup() {
  const payload = exportPayload(ui.state, ui.catalog.version);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `sgsz-planner-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  toast('已下載備份');
}

function stageImport(text) {
  if (text.length > 2_000_000) {
    toast('檔案太大');
    render();
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    toast('JSON 無法讀取');
    render();
    return;
  }
  const result = normalizeState(parsed);
  if (!result.ok) {
    toast(result.error);
    render();
    return;
  }
  ui.pendingImport = result.state;
  const lines = result.state.accounts.map((item) => {
    const owned = Object.keys(item.owned).length;
    return `<li>${esc(item.name)} · 武將 ${owned} · 隊伍 ${item.teams.length}</li>`;
  }).join('');
  openDialog({
    kind: 'import',
    title: '匯入備份',
    html: `<p>這會取代目前所有帳號。</p><ul>${lines}</ul>`,
    confirm: '取代並還原',
  });
}

function confirmDialog() {
  const dialog = ui.dialog;
  ui.dialog = null;
  if (!dialog) return;
  if (dialog.kind === 'delete-account') {
    const accounts = ui.state.accounts.filter((item) => item.id !== dialog.id);
    const activeAccountId = ui.state.activeAccountId === dialog.id ? accounts[0].id : ui.state.activeAccountId;
    commit({ ...ui.state, accounts, activeAccountId });
    toast('已刪除帳號');
    return;
  }
  if (dialog.kind === 'demo') {
    commit(updateAccount(ui.state, dialog.id, (item) => demoFill(item)));
    toast('已載入範例');
    return;
  }
  if (dialog.kind === 'clear-general') {
    assignGeneral(account(), dialog.teamId, dialog.slot, '');
    return;
  }
  if (dialog.kind === 'delete-team') {
    commit(updateAccount(ui.state, account().id, (item) => ({
      ...item,
      teams: item.teams.filter((team) => team.id !== dialog.id),
    })));
    ui.bingshu = null;
    location.hash = '#/teams';
    toast('已刪除隊伍');
    return;
  }
  if (dialog.kind === 'delete-custom') {
    commit(updateAccount(ui.state, account().id, (item) => {
      const cleared = setTacticOwned(item, dialog.id, false);
      return {
        ...cleared,
        customTactics: cleared.customTactics.filter((tactic) => tactic.id !== dialog.id),
      };
    }));
    toast('已刪除自訂戰法');
    return;
  }
  if (dialog.kind === 'import' && ui.pendingImport) {
    ui.state = ui.pendingImport;
    ui.pendingImport = null;
    saveState(ui.state);
    toast('已還原備份');
    render();
  }
}

function bind() {
  document.body.addEventListener('click', onClick);
  document.body.addEventListener('input', onInput);
  document.body.addEventListener('change', onChange);
  document.body.addEventListener('focusout', onBlur);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target?.dataset?.model === 'account-name' && !event.isComposing) {
      event.preventDefault();
      event.target.blur();
      return;
    }
    if (event.key !== 'Escape') return;
    if (ui.dialog) {
      ui.dialog = null;
      ui.pendingImport = null;
    } else if (ui.shareLink) {
      ui.shareLink = '';
      ui.shareName = '';
    }
    else if (ui.picker) ui.picker = null;
    else if (ui.bingshu) ui.bingshu = null;
    else if (ui.filterOpen) ui.filterOpen = false;
    else return;
    render();
  });
  window.addEventListener('hashchange', () => {
    ui.picker = null;
    ui.bingshu = null;
    ui.shareLink = '';
    ui.shareName = '';
    ui.dialog = null;
    ui.pendingImport = null;
    render();
  });
}

async function loadCatalog() {
  const [meta, generals, tactics, bingshu, release] = await Promise.all([
    fetch('./data/meta.json').then((response) => response.json()),
    fetch('./data/generals.json').then((response) => response.json()),
    fetch('./data/tactics.json').then((response) => response.json()),
    fetch('./data/bingshu.json').then((response) => response.json()),
    fetch('./data/version.json').then((response) => response.json()),
  ]);
  return {
    version: meta.catalogVersion,
    release,
    generals: generals.generals,
    tactics: tactics.tactics,
    branches: bingshu.branches,
    generalsById: new Map(generals.generals.map((general) => [general.id, general])),
  };
}

let swRegistration = null;
let updateReload = false;

function showUpdateBanner() {
  ui.updateReady = true;
  if (document.getElementById('update-banner')) return;
  const header = document.querySelector('.top');
  if (!header) return;
  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.id = 'update-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML = '<span>有新版本可用</span><button type="button" class="btn" data-action="apply-update">重新載入</button>';
  header.insertAdjacentElement('afterend', banner);
}

function considerWaitingWorker() {
  if (!navigator.serviceWorker.controller || !swRegistration?.waiting) return;
  showUpdateBanner();
}

function applyUpdate() {
  const naming = document.activeElement;
  if (naming?.dataset?.model === 'account-name') persistAccountName(naming);
  updateReload = true;
  const waiting = swRegistration?.waiting;
  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  location.reload();
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateReload) return;
    updateReload = false;
    location.reload();
  });
  const check = () => {
    if (document.visibilityState !== 'visible' || !swRegistration) return;
    swRegistration.update().catch(() => {});
  };
  document.addEventListener('visibilitychange', check);
  window.addEventListener('focus', check);
  navigator.serviceWorker.register('./sw.js').then((registration) => {
    swRegistration = registration;
    considerWaitingWorker();
    const watch = (worker) => {
      if (!worker) return;
      worker.addEventListener('statechange', () => queueMicrotask(() => considerWaitingWorker()));
    };
    watch(registration.installing);
    registration.addEventListener('updatefound', () => watch(registration.installing));
  }).catch(() => {});
}

async function boot() {
  bind();
  try {
    ui.catalog = await loadCatalog();
    ui.state = loadState();
  } catch (error) {
    document.getElementById('app').innerHTML = `<div class="fatal"><p>圖鑑載入失敗。請連上網路打開一次，之後就能離線使用。</p><p>${esc(error.message || '')}</p></div>`;
    return;
  }
  if (!location.hash) history.replaceState(null, '', '#/generals');
  render();
  registerSW();
}

boot();
