/** 大米團隊漢焰長明推薦。截圖轉錄，不提供套用。斜線只當替代。 */

const SOURCE = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=6536';
const AUTHOR = '三國志黑暗大米';
const BASE = '使用者提供截圖；作者巴哈頁聯絡方式吻合，漢焰版原帖與伺服器區域未確認';

function book(branch, primary, left, right) {
  return { branch, primary, secondary: [left, right] };
}

function seat(generalId, generalName, learned, learnedNames, bingshu, extra = {}) {
  const member = { generalId, generalName, learned, learnedNames, bingshu };
  if (extra.remark) member.remark = extra.remark;
  if (extra.traits?.length) member.traits = extra.traits;
  if (extra.aptNeed) member.aptNeed = extra.aptNeed;
  return member;
}

function xunbingNote(members) {
  const need = (members || []).some((member) => member?.aptNeed?.letter === 'S');
  return need ? '需訓兵振旅' : '';
}

function team(id, title, members, tricks, extraNote = '', scenarioOnly = false) {
  const row = {
    id,
    scenario: 'hanyan',
    title,
    status: '已核',
    origin: 'dami',
    originLabel: '大米團隊（截圖）',
    applyReady: false,
    author: AUTHOR,
    source: SOURCE,
    strategy: [],
    tricks,
    note: [BASE, extraNote, xunbingNote(members)].filter(Boolean).join('。'),
    members,
  };
  if (scenarioOnly) row.scenarioOnly = true;
  return row;
}

const chui = () => book('shiji', 'sanjun', 'chuilian', 'tongjun');
const fenji = () => book('jiubian', 'fenji', 'baizhan', 'yanxu');
const houfa = () => book('xushi', 'houfa', 'guimou', 'jiangwei-book');
const faTraits = ['符咒', '奇算', '出奇', '長健'];
const guanTraits = ['武聖', '雍雅', '破勢', '暴躁'];
const qilueGuan = ['設伏十面', '博浪椎秦', '臨危不懼', '楚歌四起', '多多益善'];
const qilueQi = ['合圍夾擊', '設伏十面', '楚歌四起', '博浪椎秦', '多多益善'];

function guanYu() {
  return seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
    traits: guanTraits,
    aptNeed: { troop: '盾', letter: 'S' },
    remark: '屬性高武',
  });
}

function faZheng(alt) {
  return seat('sp-fazheng', 'SP法正', ['xushidai', 'tuo-zhene'], ['蓄勢待發', '拓·鎮扼防拒'], chui(), {
    traits: faTraits,
    remark: alt ? '屬性高智。第二戰法可換非攻制勝' : '屬性高智',
  });
}

export const hanyanDami = [
  team('dami-madai', '馬岱法關盾', [
    guanYu(),
    seat('madai', '馬岱', ['yulin', 'feigong'], ['魚鱗陣', '非攻制勝'], chui(), {
      traits: ['石膚', '援助', '護主', '剛體'],
      remark: '屬性高統。第二戰法可換藤甲兵',
    }),
    faZheng(true),
  ], qilueGuan),
  team('dami-xingcai', '星彩法關盾', [
    guanYu(),
    seat('wushuang-xingcai', '無雙星彩', ['yulin', 'feigong'], ['魚鱗陣', '非攻制勝'], chui(), {
      traits: ['石膚', '援助', '剛體'],
      remark: '截圖寫 co星彩。屬性高統。第二戰法可換藤甲兵',
    }),
    faZheng(true),
  ], qilueGuan),
  team('dami-shuzhi', '蜀智盾', [
    seat('pangtong', '龐統', ['shibie', 'beishe'], ['士別三日', '杯蛇鬼車'], book('shiji', 'sanjun', 'guixin', 'tongjun'), {
      traits: ['雍雅', '暴躁'],
      aptNeed: { troop: '盾', letter: 'S' },
      remark: '特技擇一：劈風或迴響',
    }),
    seat('zhugeliang', '諸葛亮', ['chengdi', 'guagu'], ['乘敵不虞', '刮骨療毒'], chui(), {
      aptNeed: { troop: '盾', letter: 'A' },
    }),
    faZheng(false),
  ], ['楚歌四起', '暗度陳倉', '功成身退', '合圍夾擊', '設伏十面'], '', true),
  team('dami-shugong', '蜀弓', [
    seat('jiangwei', '姜維', ['duohun', 'fenzui'], ['奪魂挾魄', '焚輜營壘'], book('zuozhan', 'manyong', 'wentao', 'zhirui'), {
      traits: ['靈動'],
    }),
    seat('pangtong', '龐統', ['taiping', 'shangbing'], ['太平道法', '上兵伐謀'], houfa(), {
      traits: ['靈動', '暴躁'],
      remark: '特技擇一：劈風或迴響',
    }),
    seat('zhugeliang', '諸葛亮', ['yanxing', 'shengqi'], ['雁行陣', '盛氣凌敵'], chui(), {
      traits: ['神算', '靈動', '長健'],
    }),
  ], ['三策並進', '暗度陳倉', '背水列陣', '多多益善', '設伏十面'], '姜維主兵書截圖讀作蠻勇非勇'),
  team('dami-beifa', '北伐盾', [
    seat('sp-zhugeliang', 'SP諸葛亮', ['zhiji', null], ['知己知彼', '奇正之勢'], houfa(), {
      traits: ['神算', '長健'],
      aptNeed: { troop: '盾', letter: 'S' },
    }),
    seat('guanxing', '關興', ['qianli', 'wenwu'], ['千里走單騎', '文武雙全'], houfa(), {
      traits: ['龍驤', '暴躁'],
      aptNeed: { troop: '盾', letter: 'S' },
      remark: '截圖寫關與、千裏，對到關興、千里走單騎',
    }),
    seat('zhangbao', '張苞', ['feigong', 'futang'], ['非攻制勝', '赴湯蹈火'], book('junxing', 'xibing', 'shoushi', 'fangbei'), {
      traits: ['虎峙'],
    }),
  ], ['芒碭隱蹤', '博浪椎秦', '約法三章', '推食解衣', '圯橋受書'], '奇正之勢圖鑑未收。奇略末張依 sgsdeck 奇略列表改為圯橋受書', true),
  team('dami-wanghong', '網紅槍', [
    seat('zhangfei', '張飛', ['luoyi', 'yiqi'], ['裸衣血戰', '一騎當千'], book('yongjian', 'yizhi-bao', 'jingzhun', 'shanzhan'), {
      traits: ['雄烈', '靈動', '踩踏', '暴躁'],
      remark: '第二戰法可換摧鋒斷刃',
    }),
    seat('guanyinping', '關銀屏', ['jifeng', 'hengsao'], ['疾風驟雨', '橫掃千軍'], book('xushi', 'yizhi', 'guimou', 'zhirui'), {
      traits: ['迴響', '靈動', '踩踏'],
    }),
    seat('huangyueying', '黃月英', ['shengqi', null], ['盛氣凌敵', '大戰士'], book('jiubian', 'youdi', 'yanxu', 'suzhan'), {
      traits: ['靈動', '踩踏'],
      aptNeed: { troop: '槍', letter: 'S' },
    }),
  ], ['壯志不絕', '臨危不懼', '封狼居胥', '博浪椎秦', '橫掃河西'], '大戰士圖鑑未收'),
  team('dami-fugui', '富貴騎', [
    seat('sp-xunyu', 'SP荀彧', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], chui(), {
      traits: faTraits,
    }),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'dangfeng'], ['奪魂挾魄', '當鋒摧決'], book('zuozhan', 'qizheng', 'wentao', 'zhirui'), {
      traits: faTraits,
      remark: '第二戰法可換上兵伐謀',
    }),
    seat('jiaxu', '賈詡', ['lingji', 'luli'], ['靈機一動', '戮力同心'], book('shiji', 'sanjun', 'jiuzhan', 'tongjun'), {
      traits: ['靈動', '出奇'],
      remark: '特技擇一：迴響或符咒。第二戰法可換轉·獅子奮迅',
    }),
  ], qilueQi, '轉·獅子奮迅已收入圖鑑，此卡仍只列為替代'),
  team('dami-shuzhi-qi', '叔侄騎', [
    seat('sp-xunyu', 'SP荀彧', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], chui(), {
      traits: faTraits,
    }),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'dangfeng'], ['奪魂挾魄', '當鋒摧決'], book('zuozhan', 'qizheng', 'wentao', 'zhirui'), {
      traits: faTraits,
      remark: '第二戰法可換上兵伐謀',
    }),
    seat('xunyou', '荀攸', ['lingji', 'luli'], ['靈機一動', '戮力同心'], book('shiji', 'sanjun', 'jiuzhan', 'tongjun'), {
      traits: ['靈動', '出奇'],
      remark: '特技擇一：迴響或符咒。第二戰法可換轉·獅子奮迅',
    }),
  ], qilueQi, '轉·獅子奮迅已收入圖鑑，此卡仍只列為替代'),
  team('dami-taiwei', '太尉盾', [
    seat('simayi', '司馬懿', ['hantian', 'zhongzhi'], ['熯天熾地', '眾志成城'], book('shiji', 'leshan', 'jiuzhan', 'tongjun'), {
      traits: ['劈風', '長慮', '出奇', '暴躁'],
    }),
    seat('caocao', '曹操', ['tengjia', 'meihuo'], ['藤甲兵', '魅惑'], chui(), {
      traits: ['援助'],
    }),
    seat('manchong', '滿寵', ['xingyi', 'xushidai'], ['形一陣', '蓄勢待發'], chui(), {
      traits: ['扶危', '長健'],
    }),
  ], ['芒碭隱蹤', '沛縣聚義', '約法三章', '推食解衣', '三策並進']),
];
