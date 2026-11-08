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
const E = {
  author: '松鼠',
  authorAccount: 'jun59962903',
  source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11652',
  postedAt: '2026-11-05 21:21:37',
};
const F = {
  author: '無名之輩~away',
  authorAccount: 'p15017504299',
  source: 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11630',
  postedAt: '2026-10-26 11:53:32',
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
};

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
  return member;
}

function team(id, title, meta, members, tricks = [], note = '', applyReady = true) {
  return {
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
}

const bookLv = '蠻勇武略執銳／示敵百戰掩虛';
const bookFa = '三軍統軍錘鍊';

export const hanyanBahamut = [
  team('baha-a-xuyou', '許攸版本', A, [
    seat('40呂', '藏器、血刃', { bingshuRaw: bookLv, remark: '全兵種S' }),
    seat('sp法', '蓄勢、三勢', { bingshuRaw: bookFa }),
    seat('許攸', '藤甲、臨危', { bingshuRaw: bookFa, remark: '盾散' }),
  ], ['韜晦', '背水', '十面', '長安', '多多'], '作者稱輸出上限高、防速攻較弱。血刃可換的寫法不另開隊伍。'),
  team('baha-a-huangfu', '皇甫版本', A, [
    seat('40呂', '藏器、血刃', { bingshuRaw: bookLv, remark: '全兵種S' }),
    seat('sp法', '蓄勢、三勢', { bingshuRaw: bookFa }),
    seat('sp皇', '藤甲、臨危', { bingshuRaw: '援其勵軍掩虛', remark: '盾散＋群' }),
  ], ['韜晦', '背水', '十面', '長安', '多多']),
  team('baha-a-chengpu', '程普（松鼠）版本', A, [
    seat('40呂', '藏器、文武', { bingshuRaw: bookLv, remark: '全兵種S' }),
    seat('程普', '藤甲、臨危', { bingshuRaw: '無戰守勢防備' }),
    seat('sp法', '蓄勢、轉形一', { bingshuRaw: bookFa }),
  ], ['韜晦', '背水', '十面', '月下', '多多'], '控制與坦度取向。'),
  team('baha-b-gong-1', '漢弓／第一套配置', B, [
    seat('sp曹操', '草船借箭、剛柔並濟'),
    seat('sp盧植', '雁行陣、先登死士', { remark: '1速' }),
    seat('sp貂蟬', '深藏若虛、戮力同心'),
  ], [], '45～48級穩定性取向；曹操2速貼盧植。兵書、方略、奇略原文未寫。'),
  team('baha-b-gong-2', '漢弓／第二套配置', B, [
    seat('sp曹操', '剛柔並濟、桃園結義'),
    seat('sp盧植', '雁行陣、先登死士'),
    seat('sp貂蟬', '移花接木、戮力同心'),
  ], [], '建議48級後。深藏與移花按環境互換。兵書、方略、奇略原文未寫。'),
  team('baha-b-gong-3', '漢弓／第三套配置', B, [
    seat('sp曹操', '草船借箭／桃園結義、先登死士', { remark: '原文適用有雍雅沉重' }),
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
  team('baha-c-no1', 'NO.1 許攸40呂', C, [
    seat('40呂', '藏器＋血刃／文武／奮突'),
    seat('未逐格列', '', { generalId: null }),
    seat('未逐格列', '', { generalId: null }),
  ], ['十面', '借箸', '受書', '安儲', '多多益善'], '其他兩人戰法未逐格列，不用別的作者配置補齊。', false),
  team('baha-c-no2', 'NO.2 皇普40呂', C, [
    seat('40呂', '藏器＋奮突／血刃／文武'),
    seat('皇普', '', { generalId: null, remark: '可雍雅尾速' }),
    seat('未逐格列', '', { generalId: null }),
  ], ['十面', '借箸', '受書', '安儲', '多多益善'], '原文字形保留。其他武將未逐格列。', false),
  team('baha-c-no3', 'NO.3 程普行1陣40呂', C, [
    seat('40呂', ''),
    seat('法正', '轉行一陣', { generalId: null, remark: '原文只點名，沒有完整逐格' }),
    seat('程普', ''),
  ], ['十面', '借箸', '受書', '安儲', '多多益善'], '作者建議49～50級後考慮，不能照別篇補完。', false),
  team('baha-c-hangong', '漢弓', C, [
    seat('未逐行標武將', '桃園＋剛柔／雁行＋先登／戮力＋深藏', { generalId: null }),
  ], ['約法', '解衣', '聚義', '遁險', '安儲'], '這段未逐行再標武將，不把推定對應寫成作者已明寫。', false),
  team('baha-c-huangma', '皇馬', C, [
    seat('未逐格列', '槍萬軍可承敵替換；弓錦番軍換解凡，可雁行；盾需蓄勢', { generalId: null }),
  ], [], '沒有完整三人配置。', false),
  team('baha-c-pengci', '碰瓷隊伍', C, [
    seat('周泰', '', { generalId: null, remark: '未完整兩戰法' }),
    seat('張飛', '', { generalId: null, remark: '雄烈；未完整兩戰法' }),
    seat('袁術（sp朱）', '上兵＋焚營（轉獅子）', { generalId: null }),
  ], [], '每次約65%兵出門。作者說要精準＋善戰。', false),
  team('baha-d-dahan', '大漢弓', D, [
    seat('SP曹操', '桃園結義、剛柔並濟'),
    seat('SP盧植', '先登死士、雁形陣', { remark: '1速' }),
    seat('SP貂蟬', '勠力同心、深藏若虛'),
  ], ['推衣解食', '沛縣聚義', '約法三章', '鴻門遇險', '茫蕩隱蹤'], '漢弓多可先帶移花接木。兵書、方略原文未寫。'),
  team('baha-d-taishi', '太師弓', D, [
    seat('SP董卓', '桃園結義、先登死士'),
    seat('SP盧植', '剛柔、雁形陣', { remark: '1速' }),
    seat('SP貂蟬', '勠力同心、深藏若虛'),
  ], ['推衣解食', '沛縣聚義', '約法三章', '鴻門遇險', '茫蕩隱蹤'], '沒有抽滿SP曹操的替代。兵書、方略原文未寫。'),
  team('baha-d-qianlong-diao', '潛龍貂蟬弓', D, [
    seat('SP貂蟬', '剛柔並濟／勠力同心、深藏若虛'),
    seat('曹操', '草船／剛柔、潛龍陣'),
    seat('陸遜', '功不唐捐、萬軍'),
  ], ['推衣解食', '沛縣聚義', '約法三章', '鴻門遇險', '茫蕩隱蹤'], '若兩名均選剛柔會重複，不代選其中一種。'),
  team('baha-d-qianlong-fa', '潛龍法正盾', D, [
    seat('SP法正', '蓄勢待發、潛龍陣'),
    seat('周瑜', '奪魄、風助火勢'),
    seat('SP貂蟬', '剛柔並濟／勠力同心、深藏若虛'),
  ], ['設伏十面', '合圍夾擊', '楚歌四起', '波浪推秦', '功成身退'], '會佔用法正、貂蟬，作者推薦程度一般。'),
  team('baha-d-40lv', '40呂盾', D, [
    seat('40呂布', '血刃（文武）、藏器'),
    seat('SP法正', '蓄勢待發、臨危救主'),
    seat('許攸（程普或者SP皇埔嵩都可）', '三勢陣、藤甲兵'),
  ], ['波浪推秦', '設伏十面', '波浪推秦', '楚歌四起', '波浪推秦', '功成身退'], '原文六張奇略且重複，不縮成五張。帶程普改轉行一陣的槽位未逐格寫。', false),
  team('baha-d-shuzhi', '蜀智盾', D, [
    seat('龐統', '士別三日、杯蛇'),
    seat('諸葛亮', '刮骨／藤甲兵、乘敵不虞'),
    seat('SP法正', '蓄勢待發、拓鎮扼防拒'),
  ], ['芒砀隐踪', '沛县聚义', '波浪推秦', '推食解衣', '约法三章'], '前期刮骨、後期藤甲。正文未明寫每人全S使用方式。'),
  team('baha-d-faguan', '法官盾', D, [
    seat('SP關於', '以寡敵眾、藏器待時', { remark: '疑錯字，不改寫成SP關羽' }),
    seat('張星彩', '魅惑、魚鱗陣', { remark: '是否無雙卡未標，不綁卡' }),
    seat('SP法正', '拓鎮扼防拒、蓄勢待發'),
  ], ['臨危不懼', '楚歌四起', '設伏十面', '博浪推秦', '多多益善'], '馬岱版奇略另列，但兩人戰法未全列，不另補一隊。'),
  team('baha-d-huangma', '皇馬', D, [
    seat('SP馬超', '當峰、催峰斷刃'),
    seat('SP皇埔嵩', '草船、萬軍'),
    seat('許攸', '臨危救主／乘敵不虞、解煩衛'),
  ], ['封狼居胥', '橫掃河西', '催峰陷敵', '孤軍深入', '壯志不絕'], '作者稱可變弓盾。變體不自行補。'),
  team('baha-d-huangma-gong', '皇馬弓', D, [
    seat('SP馬超', '技能不變', { remark: '留言未逐格重列' }),
    seat('SP皇埔嵩', '雁形陣、草船', { remark: '或者不帶草船，帶先登' }),
    seat('許攸', '臨危救主、錦帆軍'),
  ], [], 'B8 2026-11-05 10:38:56 留言。兵書、方略、奇略未另列，不從槍版複製。'),
  team('baha-d-qiaoliao', '喬遼左', D, [
    seat('無雙大喬', '獨行付斗、草船'),
    seat('張遼', '當峰、催峰斷刃'),
    seat('左慈', '臨危救主／乘敵不虞、衡軛陣'),
  ], ['封狼居胥', '孤軍深入', '博浪推秦', '橫掃河西', '壯志不絕'], '推薦前期弓、後期槍。'),
  team('baha-d-saozi', '嫂子弓', D, [
    seat('孫權', '當峰、兵無'),
    seat('SP步練師', '八門、深謀遠慮'),
    seat('無雙大喬', '獨行付斗、草船'),
  ], ['推衣解食', '伺橋受書', '臨危不懼', '借箸代籌', '約法三章'], '作者說模擬評分好但本人實戰拉胯。'),
  team('baha-d-kangkai', '慷慨弓', D, [
    seat('甘寧', '草船、錦帆軍'),
    seat('太史慈', '當峰、催峰斷刃'),
    seat('SP呂蒙／程普', '臨危救主／乘敵不虞、雁形陣'),
  ], ['封狼居胥', '催峰陷敵', '定計安儲', '壯志不絕', '追亡逐北'], '無皇馬、大漢玩家的首隊選項。'),
  team('baha-d-wenhou', '溫侯弓', D, [
    seat('許攸', '武峰陣、錦帆軍'),
    seat('左慈', '臨危救主、暫避鋒芒'),
    seat('呂布', '當峰、催峰'),
  ], ['背水列阵', '设伏十面', '波浪推秦', '受书', '多多益善'], '諸葛亮／甘寧變體逐格不全，不補。'),
  team('baha-d-wumou', '五謀係列', D, [
    seat('SP荀彧', '靈機一動、勠力同心'),
    seat('荀彧', '刮骨、轉獅子奮迅／上兵伐謀焚輜', { remark: '與下文荀攸／賈詡描述衝突' }),
    seat('SP郭嘉', '奪魄、上兵伐謀／當峰'),
  ], ['设伏十面', '背水列陣', '合围夹击', '波浪推奏', '多多益善'], '戰法分隔不清。賈詡版奇略另為设伏十面、背水列陣、合围夹击、楚歌四起、多多益善，不併成確定隊。', false),
  team('baha-d-pengci', '碰瓷系列／潛龍周泰袁術和SP朱儁', D, [
    seat('周泰', '潛龍、盛氣'),
    seat('袁術', '焚輜、上兵伐謀'),
    seat('SP朱儁', '太平、無當'),
  ], ['背水列阵', '设伏十面', '波浪推秦', '受书', '多多益善'], '每將6000～7000兵。SP朱儁可換張飛（橫掃、疾風驟雨）或SP袁紹（擎刀、疾風驟雨）。'),
  team('baha-e-dahan-dun', '大漢盾', E, [
    seat('40呂', '', { remark: '文字沒有逐格配置' }),
  ], [], '松鼠自述先鋒服實測與三版比較。不把別篇文章的配置掛到這篇。圖片未轉錄。', false),
  team('baha-f-40y', '40Y呂布許攸SP法正', F, [
    seat('40Y呂布', ''),
    seat('許攸', '三勢陣'),
    seat('SP法正', ''),
  ], [], '5樓只列隊員與三勢陣，沒有完整配法。', false),
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

const HOLD = {
  'baha-d-qianlong-diao': 'SP貂蟬與曹操均有剛柔選項，不能同時選造成重複；分支合法組合仍待確認。',
  'baha-d-40lv': '奇略原文六張，波浪推秦重複三次；不能當第2–6回合五張。程普替代槽位亦未完整指定。',
  'baha-d-faguan': '原文SP關於疑為SP關羽、張星彩卡別未明；不得默默改字或綁無雙卡。',
  'baha-d-wumou': '第二將原文荀彧與上下文荀攸／賈詡衝突；轉獅子奮迅／上兵伐謀焚輜分隔與槽位不明。',
};

for (const row of hanyanBahamut) {
  if (VERIFIED.has(row.id)) row.status = '已核';
  if (HOLD[row.id]) {
    row.status = '待核';
    row.note = HOLD[row.id];
  }
}
