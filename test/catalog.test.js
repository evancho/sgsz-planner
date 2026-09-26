import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const meta = JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url)));
const generalsFile = JSON.parse(readFileSync(new URL('../data/generals.json', import.meta.url)));
const tacticsFile = JSON.parse(readFileSync(new URL('../data/tactics.json', import.meta.url)));
const bingshu = JSON.parse(readFileSync(new URL('../data/bingshu.json', import.meta.url)));

test('catalog files share one version', () => {
  assert.equal(meta.catalogVersion, '1.2.0');
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
    assert.equal(general.name.includes('典藏'), false, general.name);
    assert.equal(general.collection, false);
    assert.notEqual(general.innate, '自帶戰法');
  }
  const sunshangxiang = generalsFile.generals.find((general) => general.id === 'sunshangxiang');
  assert.equal(sunshangxiang.name, '孫尚香');
  assert.equal(sunshangxiang.innate, '梟姬');
  assert.equal(generalsFile.generals.some((general) => general.id.startsWith('diancang-')), false);
  assert.ok(generalsFile.generals.length >= 80);

  const tacticIds = new Set();
  for (const tactic of tacticsFile.tactics) {
    assert.equal(tacticIds.has(tactic.id), false, tactic.id);
    tacticIds.add(tactic.id);
    assert.equal(tactic.orange, true);
    assert.ok(tactic.rank === 'S' || tactic.rank === 'A', tactic.name);
    assert.ok(tactic.desc.length > 0);
    for (const fromId of tactic.from) assert.equal(ids.has(fromId), true, `${tactic.id} -> ${fromId}`);
  }
  const byName = new Map(tacticsFile.tactics.map((tactic) => [tactic.name, tactic]));
  const guagu = byName.get('刮骨療毒');
  const zuoshou = byName.get('坐守孤城');
  assert.equal(guagu.type, '主動');
  assert.equal(guagu.rank, 'S');
  assert.equal(zuoshou.type, '主動');
  assert.equal(zuoshou.rank, 'A');
  assert.equal(byName.has('盛氣凌人'), false);
  assert.equal(byName.get('盛氣凌敵').type, '指揮');
  assert.equal(byName.get('盛氣凌敵').rank, 'S');
  assert.equal(byName.get('太平道法').type, '被動');
  assert.equal(byName.get('太平道法').source, '事件');
  assert.equal(byName.get('士別三日').type, '被動');
  assert.equal(byName.get('白馬義從').troops.includes('弓'), true);
  assert.equal(byName.get('象兵').troops.includes('騎'), true);
  assert.equal(byName.get('青州兵').troops.includes('槍'), true);
  const command = tacticsFile.tactics.filter((tactic) => tactic.type === '指揮').map((tactic) => tactic.name);
  assert.equal(command.includes('刮骨療毒'), false);
  assert.equal(command.includes('坐守孤城'), false);
  assert.ok(tacticsFile.tactics.filter((tactic) => tactic.rank === 'S').length >= 120);
  assert.ok(tacticsFile.tactics.some((tactic) => tactic.type === '陣法' && tactic.name === '八門金鎖陣'));
  assert.ok(bingshu.branches.length === 6);
});
