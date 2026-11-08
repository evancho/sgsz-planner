import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { dropUsedTactics, fitsScenario, generalBlockReason, generalGapLine, generalListed, isInventoryTactic, ownershipGaps, teamFromRecommended } from '../js/logic.js';

const meta = JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url)));
const generalsFile = JSON.parse(readFileSync(new URL('../data/generals.json', import.meta.url)));
const tacticsFile = JSON.parse(readFileSync(new URL('../data/tactics.json', import.meta.url)));
const bingshu = JSON.parse(readFileSync(new URL('../data/bingshu.json', import.meta.url)));
const appRelease = JSON.parse(readFileSync(new URL('../data/version.json', import.meta.url)));

test('catalog files share one version', () => {
  assert.equal(meta.catalogVersion, '1.2.9');
  assert.equal(generalsFile.catalogVersion, meta.catalogVersion);
  assert.equal(tacticsFile.catalogVersion, meta.catalogVersion);
  assert.equal(bingshu.catalogVersion, meta.catalogVersion);
  const scenario = JSON.parse(readFileSync(new URL('../data/scenario.json', import.meta.url)));
  assert.equal(scenario.catalogVersion, meta.catalogVersion);
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, new RegExp(`const CACHE = 'sgsz-planner-${appRelease.version.replaceAll('.', '\\.')}'`));
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
    assert.ok(['名將', '良將', '裨將'].includes(general.quality), general.id);
    assert.ok(['魏', '蜀', '吳', '群', '漢'].includes(general.camp), general.id);
    assert.ok(general.role == null || ['軍事', '內政'].includes(general.role), general.id);
    if (general.status === '待核') assert.match(general.sourceUrl, /^https:\/\//, general.id);
    else if (general.camp !== '漢') assert.equal(general.sourceUrl, '', general.id);
    for (const troop of ['騎', '弓', '槍', '盾', '器械']) {
      if (general.apt[troop] === '待核') {
        assert.equal(general.camp, '漢', `${general.id} ${troop}`);
        continue;
      }
      assert.match(general.apt[troop], /^[SABC]$/, `${general.id} ${troop}`);
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
    if (tactic.quality === '未核') assert.equal(tactic.rank, undefined, tactic.name);
    else assert.ok(tactic.rank === 'S' || tactic.rank === 'A', tactic.name);
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
    assert.equal(tactic.orange, true);
    if (id === 'tuo-duohun') {
      assert.equal(tactic.quality, undefined);
      assert.equal(tactic.rank, 'S');
      assert.equal(tactic.status, '已核');
      assert.equal(tactic.desc.includes('英雄命示'), false);
      assert.equal(tactic.desc.includes('待核'), false);
      assert.equal(tactic.obtain.yingxiong, '賽季商店');
      assert.equal(tactic.obtain.hanyan, '拓印四選一');
      assert.match(tactic.note, /使用者確認 2026-11-08/);
    } else {
      assert.equal(tactic.rank, 'S');
      assert.match(tactic.desc, /英雄命示賽季商店/);
    }
    if (baseId) {
      const base = tacticsFile.tactics.find((item) => item.id === baseId);
      assert.ok(base, baseId);
      assert.equal(base.type, type);
      assert.notEqual(base.name, name);
      assert.notEqual(base.source, '賽季');
    }
  }
  const bingyan = [
    ['xushidai', '蓄勢待發', '指揮', '事件', ['盾', '器械']],
    ['tuo-xushi', '拓·蓄勢待發', '指揮', '賽季', ['盾', '器械']],
    ['tuo-caochuan', '拓·草船借箭', '主動', '賽季', null],
    ['tuo-guagu', '拓·刮骨療毒', '主動', '賽季', null],
    ['jing-lingji', '精·靈機一動', '主動', '賽季', null],
  ];
  for (const [id, name, type, source, troops] of bingyan) {
    const tactic = tacticsFile.tactics.find((item) => item.id === id);
    assert.ok(tactic, id);
    assert.equal(tactic.name, name);
    assert.equal(tactic.type, type);
    assert.equal(tactic.source, source);
    assert.deepEqual(tactic.troops, troops);
    if (id === 'tuo-caochuan' || id === 'tuo-guagu') {
      assert.equal(tactic.quality, undefined);
      assert.equal(tactic.rank, 'S');
      assert.equal(tactic.status, '已核');
      assert.equal(tactic.desc.includes('兵演春秋'), false);
      assert.equal(tactic.desc.includes('待核'), false);
      assert.equal(tactic.obtain.hanyan, '拓印四選一');
      assert.equal(tactic.obtain.yingxiong, '賽季商店');
      assert.match(tactic.note, /使用者確認 2026-11-08/);
    } else {
      assert.equal(tactic.rank, 'S');
      if (source === '賽季') assert.match(tactic.desc, /兵演春秋賽季商店/);
    }
  }
  assert.deepEqual(byName.get('靈機一動').troops, ['騎', '器械']);
  assert.equal(byName.get('精·靈機一動').troops, null);
  assert.notEqual(byName.get('拓·草船借箭').id, byName.get('草船借箭').id);
  assert.notEqual(byName.get('拓·刮骨療毒').id, byName.get('刮骨療毒').id);
  assert.equal(tacticsFile.tactics.some((tactic) => tactic.name.includes('以暴制暴') || tactic.id === 'tuo-yibao'), false);
  assert.equal(byName.get('以寡敵眾').id, 'yigua');
  assert.equal(byName.get('以寡敵眾').type, '被動');

  const luli = byName.get('戮力同心');
  assert.equal(luli.id, 'luli');
  assert.equal(luli.type, '主動');
  assert.equal(luli.source, '事件');
  assert.equal(luli.rank, 'S');
  assert.equal(luli.troops, null);
  assert.deepEqual(luli.from, []);

  const yulin = byName.get('魚鱗陣');
  const jingYulin = byName.get('精·魚鱗陣');
  assert.equal(yulin.id, 'yulin');
  assert.equal(yulin.type, '陣法');
  assert.equal(yulin.source, '傳承');
  assert.equal(yulin.rank, 'S');
  assert.deepEqual(yulin.troops, ['盾', '器械']);
  assert.deepEqual(yulin.from, ['sp-fazheng', 'sp-huangzhong']);
  assert.notEqual(yulin.id, jingYulin.id);
  assert.equal(jingYulin.source, '賽季');

  const shencang = byName.get('深藏若虛');
  assert.equal(shencang.id, 'shencang');
  assert.equal(shencang.type, '被動');
  assert.equal(shencang.source, '事件');
  assert.equal(shencang.rank, 'S');
  assert.equal(shencang.troops, null);
  assert.deepEqual(shencang.from, []);

  const xiandeng = byName.get('先登死士');
  assert.equal(xiandeng.id, 'xiandeng');
  assert.equal(xiandeng.type, '兵種');
  assert.deepEqual(xiandeng.troops, ['弓']);

  const yanxing = byName.get('雁行陣');
  assert.equal(yanxing.id, 'yanxing');
  assert.equal(yanxing.type, '陣法');
  assert.equal(yanxing.source, '傳承');
  assert.equal(yanxing.rank, 'S');
  assert.deepEqual(yanxing.troops, ['弓']);
  assert.deepEqual(yanxing.from, ['sp-luzhi']);

  const wufeng = byName.get('武鋒陣');
  assert.equal(wufeng.id, 'wufeng');
  assert.equal(wufeng.type, '陣法');
  assert.equal(wufeng.source, '事件');
  assert.equal(wufeng.rank, 'S');
  assert.equal(byName.get('千里走單騎').id, 'qianli');
  assert.equal(byName.has('千里單騎'), false);

  const huijun = byName.get('麾軍結陣');
  assert.equal(huijun.source, '事件');
  assert.equal(huijun.scenarios, undefined);
  const hanyanAlso = new Set(['tuo-caochuan', 'tuo-guagu', 'tuo-duohun']);
  const hanyanOnly = new Set(['tuo-zhongzhi', 'heng-e', 'zhuan-xingyi', 'zhuan-weizhen', 'tuo-jushi', 'tuo-zhene', 'zhuan-shizi']);
  const hanyanOpen = new Set(['cangqi', 'jueji', 'taoyuan', 'huijun']);
  for (const tactic of tacticsFile.tactics) {
    if (hanyanAlso.has(tactic.id)) {
      assert.deepEqual(tactic.scenarios, ['yingxiong', 'hanyan'], tactic.id);
      assert.equal(tactic.status, '已核', tactic.id);
      assert.equal(tactic.quality, undefined, tactic.id);
      assert.equal(tactic.rank, 'S', tactic.id);
      assert.equal(tactic.desc.includes('待核'), false, tactic.id);
      assert.match(tactic.note, /使用者確認 2026-11-08/, tactic.id);
      assert.match(tactic.sourceUrl, /^https:\/\/sgsdeck.com\//, tactic.id);
    } else if (hanyanOnly.has(tactic.id)) {
      assert.deepEqual(tactic.scenarios, ['hanyan'], tactic.id);
      assert.equal(tactic.status, '已核', tactic.id);
      assert.equal(tactic.quality, undefined, tactic.id);
      assert.equal(tactic.rank, 'S', tactic.id);
      assert.equal(tactic.desc.includes('待核'), false, tactic.id);
      assert.match(tactic.note, /使用者確認 2026-11-08/, tactic.id);
      assert.equal(tactic.obtain, tactic.id === 'tuo-zhongzhi' ? '拓印四選一' : '賽季商店', tactic.id);
      assert.match(tactic.sourceUrl, /^https:\/\/sgsdeck.com\/seasons\/pk-s27$/, tactic.id);
    } else if (tactic.variant === '拓' || tactic.variant === '精') {
      assert.deepEqual(tactic.scenarios, ['yingxiong'], tactic.id);
      assert.equal(tactic.status, '待核', tactic.id);
      assert.equal(tactic.sourceUrl, '', tactic.id);
      assert.equal(tactic.scenarios.includes('hanyan'), false, tactic.id);
    } else if (!hanyanOpen.has(tactic.id)) {
      assert.equal(tactic.scenarios, undefined, tactic.id);
    }
  }
  const cangqi = byName.get('藏器待時');
  assert.equal(cangqi.source, '傳承');
  assert.equal(cangqi.type, '被動');
  assert.equal(cangqi.rank, 'S');
  assert.equal(cangqi.status, '已核');
  assert.match(cangqi.note, /使用者確認 2026-11-08/);
  assert.deepEqual(cangqi.troops, ['盾', '器械']);
  assert.deepEqual(cangqi.from, ['sp-caocao']);
  assert.deepEqual(cangqi.fromNames, ['SP曹操']);
  assert.equal(cangqi.scenarios, undefined);
  assert.equal(cangqi.sourceUrl, 'https://sgsdeck.com/tactics/藏器待時');
  const jueji = byName.get('絕計折謀');
  assert.equal(jueji.source, '傳承');
  assert.equal(jueji.type, '主動');
  assert.equal(jueji.status, '已核');
  assert.match(jueji.note, /使用者確認 2026-11-08/);
  assert.deepEqual(jueji.fromNames, ['何氏']);
  assert.equal(jueji.scenarios, undefined);
  assert.equal(jueji.sourceUrl, 'https://sgsdeck.com/tactics/絕計折謀');
  const taoyuan = byName.get('桃園結義');
  assert.equal(taoyuan.source, '事件');
  assert.equal(taoyuan.type, '指揮');
  assert.equal(taoyuan.status, '已核');
  assert.match(taoyuan.note, /使用者確認 2026-11-08/);
  assert.deepEqual(taoyuan.exchange, ['liubei', 'guanyu', 'zhangfei']);
  assert.equal(taoyuan.scenarios, undefined);
  assert.equal(fitsScenario(taoyuan, 'regular'), true);
  assert.equal(fitsScenario(byName.get('拓·鎮扼防拒'), 'hanyan'), true);
  assert.equal(fitsScenario(byName.get('拓·鎮扼防拒'), 'regular'), false);
  assert.equal(fitsScenario(huijun, 'hanyan'), true);
  assert.equal(huijun.sourceUrl, 'https://sgsdeck.com/tactics/麾軍結陣');
  assert.equal(huijun.obtain, '事件');
  assert.match(byName.get('桃園結義').desc, /我軍單體/);
  assert.match(byName.get('桃園結義').desc, /謀略傷害/);
  assert.match(byName.get('桃園結義').desc, /獨立判定/);
  assert.match(byName.get('絕計折謀').desc, /持續1回合/);
  assert.match(byName.get('絕計折謀').note, /絕技折謀/);
  assert.match(byName.get('藏器待時').desc, /前2回合/);
  assert.match(byName.get('藏器待時').desc, /第3回合起/);
  assert.match(byName.get('藏器待時').desc, /自帶主動/);
  assert.match(byName.get('藏器待時').desc, /造成傷害時/);
  assert.equal(byName.get('拓·眾志成城').obtain, '拓印四選一');
  assert.equal(byName.has('承天靖世'), false);
  assert.equal(byName.has('帷內擅權'), false);
  const scenario = JSON.parse(readFileSync(new URL('../data/scenario.json', import.meta.url)));
  const tacticName = (id) => tacticsFile.tactics.find((item) => item.id === id)?.name || '';
  const beifaGuan = scenario.recommended.find((team) => team.id === 'hanyan-beifa').members[1];
  assert.equal(beifaGuan.learned[0], 'cangqi');
  const missingCangqi = ownershipGaps([beifaGuan], { owned: { guanxing: true }, tacticsOwned: { qianli: true } }, { tacticName });
  assert.equal(missingCangqi.tactics.includes('藏器待時'), true);
  const ownedCangqi = ownershipGaps([beifaGuan], { owned: { guanxing: true }, tacticsOwned: { qianli: true, cangqi: true } }, { tacticName });
  assert.equal(ownedCangqi.tactics.includes('藏器待時'), false);
  const dahanRaw = scenario.recommended.find((team) => team.id === 'baha-d-dahan').members[0];
  const rawMissing = ownershipGaps([dahanRaw], { owned: {}, tacticsOwned: {} }, {
    tacticName,
    tacticByName: (name) => tacticsFile.tactics.find((item) => item.name === name) || null,
  });
  assert.equal(rawMissing.tactics.includes('桃園結義'), true);
  const rawOwned = ownershipGaps([dahanRaw], { owned: {}, tacticsOwned: { taoyuan: true, 'gangrou-ji': true } }, {
    tacticName,
    tacticByName: (name) => tacticsFile.tactics.find((item) => item.name === name) || null,
  });
  assert.equal(rawOwned.tactics.includes('桃園結義'), false);
  const tacticLookup = {
    tacticName,
    tacticByName: (name) => tacticsFile.tactics.find((item) => item.name === name) || null,
    tacticById: (id) => tacticsFile.tactics.find((item) => item.id === id) || null,
  };
  const taishi = scenario.recommended.find((team) => team.id === 'baha-d-taishi');
  const added = teamFromRecommended(taishi, 'team-taishi', tacticLookup);
  assert.equal(added.members[0].learned[0], 'taoyuan');
  assert.equal(added.members[0].learned[1], 'xiandeng');
  const aliasTeam = teamFromRecommended({
    title: '縮寫',
    members: [{ generalId: 'xunyou', learned: [null, null], tacticsRaw: '轉獅子、上兵' }],
  }, 'team-alias', tacticLookup);
  assert.deepEqual(aliasTeam.members[0].learned, ['zhuan-shizi', 'shangbing']);
  const unknownGaps = ownershipGaps([{
    generalId: 'xunyou',
    learned: [null, null],
    tacticsRaw: '奇正之勢、草船',
  }], { owned: { xunyou: true }, tacticsOwned: {} }, tacticLookup);
  assert.equal(unknownGaps.tactics.includes('無法辨識／待核：奇正之勢'), true);
  assert.equal(unknownGaps.tactics.includes('草船借箭'), true);
  const conflict = dropUsedTactics(added.members, {
    tacticUses: new Map([['taoyuan', [{ teamName: '已有' }]]]),
  }, new Map(tacticsFile.tactics.map((item) => [item.id, item])));
  assert.equal(conflict.dropped.some((item) => item.id === 'taoyuan'), true);
  assert.equal(conflict.members[0].learned[0], null);
  const namedOnly = ownershipGaps([{
    generalId: 'sp-guanyu',
    learned: [null, null],
    learnedNames: ['以寡敵眾', '藏器待時'],
  }], { owned: { 'sp-guanyu': true }, tacticsOwned: { cangqi: true } }, {
    tacticName,
    tacticByName: (name) => tacticsFile.tactics.find((item) => item.name === name) || null,
  });
  assert.equal(namedOnly.tactics.includes('藏器待時'), false);
  assert.equal(namedOnly.tactics.includes('以寡敵眾'), true);
  const damiFa = scenario.recommended.find((team) => team.id === 'dami-madai').members[2];
  assert.equal(damiFa.learned[1], 'tuo-zhene');
  const missingZhene = ownershipGaps([damiFa], { owned: { 'sp-fazheng': true }, tacticsOwned: { xushidai: true } }, { tacticName });
  assert.equal(missingZhene.tactics.includes('拓·鎮扼防拒'), true);
  assert.deepEqual(scenario.merits, []);
  assert.match(scenario.recommended.find((team) => team.id === 'hanyan-beifa').note, /需訓兵振旅/);
  assert.match(scenario.recommended.find((team) => team.id === 'hanyan-qianlong-lvbu').note, /需訓兵振旅/);
  assert.match(scenario.recommended.find((team) => team.id === 'dami-beifa').note, /需訓兵振旅/);
  assert.match(scenario.recommended.find((team) => team.id === 'dami-madai').note, /需訓兵振旅/);
  assert.equal(scenario.recommended.find((team) => team.id === 'hanyan-sanxian').note.includes('需訓兵振旅'), false);
  assert.equal(scenario.recommended.find((team) => team.id === 'baha-d-dahan').note.includes('需訓兵振旅'), false);
  assert.equal(scenario.recommended.length, 30);
  const official = scenario.recommended.filter((team) => !team.origin);
  const bahamut = scenario.recommended.filter((team) => team.origin === 'bahamut');
  const dami = scenario.recommended.filter((team) => team.origin === 'dami');
  assert.equal(official.length, 10);
  assert.equal(bahamut.length, 11);
  assert.equal(dami.length, 9);
  assert.equal(official.every((team) => team.status === '待核' && team.scenario === 'hanyan' && team.tricks.length === 5 && team.note.startsWith('整理站內容已核，官方原圖待核')), true);
  assert.match(official.find((team) => team.id === 'hanyan-dudu').note, /合圍突擊/);
  assert.match(official.find((team) => team.id === 'hanyan-dudu').note, /合圍夾擊/);
  assert.equal(bahamut.every((team) => team.status === '已核' && team.originLabel === '巴哈玩家版'), true);
  assert.equal(bahamut.findIndex((team) => team.author !== '24李老师') > bahamut.findIndex((team) => team.author === '24李老师'), true);
  assert.equal(bahamut.filter((team) => team.author === '24李老师').every((team, index) => bahamut[index].author === '24李老师'), true);
  const removed = ['hanyan-dahan-gong', 'baha-a-xuyou', 'hanyan-huangma', 'hanyan-faguan', 'hanyan-wumou', 'baha-b-jiaxu-2', 'baha-b-xunyou-1', 'baha-c-fugui', 'baha-c-roudu', 'hanyan-taiwei', 'hanyan-kangkai', 'baha-d-shuzhi'];
  assert.equal(removed.every((id) => !scenario.recommended.some((team) => team.id === id)), true);
  const dahan = bahamut.find((team) => team.id === 'baha-d-dahan');
  assert.equal(dahan.status, '已核');
  assert.deepEqual(dahan.alternatives.map((item) => item.id), ['hanyan-dahan-gong', 'baha-b-gong-1', 'baha-b-gong-2', 'baha-b-gong-3']);
  assert.equal(dahan.alternatives[0].status, '待核');
  assert.equal(dahan.alternatives[1].status, '已核');
  assert.equal(dahan.rank, 'T0');
  assert.equal(dahan.rankStatus, '待核');
  assert.equal(dahan.rankConfidence, '中高');
  assert.equal(dahan.alternatives.every((item) => item.rank === undefined), true);
  const ranks = { T0: 0, 'T0.5': 0, T1: 0, 'T1.5': 0, T2: 0, '黑科技': 0 };
  for (const team of scenario.recommended) {
    assert.equal(team.rankStatus, '待核');
    assert.ok(team.rank in ranks, team.id);
    ranks[team.rank] += 1;
    assert.equal((team.alternatives || []).every((item) => item.rank === undefined), true);
  }
  assert.deepEqual(ranks, { T0: 7, 'T0.5': 6, T1: 10, 'T1.5': 5, T2: 1, '黑科技': 1 });
  assert.equal(scenario.recommended.find((team) => team.id === 'baha-d-pengci').rank, '黑科技');
  assert.equal(scenario.recommended.find((team) => team.id === 'baha-d-saozi').rank, 'T2');
  assert.deepEqual(scenario.hanConvert.toHan, ['caocao', 'liubei', 'sunjian', 'gongsunzan', 'lvbu', 'jiaxu', 'sp-yuanshao', 'sp-xunyu', 'yuanshu']);
  assert.deepEqual(scenario.hanConvert.ids, scenario.hanConvert.toHan);
  assert.equal(scenario.hanConvert.status, '待核');
  assert.equal(scenario.hanConvert.max, 3);
  assert.equal(scenario.hanConvert.source, 'https://sgsdeck.com/seasons/pk-s27');
  assert.match(scenario.hanConvert.officialPost, /facebook.com/);
  assert.match(scenario.hanConvert.note, /依使用者指定/);
  assert.match(scenario.hanConvert.note, /仍待確認/);
  const fugui = dami.find((team) => team.id === 'dami-fugui');
  assert.equal(fugui.status, '待核');
  assert.equal(fugui.alternatives.find((item) => item.id === 'baha-b-jiaxu-2').status, '已核');
  assert.equal(dami.find((team) => team.id === 'dami-madai').status, '待核');
  assert.equal(scenario.recommended.some((team) => team.id === 'dami-xingcai'), true);
  assert.equal(scenario.recommended.some((team) => team.id === 'hanyan-qilin'), true);
  assert.equal(scenario.recommended.some((team) => team.id === 'hanyan-beifa'), true);
  assert.equal(scenario.recommended.some((team) => team.id === 'baha-a-huangfu'), true);
  assert.equal(scenario.recommended.some((team) => team.id === 'baha-a-chengpu'), true);
  assert.equal(dami.length, 9);
  assert.equal(dami.every((team) => team.status === '待核' && team.applyReady === false && team.originLabel === '大米團隊（截圖）' && team.author === '三國志黑暗大米' && team.source === 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=6536' && team.note.startsWith('使用者提供截圖；作者巴哈頁聯絡方式吻合，漢焰版原帖與伺服器區域未確認')), true);
  assert.deepEqual(dami.filter((team) => team.scenarioOnly).map((team) => team.title), ['蜀智盾', '北伐盾']);
  const madai = dami.find((team) => team.id === 'dami-madai');
  assert.equal(madai.members[1].learned.includes('tengjia'), false);
  assert.match(madai.members[1].remark, /藤甲兵/);
  const beifa = dami.find((team) => team.id === 'dami-beifa');
  assert.equal(beifa.members[1].generalId, 'guanxing');
  assert.equal(beifa.members[1].learnedNames[0], '千里走單騎');
  assert.equal(beifa.tricks[4], '圯橋受書');
  assert.equal(beifa.members[0].learned[1], null);
  assert.equal(dami.find((team) => team.id === 'dami-xingcai').members[1].generalId, 'wushuang-xingcai');
  assert.equal(dami.find((team) => team.id === 'dami-wanghong').members[2].learnedNames[1], '大戰士');
  assert.equal(generalsFile.generals.filter((general) => general.status === '已核' && general.camp !== '漢').every((general) => general.sourceUrl === ''), true);
  const autoHan = ['sp-huangfusong', 'sp-zhujun', 'caiyong', 'caiwenji', 'zhangrang', 'dongzhuo', 'sp-dongzhuo', 'diaochan', 'sp-diaochan', 'sp-luzhi', 'yuanshao', 'huatuo'];
  for (const id of autoHan) {
    assert.equal(generalsFile.generals.find((general) => general.id === id).camp, '漢', id);
  }
  const spCao = generalsFile.generals.find((general) => general.id === 'sp-caocao');
  assert.equal(spCao.camp, '漢');
  assert.equal(spCao.status, '已核');
  assert.equal(spCao.role, '軍事');
  assert.deepEqual(spCao.apt, { 騎: 'S', 盾: 'A', 弓: 'S', 槍: 'A', 器械: 'B' });
  assert.equal(spCao.innate, '承天靖世');
  assert.equal(spCao.scenarios, undefined);
  assert.equal(spCao.scenarioLimit, undefined);
  assert.equal(spCao.debutScenario, 'hanyan');
  assert.equal(generalListed(spCao, 'regular'), true);
  assert.equal(spCao.sourceUrl, 'https://sgsdeck.com/generals/SP曹操');
  assert.match(spCao.note, /定位軍事/);
  assert.equal(spCao.note.includes('定位待核'), false);
  const heshi = generalsFile.generals.find((general) => general.id === 'heshi');
  assert.equal(heshi.status, '已核');
  assert.equal(heshi.apt.弓, '待核');
  assert.equal(heshi.apt.騎, 'C');
  assert.match(heshi.note, /武將頁弓 B/);
  assert.match(heshi.note, /弓 A/);
  assert.match(heshi.note, /弓待核/);
  assert.match(heshi.note, /定位待核/);
  assert.equal(heshi.note.includes('待補'), false);
  assert.equal(heshi.debutScenario, 'hanyan');
  assert.equal(heshi.scenarioLimit, undefined);
  assert.equal(heshi.scenarios, undefined);
  assert.equal(generalListed(heshi, 'regular'), true);
  const y40 = generalsFile.generals.find((general) => general.id === 'y40-lvbu');
  assert.notEqual(y40.id, 'lvbu');
  assert.equal(y40.status, '已核');
  assert.equal(y40.role, '軍事');
  assert.deepEqual(y40.apt, { 騎: 'A', 盾: 'B', 弓: 'S', 槍: 'S', 器械: 'C' });
  assert.equal(y40.scenarios, undefined);
  assert.equal(y40.scenarioLimit, undefined);
  assert.equal(y40.note.includes('英雄命世代表'), false);
  assert.equal(fitsScenario(y40, 'regular'), true);
  assert.equal(fitsScenario(y40, 'yingxiong'), true);
  assert.equal(fitsScenario(y40, 'hanyan'), true);
  assert.equal(y40.innate, '天威嘯陣');
  assert.match(y40.note, /傳承待核/);
  assert.match(y40.note, /定位軍事/);
  assert.equal(y40.note.includes('定位待核'), false);
  assert.match(y40.note, /動態待核/);
  assert.match(y40.note, /典藏待核/);
  assert.equal(y40.note.includes('待補'), false);
  assert.match(y40.note, /全賽季名將卡包/);
  assert.match(y40.note, /NewsID=13659/);
  const liangCosts = {
    baoxin: 5,
    liuzhang: 3,
    liudai: 4,
    chunyuqiong: 5,
    liuyu: 4,
    zhangyun: 5,
    xugong: 4,
  };
  for (const [id, cost] of Object.entries(liangCosts)) {
    const liang = generalsFile.generals.find((general) => general.id === id);
    assert.equal(liang.quality, '良將');
    assert.equal(liang.camp, '漢');
    assert.equal(liang.status, '已核');
    assert.equal(liang.cost, cost, id);
    assert.equal(liang.innate, '');
    assert.equal(liang.apt.弓, '待核');
    assert.match(liang.note, /使用者遊戲截圖 2026-11-08/);
    assert.match(liang.note, /仍待核/);
    assert.equal(liang.note.includes('待補'), false);
    assert.equal(liang.scenarios, undefined);
    assert.equal(liang.scenarioLimit, undefined);
    assert.equal(liang.debutScenario, 'hanyan');
    assert.equal(generalListed(liang, 'regular'), true);
    assert.equal(generalListed(liang, 'yingxiong'), true);
    assert.equal(generalListed(liang, 'hanyan'), true);
    assert.equal(liang.sourceUrl, 'https://sgsdeck.com/seasons/pk-s27');
  }
  const shotHan = [
    ['zhujun', '朱儁', 6, '良將', { 騎: 'C', 盾: 'B', 弓: 'S', 槍: 'B', 器械: 'A' }, '鎮壓黃巾'],
    ['huangfusong', '皇甫嵩', 5, '良將', null, ''],
    ['luzhi', '盧植', 5, '良將', { 騎: 'B', 盾: 'C', 弓: 'A', 槍: 'B', 器械: 'B' }, '五穀豐登'],
    ['kongrong', '孔融', 5, '良將', { 騎: 'A', 盾: 'B', 弓: 'C', 槍: 'C', 器械: 'C' }, '謙讓'],
    ['zhangren', '張任', 5, '良將', { 騎: 'C', 盾: 'B', 弓: 'S', 槍: 'B', 器械: 'B' }, '落鳳'],
    ['chenlin', '陳琳', 5, '良將', { 騎: 'C', 盾: 'C', 弓: 'B', 槍: 'C', 器械: 'B' }, '碩果累累'],
    ['liubiao', '劉表', 3, '良將', { 騎: 'B', 盾: 'B', 弓: 'A', 槍: 'C', 器械: 'C' }, '爭分奪秒'],
  ];
  for (const [id, name, cost, quality, apt, innate] of shotHan) {
    const general = generalsFile.generals.find((item) => item.id === id);
    assert.ok(general, id);
    assert.equal(general.name, name);
    assert.equal(general.camp, '漢');
    assert.equal(general.cost, cost);
    assert.equal(general.quality, quality);
    assert.equal(general.status, '已核');
    assert.equal(general.innate, innate);
    assert.equal(general.scenarios, undefined);
    assert.equal(general.scenarioLimit, undefined);
    assert.equal(general.debutScenario, undefined);
    assert.equal(general.note.includes('首次登場'), false, id);
    assert.equal(generalListed(general, 'regular'), true);
    assert.equal(generalListed(general, 'hanyan'), true);
    assert.match(general.note, /使用者遊戲截圖 2026-11-08/);
    assert.match(general.note, /可轉群/);
    assert.match(general.note, /不猜首登賽季/);
    if (apt) assert.deepEqual(general.apt, apt);
    else assert.equal(general.apt.弓, '待核');
  }
  for (const id of ['taoqian', 'hejin', 'dingyuan', 'wangyun', 'liuyao']) {
    assert.equal(generalsFile.generals.some((item) => item.id === id), false, id);
  }
  const zhujun = generalsFile.generals.find((item) => item.id === 'zhujun');
  assert.equal(zhujun.name, '朱儁');
  assert.notEqual(zhujun.id, 'sp-zhujun');
  assert.equal(zhujun.innate, '鎮壓黃巾');
  assert.match(zhujun.note, /鎮壓黃巾/);
  assert.match(zhujun.note, /免疫沙暴並造成叛逃/);
  assert.equal(zhujun.note.includes('叛逆'), false);
  assert.match(zhujun.note, /千里馳援/);
  assert.match(zhujun.note, /不採用/);
  assert.equal(generalsFile.generals.find((item) => item.id === 'luzhi').name, '盧植');
  assert.equal(generalsFile.generals.find((item) => item.id === 'sp-luzhi').name, 'SP盧植');
  assert.equal(generalsFile.generals.find((item) => item.id === 'huangfusong').name, '皇甫嵩');
  assert.equal(generalsFile.generals.find((item) => item.id === 'sp-huangfusong').name, 'SP皇甫嵩');
  assert.equal(generalsFile.generals.filter((item) => item.camp === '漢').length, 29);
  assert.equal(generalsFile.generals.every((item) => item.quality !== '裨將'), true);
  assert.deepEqual(byName.get('藏器待時').from, ['sp-caocao']);
  assert.deepEqual(byName.get('絕計折謀').from, ['heshi']);
  assert.equal(byName.get('麾軍結陣').status, '已核');
  assert.equal(scenario.weapons.length, 0);
  assert.equal(scenario.treasures, undefined);
  const pangtong = scenario.recommended.find((team) => team.id === 'hanyan-pangtong-gong');
  assert.equal(pangtong.members[0].remark, '替代選項：盛氣凌敵');
  assert.equal(pangtong.members[0].learned.includes('shengqi'), false);
  const xuyou = scenario.recommended.find((team) => team.id === 'hanyan-qianlong-lvbu').members[0];
  assert.deepEqual(xuyou.traits, ['靈動', '出奇']);
  assert.deepEqual(xuyou.aptNeed, { troop: '弓', letter: 'S' });
  assert.equal(scenario.recommended.filter((team) => team.officialSource).length, 4);
  const variants = tacticsFile.tactics.filter((item) => /^(拓|精|轉)·/.test(item.name));
  assert.equal(variants.every((item) => !item.desc.includes('沿用原戰法')), true);
  assert.equal(byName.get('拓·草船借箭').desc, '對應原戰法草船借箭');
  assert.equal(byName.get('拓·刮骨療毒').desc, '對應原戰法刮骨療毒');
  assert.equal(byName.get('拓·奪魂挾魄').desc, '對應原戰法奪魂挾魄');
  assert.equal(byName.get('轉·形一陣').desc, '對應原戰法形一陣');
  assert.equal(byName.get('衡軛陣').desc, '沒有對應原版。');
  assert.equal(huijun.status, '已核');
  assert.match(huijun.note, /使用者確認 2026-11-08/);
  assert.match(huijun.desc, /自帶戰法為主動戰法時生效/);
  assert.match(huijun.desc, /或治療/);
  assert.equal(huijun.desc.includes('造成傷害並治療'), false);
  const kangkai = scenario.recommended.find((team) => team.id === 'baha-d-kangkai');
  assert.equal(kangkai.members[2].generalId, null);
  assert.equal(kangkai.members[2].generalName, 'SP呂蒙／程普');
  assert.deepEqual(kangkai.members[2].generalChoices.map((choice) => choice.id), ['sp-lvmeng', 'chengpu']);
  const generalName = (id) => generalsFile.generals.find((item) => item.id === id)?.name || '';
  const gapLookup = { ...tacticLookup, generalName };
  const onlyTwo = ownershipGaps(kangkai.members, { owned: { ganning: true, taishici: true }, tacticsOwned: {} }, gapLookup);
  assert.match(generalGapLine(onlyTwo), /SP呂蒙／程普/);
  assert.equal(teamFromRecommended(kangkai, 'team-kangkai', { ...tacticLookup, owned: { ganning: true, taishici: true } }).members[2], null);
  const withCheng = ownershipGaps(kangkai.members, { owned: { ganning: true, taishici: true, chengpu: true }, tacticsOwned: {} }, gapLookup);
  assert.equal(generalGapLine(withCheng), '');
  const builtCheng = teamFromRecommended(kangkai, 'team-cheng', { ...tacticLookup, owned: { ganning: true, taishici: true, chengpu: true } });
  assert.equal(builtCheng.members[0].generalId, 'ganning');
  assert.equal(builtCheng.members[1].generalId, 'taishici');
  assert.equal(builtCheng.members[2].generalId, 'chengpu');
  assert.match(builtCheng.notes, /臨危救主/);
  assert.match(builtCheng.notes, /雁行陣/);
  assert.match(builtCheng.notes, /替代：乘敵不虞/);
  const dahanBow = scenario.recommended.find((team) => team.id === 'baha-d-dahan');
  assert.equal(dahanBow.members[0].generalId, 'sp-caocao');
  const dahanMissing = ownershipGaps(dahanBow.members, { owned: { 'sp-luzhi': true, 'sp-diaochan': true }, tacticsOwned: {} }, gapLookup);
  assert.match(generalGapLine(dahanMissing), /SP曹操/);
  assert.equal(generalGapLine(dahanMissing).includes('未解析武將'), false);
  const dahanOwned = { owned: { 'sp-caocao': true, 'sp-luzhi': true, 'sp-diaochan': true }, tacticsOwned: {} };
  assert.equal(generalGapLine(ownershipGaps(dahanBow.members, dahanOwned, gapLookup)), '');
  const builtDahan = teamFromRecommended(dahanBow, 'team-dahan', { ...tacticLookup, owned: dahanOwned.owned });
  assert.equal(builtDahan.members[0].generalId, 'sp-caocao');
  assert.equal(builtDahan.members[1].generalId, 'sp-luzhi');
  assert.equal(builtDahan.members[2].generalId, 'sp-diaochan');
  const huangfu = scenario.recommended.find((team) => team.id === 'baha-a-huangfu');
  assert.equal(huangfu.title, '三勢40Y呂／皇甫版本');
  const huangfuGaps = ownershipGaps(huangfu.members, { owned: {}, tacticsOwned: {} }, gapLookup);
  const huangfuLine = generalGapLine(huangfuGaps);
  assert.equal(huangfu.members[0].generalId, 'y40-lvbu');
  assert.match(huangfu.members[0].resolveBasis, /官方卡名 40Y呂布/);
  assert.match(huangfu.members[0].resolveBasis, /奉先/);
  assert.match(huangfuLine, /40Y呂布/);
  assert.equal(huangfuLine.includes('未解析武將：40呂'), false);
  assert.match(huangfuLine, /SP法正/);
  assert.match(huangfuLine, /SP皇甫嵩/);
  assert.equal(huangfu.members[1].generalId, 'sp-fazheng');
  assert.equal(huangfu.members[2].generalId, 'sp-huangfusong');
  assert.match(huangfu.members[1].resolveBasis, /sp法正/);
  assert.match(huangfu.members[2].resolveBasis, /sp皇甫/);
  const huangma = scenario.recommended.find((team) => team.id === 'baha-d-huangma');
  assert.equal(huangma.members[0].generalId, 'sp-machao');
  assert.equal(huangma.members[1].generalId, 'sp-huangfusong');
  assert.match(huangma.members[1].resolveBasis, /埔是甫的錯字/);
  const pengci = scenario.recommended.find((team) => team.id === 'baha-d-pengci');
  assert.equal(pengci.title, '碰瓷／潛龍周泰');
  assert.equal(pengci.members[0].generalId, 'zhoutai');
  const chengpuSeat = scenario.recommended.find((team) => team.id === 'baha-a-chengpu');
  assert.equal(chengpuSeat.title, '三勢40Y呂／程普（松鼠）版本');
  assert.equal(chengpuSeat.members[0].generalId, 'y40-lvbu');
  assert.match(chengpuSeat.members[0].resolveBasis, /40呂／40呂布／奉先/);
  assert.equal(scenario.recommended.find((team) => team.id === 'baha-d-taishi').title, '大漢弓／太師版');
  assert.equal(huangma.title, '皇馬槍');
  const lvbu = scenario.recommended.find((team) => team.id === 'hanyan-sanshi-lvbu');
  assert.equal(lvbu.members[0].generalId, 'y40-lvbu');
  assert.match(lvbu.members[0].remark, /不是普通呂布/);
  assert.equal(lvbu.alternatives[0].title, '許攸版本');
  const lvdiaolu = scenario.recommended.find((team) => team.id === 'hanyan-lvdiaolu');
  assert.equal(lvdiaolu.members[0].generalId, 'y40-lvbu');
  const hanNew = ['sp-caocao', 'heshi', 'baoxin', 'liuzhang', 'liudai', 'chunyuqiong', 'liuyu', 'zhangyun', 'xugong', 'y40-lvbu'];
  const ownedHan = Object.fromEntries(hanNew.map((id) => [id, { red: 0 }]));
  const byId = new Map(generalsFile.generals.map((general) => [general.id, general]));
  const emptyUsage = { generalTeams: new Map(), nameTeams: new Map() };
  for (const scenario of ['regular', 'yingxiong', 'hanyan']) {
    for (const showAll of [false, true]) {
      const listedIds = new Set(generalsFile.generals.filter((general) => generalListed(general, scenario, { showAll })).map((general) => general.id));
      const pickerIds = new Set(generalsFile.generals.filter((general) => generalListed(general, scenario, { showAll }) && ownedHan[general.id]).map((general) => general.id));
      for (const id of hanNew) {
        assert.equal(listedIds.has(id), true, `${id} 列表 ${scenario} 顯示全部=${showAll}`);
        assert.equal(pickerIds.has(id), true, `${id} 選將器 ${scenario} 顯示全部=${showAll}`);
        assert.equal(generalBlockReason({
          account: { owned: ownedHan, scenario },
          team: { id: 'team-empty', members: [null, null, null] },
          slot: 0,
          general: byId.get(id),
          generalsById: byId,
          usage: emptyUsage,
        }), '', `${id} 空格可選`);
      }
    }
  }
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.match(app, /function listedGeneral\(general\) \{\s*return generalListed\(general, account\(\)\.scenario/);
  assert.match(app, /listedGeneral\(general\) \|\| general\.id === keepId/);
  const saozi = scenario.recommended.find((team) => team.id === 'baha-d-saozi');
  assert.equal(saozi.tricks.includes('伺橋受書'), true);
  assert.equal(saozi.trickFormal['伺橋受書'], '圯橋受書');
  const builtSaozi = teamFromRecommended(saozi, 'team-saozi', tacticLookup);
  assert.equal(builtSaozi.tricks.includes('伺橋受書'), true);
  assert.match(builtSaozi.notes, /伺橋受書對照圯橋受書/);
});
