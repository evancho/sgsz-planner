import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { isInventoryTactic } from '../js/logic.js';

const meta = JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url)));
const generalsFile = JSON.parse(readFileSync(new URL('../data/generals.json', import.meta.url)));
const tacticsFile = JSON.parse(readFileSync(new URL('../data/tactics.json', import.meta.url)));
const bingshu = JSON.parse(readFileSync(new URL('../data/bingshu.json', import.meta.url)));

test('catalog files share one version', () => {
  assert.equal(meta.catalogVersion, '1.2.3');
  assert.equal(generalsFile.catalogVersion, meta.catalogVersion);
  assert.equal(tacticsFile.catalogVersion, meta.catalogVersion);
  assert.equal(bingshu.catalogVersion, meta.catalogVersion);
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, new RegExp(`const CACHE = 'sgsz-planner-${meta.catalogVersion.replaceAll('.', '\\.')}'`));
});

test('戰法 inventory keeps equipable sources and drops innate tactics', () => {
  const sources = new Set(tacticsFile.tactics.map((tactic) => tactic.source));
  assert.deepEqual([...sources].sort(), ['事件', '傳承', '賽季', '自帶'].sort());
  const innate = tacticsFile.tactics.filter((tactic) => tactic.source === '自帶');
  assert.ok(innate.length > 0);
  for (const name of ['先聲奪人', '江天長焰', '扶危定傾']) {
    const tactic = innate.find((item) => item.name === name);
    assert.ok(tactic, name);
    assert.equal(isInventoryTactic(tactic), false);
  }
  for (const source of ['傳承', '事件', '賽季']) {
    const tactic = tacticsFile.tactics.find((item) => item.source === source);
    assert.ok(tactic, source);
    assert.equal(isInventoryTactic(tactic), true);
  }
  assert.equal(isInventoryTactic({ source: '自訂', name: '自訂戰法' }), true);
  assert.equal(isInventoryTactic({ source: '賽季商店', name: '商店戰法' }), true);
  for (const general of generalsFile.generals.filter((item) => item.innate)) {
    assert.equal(typeof general.innate, 'string');
    assert.notEqual(general.innate, '');
  }
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

  const duwei = [
    ['duwei-shenheng', '沈姮', '風焰相形', '指揮'],
    ['duwei-qinxi', '秦溪', '先聲奪人', '指揮'],
    ['duwei-liuqin', '柳沁', '杯弓蛇影', '指揮'],
    ['duwei-xiaozhi', '蕭芷', '堅如磐石', '指揮'],
    ['duwei-chenyi', '陳翊', '劍拔弩張', '指揮'],
    ['duwei-zhoushao', '周劭', '流雲千變', '主動'],
    ['duwei-chenxi', '陳熙', '針鋒相對', '指揮'],
    ['duwei-suxin', '蘇信', '技高一籌', '指揮'],
    ['duwei-huangfuhong', '皇甫宏', '破釜沉舟', '指揮'],
    ['duwei-xuyan', '徐彥', '緩兵之計', '主動'],
    ['duwei-yangqi', '楊琪', '愈戰愈勇', '指揮'],
    ['duwei-machan', '馬禪', '運籌帷幄', '指揮'],
  ];
  for (const [id, name, innate, type] of duwei) {
    const general = generalsFile.generals.find((item) => item.id === id);
    assert.ok(general, id);
    assert.equal(general.name, name);
    assert.equal(general.camp, '群');
    assert.equal(general.cost, 7);
    assert.equal(general.innate, innate);
    assert.deepEqual(general.tags, ['都尉']);
    assert.equal(general.dynamic, false);
    const tactic = tacticsFile.tactics.find((item) => item.name === innate && item.from.includes(id));
    assert.ok(tactic, innate);
    assert.equal(tactic.type, type);
    assert.equal(tactic.source, '自帶');
    assert.equal(tactic.orange, true);
    assert.equal(tactic.rank, 'S');
  }
  for (const name of ['麾軍結陣', '燕人咆哮', '江天長焰', '火燒連營', '威武並昭', '扶危定傾', '傲睨王侯', '精·魚鱗陣', '深謀遠慮', '剛柔並濟']) {
    const tactic = tacticsFile.tactics.find((item) => item.name === name);
    assert.ok(tactic, name);
    assert.equal(tactic.orange, true);
    assert.equal(tactic.rank, 'S');
  }
  assert.equal(tacticsFile.tactics.find((tactic) => tactic.name === '精·魚鱗陣').type, '陣法');
  assert.equal(tacticsFile.tactics.find((tactic) => tactic.id === 'yunchou').name, '運籌決算');
  assert.equal(tacticsFile.tactics.find((tactic) => tactic.name === '運籌帷幄').id, 'yunwei');

  const seasonShop = [
    ['tuo-duohun', '拓·奪魂挾魄', '主動', 'duohun'],
    ['tuo-shibie', '拓·士別三日', '被動', 'shibie'],
    ['tuo-yigua', '拓·以寡敵眾', '被動', 'yigua'],
    ['tuo-jifeng', '拓·疾風驟雨', '主動', 'jifeng'],
    ['jing-yulin', '精·魚鱗陣', '陣法', null],
    ['jing-fengshi', '精·鋒矢陣', '陣法', 'fengshi'],
  ];
  for (const [id, name, type, baseId] of seasonShop) {
    const tactic = tacticsFile.tactics.find((item) => item.id === id);
    assert.ok(tactic, id);
    assert.equal(tactic.name, name);
    assert.equal(tactic.type, type);
    assert.equal(tactic.source, '賽季');
    assert.equal(tactic.rank, 'S');
    assert.equal(tactic.orange, true);
    assert.match(tactic.desc, /英雄命示賽季商店/);
    if (baseId) {
      const base = tacticsFile.tactics.find((item) => item.id === baseId);
      assert.ok(base, baseId);
      assert.equal(base.type, type);
      assert.notEqual(base.name, name);
      assert.notEqual(base.source, '賽季');
    }
  }
  assert.equal(tacticsFile.tactics.some((tactic) => tactic.name.includes('以暴制暴') || tactic.id === 'tuo-yibao'), false);
  assert.equal(byName.get('以寡敵眾').id, 'yigua');
  assert.equal(byName.get('以寡敵眾').type, '被動');
});
