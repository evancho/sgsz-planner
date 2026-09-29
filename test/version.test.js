import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const release = JSON.parse(readFileSync(new URL('../data/version.json', import.meta.url)));
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');

function semver(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  assert.ok(match, value);
  return match.slice(1).map(Number);
}

test('app version is the release shown first', () => {
  assert.equal(release.version, '1.2.22');
  assert.match(release.date, /^\d{8}$/);
  assert.equal(release.releases[0].version, release.version);
  assert.equal(release.releases[0].date, release.date);
  assert.deepEqual(release.releases.map((item) => item.version).slice(0, 3), ['1.2.22', '1.2.21', '1.2.20']);
});

test('each release has a date code and a changelist', () => {
  const seen = new Set();
  let previous = null;
  for (const item of release.releases) {
    assert.equal(seen.has(item.version), false, item.version);
    seen.add(item.version);
    semver(item.version);
    assert.match(item.date, /^\d{8}$/);
    assert.ok(Array.isArray(item.changes) && item.changes.length > 0, item.version);
    for (const line of item.changes) assert.equal(typeof line, 'string');
    if (previous) {
      const [a, b] = [semver(previous), semver(item.version)];
      const newer = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      assert.ok(newer > 0, `${previous} should be newer than ${item.version}`);
    }
    previous = item.version;
    assert.match(changelog, new RegExp(`## \\[${item.version}\\] - ${item.date}`));
  }
});

test('service worker cache matches the app version and precaches it', () => {
  assert.match(sw, new RegExp(`const CACHE = 'sgsz-planner-${release.version}'`));
  assert.match(sw, /\.\/data\/version\.json/);
});
