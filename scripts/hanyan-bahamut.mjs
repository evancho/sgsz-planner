/** 巴哈玩家版漢焰長明隊伍。原文沒寫的欄位留空，不把簡稱綁進圖鑑。 */

const A = {
  author: '我三弟無敵',
  authorAccount: 'helven',
  source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11645',
  postedAt: '2026-10-31 13:04:04',
};
const B = {
  author: '你看星星无数',
  authorAccount: 'f472xz256x',
  source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11647',
  postedAt: '2026-10-31 11:33:26',
};
const C = {
  author: '4everfiona',
  authorAccount: 'feverfiona',
  source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11650',
  postedAt: '2026-11-01 23:34:19',
};
const D = {
  author: '24李老师',
  authorAccount: 'A1970li',
  source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11651',
  postedAt: '2026-11-04 20:01:42',
};

const GENERALS = {
  SP法正: 'sp-fazheng',
  SP盧植: 'sp-luzhi',
  SP貂蟬: 'sp-diaochan',
  SP荀彧: 'sp-xunyu',
  SP郭嘉: 'sp-guojia',
  SP呂蒙: 'sp-lvmeng',
  SP董卓: 'sp-dongzhuo',
  SP步練師: 'sp-bulianshi',
  SP朱儁: 'sp-zhujun',
  曹操: 'caocao',
  程普: 'chengpu',
  許攸: 'xuyou',
  周瑜: 'zhouyu',
  陸遜: 'luxun',
  左慈: 'zuoci',
  張遼: 'zhangliao',
  甘寧: 'ganning',
  太史慈: 'taishici',
  賈詡: 'jiaxu',
  諸葛亮: 'zhugeliang',
  龐統: 'pangtong',
  孫權: 'sunquan',
  荀攸: 'xunyou',
  袁術: 'yuanshu',
  呂布: 'lvbu',
  郭嘉: 'guojia',
  無雙大喬: 'wushuang-daqiao',
  SP馬超: 'sp-machao',
  周泰: 'zhoutai',
};

const BASIS_FA = '巴哈 11645 先寫 sp法 的發動率，同一段後文改稱滿紅sp法正。對應圖鑑 SP法正。';
const BASIS_HUANG = '巴哈 11645 皇甫版本寫「需要攜帶sp皇甫」。李老師 11651 把同一格寫成 SP皇埔嵩。圖鑑是 SP皇甫嵩。';
const BASIS_PU = '巴哈 11651 皇馬寫「SP皇埔嵩草船萬軍」，與官方皇馬槍 SP皇甫嵩（草船借箭、萬軍奪帥）同一格。埔是甫的錯字。';
const BASIS_40 = '巴哈 11645 把 40呂、40呂布、奉先混用。官方卡名是 40Y呂布，圖鑑沒有這張卡，不改成普通呂布。';
const BASIS_CAO = '原文與 sgsdeck 大漢弓主將是 SP曹操。圖鑑未收 SP曹操，不改成曹操。';
const BASIS_KANG = '巴哈 11651 原文「SP呂蒙/程普」，斜線是二擇一。';

function seat(generalName, tacticsRaw, extra = {}) {
  const member = {
    generalId: Object.prototype.hasOwnProperty.call(extra, 'generalId') ? extra.generalId : (GENERALS[generalName] || null),
    generalName,
    learned: extra.learned || [null, null],
    learnedNames: extra.learnedNames || [],
    tacticsRaw,
  };
  if (extra.bingshuRaw) member.bingshuRaw = extra.bingshuRaw;
  if (extra.remark) member.remark = extra.remark;
  if (extra.resolveBasis) member.resolveBasis = extra.resolveBasis;
  if (extra.generalChoices) member.generalChoices = extra.generalChoices;
  return member;
}

function team(id, title, meta, members, tricks = [], note = '', applyReady = true, trickFormal = null) {
  const row = {
    id,
    scenario: 'hanyan',
    title,
    status: '待核',
    origin: 'bahamut',
    originLabel: '巴哈玩家版',
    tricksBound: false,
    applyReady,
    author: meta.author,
    authorAccount: meta.authorAccount,
    source: meta.source,
    postedAt: meta.postedAt,
    strategy: [],
    tricks,
    note,
    members,
  };
  if (trickFormal) row.trickFormal = trickFormal;
  return row;
}

const bookLv = '蠻勇武略執銳／示敵百戰掩虛';
const bookFa = '三軍統軍錘鍊';

export const hanyanBahamut = [
  team('baha-a-xuyou', '許攸版本', A, [
    seat('40呂', '藏器、血刃', { bingshuRaw: bookLv, remark: '全兵種S', resolveBasis: BASIS_40 }),
    seat('sp法', '蓄勢、三勢', { bingshuRaw: bookFa, generalId: 'sp-fazheng', resolveBasis: BASIS_FA }),
    seat('許攸', '藤甲、臨危', { bingshuRaw: bookFa, remark: '盾散' }),
  ], ['韜晦', '背水', '十面', '長安', '多多'], '作者稱輸出上限高、防速攻較弱。血刃可換的寫法不另開隊伍。'),
  team('baha-a-huangfu', '皇甫版本', A, [
    seat('40呂', '藏器、血刃', { bingshuRaw: bookLv, remark: '全兵種S', resolveBasis: BASIS_40 }),
    seat('sp法', '蓄勢、三勢', { bingshuRaw: bookFa, generalId: 'sp-fazheng', resolveBasis: BASIS_FA }),
    seat('sp皇', '藤甲、臨危', { bingshuRaw: '援其勵軍掩虛', remark: '盾散＋群', generalId: 'sp-huangfusong', resolveBasis: BASIS_HUANG }),
  ], ['韜晦', '背水', '十面', '長安', '多多']),
  team('baha-a-chengpu', '程普（松鼠）版本', A, [
    seat('40呂', '藏器、文武', { bingshuRaw: bookLv, remark: '全兵種S', resolveBasis: BASIS_40 }),
    seat('程普', '藤甲、臨危', { bingshuRaw: '無戰守勢防備' }),
    seat('sp法', '蓄勢、轉形一', { bingshuRaw: bookFa, generalId: 'sp-fazheng', resolveBasis: BASIS_FA }),
  ], ['韜晦', '背水', '十面', '月下', '多多'], '控制與坦度取向。'),
  team('baha-b-gong-1', '漢弓／第一套配置', B, [
    seat('sp曹操', '草船借箭、剛柔並濟', { resolveBasis: BASIS_CAO }),
    seat('sp盧植', '雁行陣、先登死士', { remark: '1速' }),
    seat('sp貂蟬', '深藏若虛、戮力同心'),
  ], [], '45～48級穩定性取向；曹操2速貼盧植。兵書、方略、奇略原文未寫。'),
  team('baha-b-gong-2', '漢弓／第二套配置', B, [
    seat('sp曹操', '剛柔並濟、桃園結義', { resolveBasis: BASIS_CAO }),
    seat('sp盧植', '雁行陣、先登死士'),
    seat('sp貂蟬', '移花接木、戮力同心'),
  ], [], '建議48級後。深藏與移花按環境互換。兵書、方略、奇略原文未寫。'),
  team('baha-b-gong-3', '漢弓／第三套配置', B, [
    seat('sp曹操', '草船借箭／桃園結義、先登死士', { remark: '原文適用有雍雅沉重', resolveBasis: BASIS_CAO }),
    seat('sp貂蟬', '深藏若虛、戮力同心'),
    seat('sp盧植', '雁行陣、剛柔並濟'),
  ], [], '速度盧植＞貂蟬＞曹操。兵書、方略、奇略原文未寫。'),
  team('baha-b-xunyou-1', '旬攸版五謀／第一配置', B, [
    seat('sp荀彧', '靈機一動、刮骨療毒', { remark: '1速' }),
    seat('sp郭嘉', '奪魂攜魄、當鋒催決', { remark: '貼速' }),
    seat('荀攸', '轉獅子、上兵伐謀'),
  ], [], '錯字保持原文。轉獅子未定正式全名。兵書、方略、奇略原文未寫。'),
  team('baha-b-xunyou-2', '旬攸版五謀／有戮力同心的配置', B, [
    seat('sp荀彧', '戮力同心、刮骨療毒'),
    seat('sp郭嘉', '奪魂攜魄、當鋒催決'),
    seat('旬攸', '靈機一動、上兵伐謀', { remark: '旬攸推定為荀攸，未綁圖鑑' }),
  ], [], '兵書、方略、奇略原文未寫。'),
  team('baha-b-jiaxu-2', '賈詡／48級後第二配置', B, [
    seat('sp荀彧', '戮力同心、刮骨療毒'),
    seat('賈詡', '靈機一動、拓聚石成金'),
    seat('sp郭嘉', '奪魂攜魄、上兵伐謀'),
  ], [], '作者建議48級後可轉賈詡。兵書、方略、奇略原文未寫。'),
  team('baha-c-fugui', '富貴', C, [
    seat('sp荀彧', '竭力、刮骨'),
    seat('sp郭嘉', '奪魂、當峰', { bingshuRaw: '以退＋善戰＋精準' }),
    seat('荀攸', '轉獅子、上兵'),
  ], [], '沒當鋒可改上兵，荀攸另一格改焚營或靈機一動。方略、奇略原文未寫。'),
  team('baha-c-roudu', '肉嘟嘟', C, [
    seat('周瑜', '戮力同心、聚石成金', { remark: '不紅可換sp周瑜' }),
    seat('陸遜', '拓鎮厄防拒（功不）、萬軍奪帥'),
    seat('sp呂蒙（程普也可以）', '雁行陣（當鋒也可以）、草船'),
  ], [], '維持前綴與錯字。方略、奇略原文未寫。'),
  team('baha-d-dahan', '大漢弓', D, [
    seat('SP曹操', '桃園結義、剛柔並濟', { resolveBasis: BASIS_CAO }),
    seat('SP盧植', '先登死士、雁形陣', { remark: '1速' }),
    seat('SP貂蟬', '勠力同心、深藏若虛'),
  ], ['推衣解食', '沛縣聚義', '約法三章', '鴻門遇險', '茫蕩隱蹤'], '漢弓多可先帶移花接木。兵書、方略原文未寫。'),
  team('baha-d-taishi', '太師弓', D, [
    seat('SP董卓', '桃園結義、先登死士'),
    seat('SP盧植', '剛柔、雁形陣', { remark: '1速' }),
    seat('SP貂蟬', '勠力同心、深藏若虛'),
  ], ['推衣解食', '沛縣聚義', '約法三章', '鴻門遇險', '茫蕩隱蹤'], '沒有抽滿SP曹操的替代。兵書、方略原文未寫。'),
  team('baha-d-qianlong-fa', '潛龍法正盾', D, [
    seat('SP法正', '蓄勢待發、潛龍陣'),
    seat('周瑜', '奪魄、風助火勢'),
    seat('SP貂蟬', '剛柔並濟／勠力同心、深藏若虛'),
  ], ['設伏十面', '合圍夾擊', '楚歌四起', '波浪推秦', '功成身退'], '會佔用法正、貂蟬，作者推薦程度一般。'),
  team('baha-d-shuzhi', '蜀智盾', D, [
    seat('龐統', '士別三日、杯蛇'),
    seat('諸葛亮', '刮骨／藤甲兵、乘敵不虞'),
    seat('SP法正', '蓄勢待發、拓鎮扼防拒'),
  ], ['芒砀隐踪', '沛县聚义', '波浪推秦', '推食解衣', '约法三章'], '前期刮骨、後期藤甲。正文未明寫每人全S使用方式。'),
  team('baha-d-huangma', '皇馬', D, [
    seat('SP馬超', '當峰、催峰斷刃'),
    seat('SP皇埔嵩', '草船、萬軍', { generalId: 'sp-huangfusong', resolveBasis: BASIS_PU }),
    seat('許攸', '臨危救主／乘敵不虞、解煩衛'),
  ], ['封狼居胥', '橫掃河西', '催峰陷敵', '孤軍深入', '壯志不絕'], '作者稱可變弓盾。變體不自行補。'),
  team('baha-d-qiaoliao', '喬遼左', D, [
    seat('無雙大喬', '獨行付斗、草船'),
    seat('張遼', '當峰、催峰斷刃'),
    seat('左慈', '臨危救主／乘敵不虞、衡軛陣'),
  ], ['封狼居胥', '孤軍深入', '博浪推秦', '橫掃河西', '壯志不絕'], '推薦前期弓、後期槍。'),
  team('baha-d-saozi', '嫂子弓', D, [
    seat('孫權', '當峰、兵無'),
    seat('SP步練師', '八門、深謀遠慮'),
    seat('無雙大喬', '獨行付斗、草船'),
  ], ['推衣解食', '伺橋受書', '臨危不懼', '借箸代籌', '約法三章'], '作者說模擬評分好但本人實戰拉胯。', true, { 伺橋受書: '圯橋受書' }),
  team('baha-d-kangkai', '慷慨弓', D, [
    seat('甘寧', '草船、錦帆軍'),
    seat('太史慈', '當峰、催峰斷刃'),
    seat('SP呂蒙／程普', '臨危救主／乘敵不虞、雁形陣', {
      generalChoices: [
        { id: 'sp-lvmeng', name: 'SP呂蒙' },
        { id: 'chengpu', name: '程普' },
      ],
      resolveBasis: BASIS_KANG,
    }),
  ], ['封狼居胥', '催峰陷敵', '定計安儲', '壯志不絕', '追亡逐北'], '無皇馬、大漢玩家的首隊選項。'),
  team('baha-d-wenhou', '溫侯弓', D, [
    seat('許攸', '武峰陣、錦帆軍'),
    seat('左慈', '臨危救主、暫避鋒芒'),
    seat('呂布', '當峰、催峰'),
  ], ['背水列阵', '设伏十面', '波浪推秦', '受书', '多多益善'], '諸葛亮／甘寧變體逐格不全，不補。'),
  team('baha-d-pengci', '碰瓷系列／潛龍周泰袁術和SP朱儁', D, [
    seat('周泰', '潛龍、盛氣'),
    seat('袁術', '焚輜、上兵伐謀'),
    seat('SP朱儁', '太平、無當'),
  ], ['背水列阵', '设伏十面', '波浪推秦', '受书', '多多益善'], '每將6000～7000兵。SP朱儁可換張飛（橫掃、疾風驟雨）或SP袁紹（擎刀、疾風驟雨）。'),
];

/** 已核只代表來源轉錄正確，不代表隊伍強度。狀態逐隊保存，方便之後單隊改回。 */
const VERIFIED = new Set([
  'baha-a-xuyou',
  'baha-a-huangfu',
  'baha-a-chengpu',
  'baha-b-gong-1',
  'baha-b-gong-2',
  'baha-b-gong-3',
  'baha-b-xunyou-1',
  'baha-b-xunyou-2',
  'baha-b-jiaxu-2',
  'baha-c-fugui',
  'baha-c-roudu',
  'baha-d-dahan',
  'baha-d-taishi',
  'baha-d-qianlong-fa',
  'baha-d-shuzhi',
  'baha-d-huangma',
  'baha-d-qiaoliao',
  'baha-d-saozi',
  'baha-d-kangkai',
  'baha-d-wenhou',
  'baha-d-pengci',
]);

for (const row of hanyanBahamut) {
  if (VERIFIED.has(row.id)) row.status = '已核';
}
