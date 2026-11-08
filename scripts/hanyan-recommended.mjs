/** 漢焰長明官方推薦 16 隊。戰法對目錄原版，缺的只留原名。全部待核。 */
const OFFICIAL = 'https://www.facebook.com/100064157226677/posts/1549258503889376/';

function book(branch, primary, left, right) {
  return { branch, primary, secondary: [left, right] };
}

function seat(generalId, generalName, learned, learnedNames, bingshu, extra = '') {
  const member = { generalId, generalName, learned, learnedNames, bingshu };
  const opts = typeof extra === 'string' ? { remark: extra } : (extra || {});
  if (opts.remark) member.remark = opts.remark;
  if (opts.traits?.length) member.traits = opts.traits;
  if (opts.aptNeed) member.aptNeed = opts.aptNeed;
  return member;
}

const SOURCE_NOTE = '官方原圖待核';
const IMMORTAL_IDS = new Set(['zhangjiao', 'yuji', 'zuoci']);

function xunbingNote(members) {
  const need = (members || []).some((member) => member?.aptNeed?.letter === 'S' && !IMMORTAL_IDS.has(member.generalId));
  return need ? '需訓兵振旅' : '';
}

function team(id, title, strategy, slug, members, tricks, note = '', withOfficial = true) {
  const row = {
    id,
    scenario: 'hanyan',
    title,
    status: '待核',
    strategy: [strategy],
    tricks,
    source: `https://sgsdeck.com/recommended/${slug}`,
    note: [SOURCE_NOTE, note, xunbingNote(members)].filter(Boolean).join('。'),
    members,
  };
  if (withOfficial) row.officialSource = OFFICIAL;
  return row;
}

const sanjun = () => book('shiji', 'sanjun', 'jiuzhan', 'tongjun');
const chui = () => book('shiji', 'sanjun', 'chuilian', 'tongjun');

export const hanyanRecommended = [
  team('hanyan-dahan-gong', '大漢弓', '整軍', 's27-official-dahan-gong', [
    seat('sp-caocao', 'SP曹操', ['taoyuan', 'gangrou-ji'], ['桃園結義', '剛柔並濟'], sanjun()),
    seat('sp-luzhi', 'SP盧植', ['yanxing', 'xiandeng'], ['雁行陣', '先登死士'], sanjun()),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjun()),
  ], ['芒碭隱蹤', '沛縣聚義', '約法三章', '鴻門遁險', '推食解衣']),
  team('hanyan-sanshi-lvbu', '三勢40Y呂布盾', '強攻', 's27-official-sanshi-lvbu-dun', [
    seat('y40-lvbu', '40Y呂布', ['xueren', 'chenmu'], ['血刃爭鋒', '瞋目橫矛'], book('jiubian', 'shiruo', 'jiuzhan', 'yanxu'), '官方卡名 40Y呂布，對到圖鑑 40Y呂布，不是普通呂布。'),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'tengjia'], ['蓄勢待發', '藤甲兵'], chui()),
    seat('xuyou', '許攸', ['sanshi', 'linwei'], ['三勢陣', '臨危救主'], chui()),
  ], ['橫掃河西', '追亡逐北', '博浪椎秦', '臨危不懼', '壯志不絕']),
  team('hanyan-huangma', '皇馬槍', '強攻', 's27-official-huangma-qiang', [
    seat('sp-machao', 'SP馬超', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], book('jiubian', 'yuanqi', 'suzhan', 'yanxu')),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'wanjun'], ['草船借箭', '萬軍奪帥'], book('yongjian', 'shenshi', 'kaihe', 'fenli')),
    seat('xuyou', '許攸', ['linwei', 'jiefan'], ['臨危救主', '解煩衛'], book('junxing', 'xibing', 'shoushi', 'fangbei')),
  ], ['橫掃河西', '封狼居胥', '摧鋒陷敵', '斬逆納降', '追亡逐北']),
  team('hanyan-faguan', '法關盾', '襲擾', 's27-official-fa-guan-dun', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], book('jiubian', 'fenji', 'baizhan', 'yanxu')),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'feigong'], ['蓄勢待發', '非攻制勝'], chui()),
    seat('madai', '馬岱', ['tengjia', 'yulin'], ['藤甲兵', '魚鱗陣'], chui(), '可換無雙星彩'),
  ], ['設伏十面', '背水列陣', '楚歌四起', '治延軍勢', '多多益善']),
  team('hanyan-wumou', '五謀騎', '謀算', 's27-official-wumou-qi', [
    seat('sp-xunyu', 'SP荀彧', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], chui()),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'shangbing'], ['奪魂挾魄', '上兵伐謀'], book('xushi', 'yizhi', 'guimou', 'jiangwei-book')),
    seat('jiaxu', '賈詡', ['lingji', 'luli'], ['靈機一動', '戮力同心'], chui()),
  ], ['設伏十面', '背水列陣', '楚歌四起', '多多益善', '合圍夾擊']),
  team('hanyan-erqiao', '二喬弓', '強攻', 's27-official-erqiao-gong', [
    seat('wushuang-daqiao', '無雙大喬', ['meihuo', 'duxing'], ['魅惑', '獨行赴斗'], chui()),
    seat('sunshangxiang', '孫尚香', ['dangfeng', 'sucheng'], ['當鋒摧決', '速乘其利'], book('zuozhan', 'shengyi', 'cangdao', 'shengzhan')),
    seat('wushuang-xiaoqiao', '無雙小喬', ['caochuan', 'linwei'], ['草船借箭', '臨危救主'], book('shiji', 'zhenge', 'chuilian', 'tongjun')),
  ], ['橫掃河西', '諫封示公', '博浪椎秦', '封狼居胥', '追亡逐北']),
  team('hanyan-dudu', '都督弓', '襲擾', 's27-official-dudu-gong', [
    seat('zhouyu', '周瑜', ['duohun', 'luli'], ['奪魂挾魄', '戮力同心'], book('zuozhan', 'shengyi', 'wentao', 'shengzhan')),
    seat('luxun', '陸遜', ['gongbu', 'wanjun'], ['功不唐捐', '萬軍奪帥'], book('yongjian', 'chuqi', 'jingzhun', 'fenli')),
    seat('sp-lvmeng', 'SP呂蒙', ['caochuan', 'dangfeng'], ['草船借箭', '當鋒摧決'], book('zuozhan', 'qizheng', 'cangdao', 'wulue')),
  ], ['設伏十面', '背水列陣', '治延軍勢', '多多益善', '合圍夾擊'], '原圖寫「合圍突擊」，整理站推定為合圍夾擊。'),
  team('hanyan-qilin', '麒麟弓', '謀算', 's27-official-qilin-gong', [
    seat('jiangwei', '姜維', ['duohun', 'beishe'], ['奪魂挾魄', '杯蛇鬼車'], book('zuozhan', 'manyong', 'wentao', 'zhirui')),
    seat('pangtong', '龐統', ['taiping', 'shibie'], ['太平道法', '士別三日'], book('xushi', 'houfa', 'jiangwei-book', 'zhanbu')),
    seat('zhugeliang', '諸葛亮', ['dangfeng', 'guagu'], ['當鋒摧決', '刮骨療毒'], book('jiubian', 'yuanqi', 'lijun', 'chiyuan')),
  ], ['設伏十面', '楚歌四起', '背水列陣', '多多益善', '博浪椎秦']),
  team('hanyan-lvdiaolu', '40Y呂貂盧弓', '久戰', 's27-official-lv-diao-lu-gong', [
    seat('y40-lvbu', '40Y呂布', ['xueren', 'yinxian'], ['血刃爭鋒', '引弦力戰'], book('jiubian', 'shiruo', 'jiuzhan', 'yanxu'), { traits: ['踩踏', '無雙'], remark: '官方卡名 40Y呂布，對到圖鑑 40Y呂布，不是普通呂布。' }),
    seat('sp-luzhi', 'SP盧植', ['yanxing', 'gangrou-ji'], ['雁行陣', '剛柔並濟'], sanjun(), { traits: ['護主', '妖氣'] }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjun(), { traits: ['雍雅', '妖氣'] }),
  ], ['橫掃河西', '追亡逐北', '鴻門遁險', '沛縣聚義', '約法三章'], '', false),
  team('hanyan-qianlong-lvbu', '潛龍呂布弓', '謀算', 's27-official-qianlong-lvbu-gong', [
    seat('xuyou', '許攸', ['qianlong', 'linwei'], ['潛龍陣', '臨危救主'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['靈動', '出奇'], aptNeed: { troop: '弓', letter: 'S' } }),
    seat('zhouyu', '周瑜', ['duohun', 'luli'], ['奪魂挾魄', '戮力同心'], book('zuozhan', 'shengyi', 'wentao', 'shengzhan'), { traits: ['樂奏', '暴躁'], remark: '可換SP郭嘉（兵書以治擊亂、鬼謀、將威，特技出奇）' }),
    seat('lvbu', '呂布', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], book('yongjian', 'chuqi', 'jingzhun', 'kaihe'), { traits: ['無雙', '靈動'], remark: '轉漢' }),
  ], ['背水列陣', '設伏十面', '誘敵離營', '博浪椎秦', '合圍夾擊'], '', false),
  team('hanyan-pangtong-gong', '龐統弓', '謀算', 's27-official-pangtong-gong', [
    seat('sp-zhugeliang', 'SP諸葛亮', ['caochuan', 'yanxing'], ['草船借箭', '雁行陣'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['靈動', '天機'], remark: '替代選項：盛氣凌敵' }),
    seat('guanyu', '關羽', ['qianli', 'jueqi'], ['千里走單騎', '絕其汲道'], book('xushi', 'houfa', 'guimou', 'miaosuan'), { traits: ['武聖'], aptNeed: { troop: '弓', letter: 'S' } }),
    seat('pangtong', '龐統', ['fenzui', 'beishe'], ['焚輜營壘', '杯蛇鬼車'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['靈動'] }),
  ], ['博浪椎秦', '設伏十面', '背水列陣', '多多益善', '楚歌四起'], '', false),
  team('hanyan-taiwei', '太尉盾', '整軍', 's27-official-taiwei-dun', [
    seat('simayi', '司馬懿', ['zhongzhi', 'hantian'], ['眾志成城', '熯天熾地'], book('shiji', 'leshan', 'tongjun', 'chuilian'), { traits: ['長慮', '擐甲'] }),
    seat('caocao', '曹操', ['meihuo', 'tengjia'], ['魅惑', '藤甲兵'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['援助'] }),
    seat('manchong', '滿寵', ['xushidai', 'guagu'], ['蓄勢待發', '刮骨療毒'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['靈動'] }),
  ], ['芒碭隱蹤', '推食解衣', '沛縣聚義', '博浪椎秦', '敗中求生'], '', false),
  team('hanyan-beifa', '北伐盾', '整軍', 's27-official-beifa-dun', [
    seat('sp-zhugeliang', 'SP諸葛亮', ['xushidai', 'caochuan'], ['蓄勢待發', '草船借箭'], book('shiji', 'sanjun', 'chuilian', 'tongjun'), { traits: ['靈動', '天機'], aptNeed: { troop: '盾', letter: 'S' }, remark: '替代選項：知己知彼' }),
    seat('guanxing', '關興', ['cangqi', 'qianli'], ['藏器待時', '千里走單騎'], book('xushi', 'houfa', 'guimou', 'jiangwei-book'), { traits: ['龍驤', '靈動'], aptNeed: { troop: '盾', letter: 'S' } }),
    seat('zhangbao', '張苞', ['futang', 'feigong'], ['赴湯蹈火', '非攻制勝'], book('shiji', 'zhenge', 'tongjun', 'chuilian'), { traits: ['虎峙', '靈動'] }),
  ], ['沛縣聚義', '芒碭隱蹤', '博浪椎秦', '定計安儲', '敗中求生'], '', false),
  team('hanyan-hedan', '核彈張', '謀算', 's27-official-hedan-zhang', [
    seat('zhoutai', '周泰', ['qianlong', 'shengqi'], ['潛龍陣', '盛氣凌敵'], book('junxing', 'shoudao', 'shoushi', 'tiejia'), { traits: ['靈動', '護主'] }),
    seat('zhangfei', '張飛', ['gangyong', 'jifeng'], ['剛勇無前', '疾風驟雨'], book('yongjian', 'yitui', 'jingzhun', 'chizhong'), { traits: ['雄烈'] }),
    seat('sp-yuanshao', 'SP袁紹', ['hengsao', 'xianzhen'], ['橫掃千軍', '陷陣營'], book('zuozhan', 'manyong', 'shengzhan', 'zhirui'), { traits: ['號令'], aptNeed: { troop: '盾', letter: 'S' } }),
  ], ['設伏十面', '背水列陣', '博浪椎秦', '楚歌四起', '定計安儲'], '', false),
  team('hanyan-kangkai', '慷慨弓', '強攻', 's27-official-kangkai-gong', [
    seat('ganning', '甘寧', ['caochuan', 'jinfan'], ['草船借箭', '錦帆軍'], book('shiji', 'leshan', 'tongjun', 'chuilian'), { traits: ['華服'] }),
    seat('taishici', '太史慈', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], book('zuozhan', 'shengyi', 'wulue', 'zhirui'), { traits: ['靈動'] }),
    seat('sp-lvmeng', 'SP呂蒙', ['yanxing', 'linwei'], ['雁行陣', '臨危救主'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['踩踏'] }),
  ], ['封狼居胥', '摧鋒陷敵', '定計安儲', '壯志不絕', '追亡逐北'], '', false),
  team('hanyan-sanxian', '三仙飛熊', '謀算', 's27-official-sanxian-feixiong', [
    seat('zhangjiao', '張角', ['taiping', 'shangbing'], ['太平道法', '上兵伐謀'], book('xushi', 'jizhan', 'guimou', 'jiangwei-book'), { traits: ['天公', '靈動'], aptNeed: { troop: '騎', letter: 'S' } }),
    seat('yuji', '于吉', ['fengshi', 'feixiong'], ['鋒矢陣', '飛熊軍'], book('shiji', 'sanjun', 'tongjun', 'chuilian'), { traits: ['行雨'] }),
    seat('zuoci', '左慈', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], book('jiubian', 'yuanqi', 'jiuzhu', 'lijun'), { traits: ['奇門'] }),
  ], ['設伏十面', '楚歌四起', '背水列陣', '暗度陳倉', '功成身退'], '', false),
];

/** 訓兵振旅不另做標記；需用的隊伍寫在註解。 */
export const hanyanMerits = [];
