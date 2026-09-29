import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  filterTeamTemplates,
  teamFromTemplate,
  templateDisplayName,
  templateNotes,
  templateScenarios,
} from '../js/logic.js';

const templates = JSON.parse(readFileSync(new URL('../data/team-templates.json', import.meta.url))).teams;
const generals = JSON.parse(readFileSync(new URL('../data/generals.json', import.meta.url))).generals;
const tactics = JSON.parse(readFileSync(new URL('../data/tactics.json', import.meta.url))).tactics;
const branches = JSON.parse(readFileSync(new URL('../data/bingshu.json', import.meta.url))).branches;
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

const generalIds = new Set(generals.map((general) => general.id));
const tacticIds = new Set(tactics.map((tactic) => tactic.id));
const bookIds = new Map();
for (const branch of branches) {
  bookIds.set(branch.id, {
    primary: new Set(branch.primary.map((item) => item.id)),
    secondary: new Set(branch.secondary.map((item) => item.id)),
  });
}

test('service worker precaches template teams', () => {
  assert.match(sw, /\.\/data\/team-templates\.json/);
});

test('常規劇本範本涵蓋五國並能對上圖鑑', () => {
  assert.equal(templates.length, 128);
  assert.deepEqual(templateScenarios(templates), ['常規劇本']);
  const counts = { 魏: 0, 蜀: 0, 吳: 0, 群: 0, 混合: 0 };
  const ids = new Set();
  for (const team of templates) {
    assert.equal(ids.has(team.id), false);
    ids.add(team.id);
    counts[team.country] += 1;
    assert.equal(team.members.length, 3);
    assert.ok(templateDisplayName(team).length <= 24);
    assert.ok(templateNotes(team).length <= 500);
    for (const member of team.members) {
      assert.equal(generalIds.has(member.generalId), true, member.generalName);
      for (const tacticId of member.learned) {
        if (tacticId) assert.equal(tacticIds.has(tacticId), true, tacticId);
      }
      if (!member.bingshu) continue;
      const book = bookIds.get(member.bingshu.branch);
      assert.ok(book, member.bingshu.branch);
      if (member.bingshu.primary) assert.equal(book.primary.has(member.bingshu.primary), true);
      for (const secondary of member.bingshu.secondary) {
        if (secondary) assert.equal(book.secondary.has(secondary), true, secondary);
      }
    }
  }
  assert.deepEqual(counts, { 魏: 26, 蜀: 27, 吳: 22, 群: 20, 混合: 33 });
});

test('載入時強度進隊名、加點進備註', () => {
  const team = templates.find((item) => item.id === 'tpl-001');
  const loaded = teamFromTemplate(team, 'team-1');
  assert.equal(loaded.name, 'T1 荀攸五謀弓');
  assert.equal(loaded.notes, 'SP荀彧 第1速+智、出奇、弓寶物；荀攸 智；賈詡 智');
  assert.deepEqual(loaded.members[0].learned, ['zanbi', 'guagu']);
  assert.equal(loaded.members[0].bingshu.branch, 'shiji');
});

test('圖鑑未收的戰法與兵書留在備註', () => {
  const broken = templates.find((item) => item.id === 'tpl-118');
  const loaded = teamFromTemplate(broken, 'team-broken');
  assert.match(loaded.notes, /呂布/);
  assert.match(loaded.notes, /未收錄 戰法 破甲/);
  assert.equal(loaded.members.find((member) => member.generalId === 'lvbu').learned[1], null);
  const scattered = templates.find((item) => item.id === 'tpl-082');
  const zuoci = teamFromTemplate(scattered, 'team-zuoci');
  assert.match(zuoci.notes, /未收錄 兵書 散仙/);
  const kept = scattered.members.find((member) => member.generalName === '左慈');
  assert.equal(kept.bingshu.secondary[1], null);
});

test('篩選劇本、國家、隊伍名稱與武將名稱', () => {
  const extra = {
    id: 'tpl-extra',
    scenario: '其他劇本',
    country: '魏',
    rank: 'T0',
    title: '測試弓',
    members: [{ generalName: '陸遜' }],
  };
  const all = [...templates, extra];
  assert.equal(filterTeamTemplates(all, { scenario: '常規劇本' }).some((item) => item.id === 'tpl-extra'), false);
  assert.equal(filterTeamTemplates(all, { scenario: '其他劇本' }).length, 1);
  assert.equal(filterTeamTemplates(templates, { country: '蜀' }).every((item) => item.country === '蜀'), true);
  assert.equal(filterTeamTemplates(templates, { country: '蜀' }).some((item) => item.id === 'tpl-001'), false);
  assert.equal(filterTeamTemplates(templates, { query: '五謀弓' }).some((item) => item.id === 'tpl-001'), true);
  assert.equal(filterTeamTemplates(templates, { query: '賈詡' }).some((item) => item.id === 'tpl-001'), true);
  assert.equal(filterTeamTemplates(templates, { query: 'T1' }).some((item) => item.id === 'tpl-001'), false);
  assert.equal(filterTeamTemplates(templates, { country: '群', query: '星彩' }).length, 0);
  assert.ok(filterTeamTemplates(templates, { country: '蜀', query: '星彩' }).length > 0);
});

test('範本先依國家再依強度，T0 在前', () => {
  const listed = filterTeamTemplates(templates, {});
  const countries = ['魏', '蜀', '吳', '群', '混合'];
  let lastCountry = -1;
  for (const team of listed) {
    const index = countries.indexOf(team.country);
    assert.ok(index >= lastCountry, team.id);
    lastCountry = index;
  }
  const rankOrder = (rank) => {
    const match = /^T(\d+(?:\.\d+)?)$/.exec(rank);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  };
  for (const country of countries) {
    const ranks = listed.filter((team) => team.country === country).map((team) => team.rank);
    assert.equal(ranks[0], 'T0');
    for (let index = 1; index < ranks.length; index += 1) {
      assert.ok(rankOrder(ranks[index - 1]) <= rankOrder(ranks[index]), `${country} ${ranks[index - 1]} ${ranks[index]}`);
    }
  }
  const wei = listed.filter((team) => team.country === '魏');
  const fiveHorse = wei.findIndex((team) => team.rank === 'T0' && team.title === '五謀騎');
  const xunyou = wei.findIndex((team) => team.id === 'tpl-001');
  assert.ok(fiveHorse >= 0 && fiveHorse < xunyou);
  const mixed = listed.filter((team) => team.country === '混合').map((team) => team.rank);
  assert.ok(mixed.indexOf('黑科技') > mixed.lastIndexOf('T2'));
});
