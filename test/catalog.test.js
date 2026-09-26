import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const meta = JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url)));
const generalsFile = JSON.parse(readFileSync(new URL('../data/generals.json', import.meta.url)));
const tacticsFile = JSON.parse(readFileSync(new URL('../data/tactics.json', import.meta.url)));
const bingshu = JSON.parse(readFileSync(new URL('../data/bingshu.json', import.meta.url)));

test('catalog files share one version', () => {
  assert.equal(meta.catalogVersion, '1.0.0');
  assert.equal(generalsFile.catalogVersion, meta.catalogVersion);
  assert.equal(tacticsFile.catalogVersion, meta.catalogVersion);
  assert.equal(bingshu.catalogVersion, meta.catalogVersion);
});

test('generals and tactics are internally consistent', () => {
  const ids = new Set();
  for (const general of generalsFile.generals) {
    assert.equal(ids.has(general.id), false, general.id);
    ids.add(general.id);
    assert.equal(general.quality, '名將');
    assert.ok(['魏', '蜀', '吳', '群'].includes(general.camp));
    assert.ok(['軍事', '內政'].includes(general.role));
    for (const troop of ['騎', '弓', '槍', '盾', '器械']) {
      assert.match(general.apt[troop], /^[SABC]$/);
    }
    if (general.role === '內政') assert.equal(general.awaken, false);
    if (general.name.startsWith('典藏')) assert.equal(general.collection, true);
  }
  assert.ok(generalsFile.generals.length >= 80);

  const tacticIds = new Set();
  for (const tactic of tacticsFile.tactics) {
    assert.equal(tacticIds.has(tactic.id), false, tactic.id);
    tacticIds.add(tactic.id);
    assert.equal(tactic.orange, true);
    assert.ok(tactic.desc.length > 0);
    for (const fromId of tactic.from) assert.equal(ids.has(fromId), true, `${tactic.id} -> ${fromId}`);
  }
  assert.ok(tacticsFile.tactics.some((tactic) => tactic.type === '陣法' && tactic.name === '八門金鎖陣'));
  assert.ok(bingshu.branches.length === 6);
});
