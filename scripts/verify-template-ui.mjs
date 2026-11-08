import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const scenario = require('../data/scenario.json');

const OUT = '/opt/cursor/artifacts';
mkdirSync(OUT, { recursive: true });

const huangma = scenario.recommended.find((team) => team.id === 'baha-d-huangma');
if (!huangma) throw new Error('missing baha-d-huangma');
const official = (huangma.alternatives || []).find((item) => item.id === 'hanyan-huangma');
if (!official) throw new Error('missing official 皇馬 alt');
if ((huangma.alternatives || []).some((item) => item.id === 'baha-d-huangma-gong' || item.title === '皇馬弓')) {
  throw new Error('description-only 皇馬弓 should not be listed');
}

const needIds = new Set();
for (const member of huangma.members || []) if (member?.generalId) needIds.add(member.generalId);
for (const member of official.members || []) if (member?.generalId) needIds.add(member.generalId);

const owned = {};
for (const id of needIds) owned[id] = { red: 5, dynamic: false, awaken: false };
for (const member of official.members || []) {
  for (const tacticId of member.learned || []) {
    if (tacticId) owned[`__ignore_${tacticId}`] = true;
  }
}

const tacticsOwned = {};
for (const member of official.members || []) {
  for (const tacticId of member.learned || []) {
    if (tacticId) tacticsOwned[tacticId] = true;
  }
}

const seed = {
  app: 'sgsz-planner',
  backupVersion: 2,
  updatedAt: new Date().toISOString(),
  activeAccountId: 'acct-verify',
  accounts: [{
    id: 'acct-verify',
    name: '驗證-漢焰',
    scenario: 'hanyan',
    owned,
    tacticsOwned,
    customTactics: [],
    teams: [],
    camps: {},
  }],
};

const chromePath = process.env.CHROME
  || '/home/ubuntu/.cache/ms-playwright/chromium-1140/chrome-linux/chrome';

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
await page.evaluate((state) => {
  localStorage.setItem('sgsz-planner-v1', JSON.stringify(state));
  localStorage.setItem('sgsz-hide-install', '1');
}, seed);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);

for (const sel of ['[data-action="dismiss-install"]', '[data-action="apply-update"]', '[data-action="sync-conflict-later"]']) {
  const btn = page.locator(sel).first();
  if (await btn.count()) {
    try { await btn.click({ timeout: 500 }); } catch { /* ignore */ }
  }
}

await page.goto('http://127.0.0.1:8765/#/teams', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

const openBtn = page.locator('[data-action="open-templates"]').first();
if (!(await openBtn.count())) {
  await page.screenshot({ path: `${OUT}/template-ui-failed-open.png`, fullPage: true });
  throw new Error('could not find 範本 button');
}
await openBtn.click();
await page.waitForSelector('.sheet', { timeout: 5000 });

const scenarioSelect = page.locator('#template-scenario, select[data-action="set-template-scenario"]').first();
if (await scenarioSelect.count()) {
  await scenarioSelect.selectOption({ label: '漢焰長明' }).catch(async () => {
    await scenarioSelect.selectOption('漢焰長明').catch(() => {});
  });
  await page.waitForTimeout(300);
}

const search = page.locator('#template-query, input[placeholder*="隊伍"]').first();
if (await search.count()) {
  await search.fill('皇馬');
  await page.waitForTimeout(400);
}

const card = page.locator('.template-item', { hasText: '皇馬槍' }).first();
await card.waitFor({ timeout: 5000 });
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

const cardText = await card.innerText();
const hasGongAlt = cardText.includes('皇馬弓');
const hasOfficial = cardText.includes('官方整理版');
const altTitles = await card.locator('.alt strong').allTextContents();
await card.screenshot({ path: `${OUT}/verify-huangma-alts.png` });

const joinOfficial = card.locator('.alt', { hasText: '官方整理版' }).locator('button:has-text("加入")').first();
await joinOfficial.click();
await page.waitForTimeout(800);
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(300);

// close sheet if still open
const closeBtn = page.locator('[data-action="close-picker"]').first();
if (await closeBtn.count()) await closeBtn.click().catch(() => {});
await page.waitForTimeout(400);

await page.goto('http://127.0.0.1:8765/#/teams', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const teamCard = page.locator('.team-card, article, .card', { hasText: '官方整理版' }).first();
await teamCard.waitFor({ timeout: 5000 });
await teamCard.scrollIntoViewIfNeeded();
const teamText = await teamCard.innerText();
await teamCard.screenshot({ path: `${OUT}/verify-huangma-official-loaded.png` });
await page.screenshot({ path: `${OUT}/verify-huangma-teams.png`, fullPage: false });

const hasBingshu = /三軍|久戰|統軍|兵書/.test(teamText) || await page.locator('.bingshu, .book-line, [class*="bingshu"]').count() > 0;
const hasJiefan = teamText.includes('解煩衛');
const hasLinwei = teamText.includes('臨危救主');

// Open team detail for clearer bingshu evidence
const openTeam = page.locator('a, button', { hasText: '官方整理版' }).first();
if (await openTeam.count()) {
  await openTeam.click().catch(() => {});
  await page.waitForTimeout(600);
}
const detailText = await page.locator('main, .view, body').first().innerText();
await page.screenshot({ path: `${OUT}/verify-huangma-official-detail.png`, fullPage: false });

const report = {
  version: await page.locator('a[href="#/changelog"], .colophon').first().innerText().catch(() => ''),
  altTitles,
  hasGongAlt,
  hasOfficial,
  cardTextSnippet: cardText.slice(0, 400),
  teamTextSnippet: teamText.slice(0, 500),
  detailHasBingshu: /三軍之眾|久戰|統軍|錘煉|錘鍊/.test(detailText),
  detailHasJiefan: detailText.includes('解煩衛'),
  detailHasLinwei: detailText.includes('臨危救主'),
  hasBingshu,
  hasJiefan,
  hasLinwei,
  pageErrors: errors,
};
report.pass = !report.hasGongAlt
  && report.hasOfficial
  && report.altTitles.length === 1
  && report.detailHasBingshu
  && report.detailHasLinwei
  && !errors.length;

writeFileSync(`${OUT}/template-ui-verify.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
if (!report.pass) process.exit(1);
