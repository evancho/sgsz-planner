/** 陸服玩家版：秋石 2026-03-20 T0～T0.5 新核心，以及阿焰 2026-02-11 十隊共存獨有核心。同核變體經 merges 掛到既有主卡。 */

export const QS_SRC = 'https://mp.weixin.qq.com/s/cgz066TJU5EnG1xttpZ22A';
export const QS_NOTION = 'https://spacekid.notion.site/337159b6f94080cdb781e4dd34af19e8';
export const AY_SRC = 'https://www.kdocs.cn/l/ckfvAjUzUXFe';
export const AY_NOTION = 'https://spacekid.notion.site/305159b6f9408090a623db74ee237084';

function book(branch, primary, left, right) {
  return { branch, primary, secondary: [left, right] };
}

function seat(generalId, generalName, learned, learnedNames, bingshu, extra = {}) {
  const member = { generalId, generalName, learned, learnedNames };
  if (bingshu) member.bingshu = bingshu;
  if (extra.points) member.points = extra.points;
  if (extra.remark) member.remark = extra.remark;
  if (extra.traits?.length) member.traits = extra.traits;
  if (extra.aptNeed) member.aptNeed = extra.aptNeed;
  if (extra.tacticsRaw) member.tacticsRaw = extra.tacticsRaw;
  if (extra.bingshuRaw) member.bingshuRaw = extra.bingshuRaw;
  if (extra.unlisted?.length) member.unlisted = extra.unlisted;
  if (extra.generalChoices?.length) member.generalChoices = extra.generalChoices;
  return member;
}

const chui = () => book('shiji', 'sanjun', 'chuilian', 'tongjun');
const sanjiu = () => book('shiji', 'sanjun', 'jiuzhan', 'tongjun');
const fenji = () => book('jiubian', 'fenji', 'baizhan', 'yanxu');
const houfa = () => book('xushi', 'houfa', 'guimou', 'jiangwei-book');
const houfaBu = () => book('xushi', 'houfa', 'miaosuan', 'zhanbu');
const damou = () => book('xushi', 'damou', 'guimou', 'jiangwei-book');
const qizheng = (a = 'wentao', b = 'zhirui') => book('zuozhan', 'qizheng', a, b);
const yuanqi = (a = 'suzhan', b = 'yanxu') => book('jiubian', 'yuanqi', a, b);
const leshan = (a = 'jiuzhan', b = 'guixin') => book('shiji', 'leshan', a, b);
const chuqi = (a = 'jingzhun', b = 'kaihe') => book('yongjian', 'chuqi', a, b);
const biqi = () => book('junxing', 'biqi', 'shoushi', 'fangbei');
const xibingFB = () => book('junxing', 'xibing', 'fangbei', 'gangrou');
const xibingSF = () => book('junxing', 'xibing', 'shoushi', 'fangbei');
const shenshi = () => book('yongjian', 'shenshi', 'kaihe', 'fenli');
const shengyi = (a = 'shengzhan', b = 'wentao') => book('zuozhan', 'shengyi', a, b);
const yingji = (a = 'chuilian', b = 'tongjun') => book('shiji', 'yingji', a, b);
const manyong = (a = 'zhirui', b = 'wentao') => book('zuozhan', 'manyong', a, b);

function xunbingNote(members) {
  const need = (members || []).some((member) => member?.aptNeed?.letter === 'S');
  return need ? '需訓兵振旅' : '';
}

function packNote(...parts) {
  return parts
    .map((part) => String(part || '').trim().replace(/。+$/g, ''))
    .filter(Boolean)
    .join('。')
    .slice(0, 240);
}

function qsTeam(id, title, rank, members, tricks, strategy, extraNote = '', alternatives) {
  const note = packNote(
    '陸服玩家版，待核。秋石小軍師 2026-03-20，太空小孩 Notion 轉載',
    extraNote,
    xunbingNote(members),
  );
  const row = {
    id,
    scenario: 'hanyan',
    title,
    status: '待核',
    origin: 'lufu',
    originLabel: '陸服玩家版',
    applyReady: true,
    author: '秋石小軍師',
    source: QS_SRC,
    reprintSource: QS_NOTION,
    postedAt: '2026-03-20',
    rank,
    rankStatus: '待核',
    rankBasis: '秋石小軍師 2026-03-20 陸服天梯表檔次，僅供參考，不是台服 T 級。',
    rankConfidence: '低',
    rankSources: [
      { label: '微信原文', url: QS_SRC },
      { label: 'Notion 轉載', url: QS_NOTION },
    ],
    strategy: strategy ? [strategy] : [],
    tricks,
    note,
    members,
  };
  if (alternatives?.length) row.alternatives = alternatives;
  return row;
}

function ayTeam(id, title, rank, score, members, tricks, strategy, extraNote = '', alternatives) {
  const note = packNote(
    '陸服玩家版，待核。阿焰 2026-02-11 十隊共存，太空小孩 Notion 轉載',
    score ? `陸服玩家分 ${score}` : '',
    extraNote,
    xunbingNote(members),
  );
  const row = {
    id,
    scenario: 'hanyan',
    title,
    status: '待核',
    origin: 'lufu',
    originLabel: '陸服玩家版',
    applyReady: true,
    author: '阿焰',
    source: AY_SRC,
    reprintSource: AY_NOTION,
    postedAt: '2026-02-11',
    groupLabel: '十隊共存',
    rank,
    rankStatus: '待核',
    rankBasis: '阿焰 2026-02-11 十隊共存表上的檔次，僅供參考，不是台服 T 級。分數只寫在備註。',
    rankConfidence: '低',
    rankSources: [
      { label: '金山文檔', url: AY_SRC },
      { label: 'Notion 轉載', url: AY_NOTION },
    ],
    strategy: strategy ? [strategy] : [],
    tricks,
    note,
    members,
  };
  if (alternatives?.length) row.alternatives = alternatives;
  return row;
}

function asAlt(team, title, diffs) {
  return {
    id: team.id,
    title,
    status: '待核',
    originLabel: '陸服玩家版',
    author: team.author,
    source: team.source,
    reprintSource: team.reprintSource,
    postedAt: team.postedAt,
    groupLabel: team.groupLabel,
    diffs,
    members: team.members,
    strategy: team.strategy,
    tricks: team.tricks,
    note: team.note,
  };
}

const qilueZhengjunBai = ['親釋荊縛', '芒碭隱蹤', '推食解衣', '敗中求生', '沛縣聚義'];
const qilueZhengjunYue = ['親釋荊縛', '芒碭隱蹤', '推食解衣', '約法三章', '沛縣聚義'];
const qilueZhengjunBo = ['芒碭隱蹤', '推食解衣', '博浪椎秦', '約法三章', '沛縣聚義'];
const qilueZhengjunBai2 = ['芒碭隱蹤', '推食解衣', '博浪椎秦', '敗中求生', '沛縣聚義'];
const qilueMousuanWu = ['臨危不懼', '背水列陣', '誘敵離營', '設伏十面', '合圍夾擊'];
const qilueXiraoFa = ['設伏十面', '背水列陣', '楚歌四起', '治延軍勢', '多多益善'];
const qilueHanshi = ['推食解衣', '芒碭隱蹤', '約法三章', '鴻門遁險', '沛縣聚義'];
const qilueYuanmeng = ['芒碭隱蹤', '鴻門遁險', '推食解衣', '約法三章', '沛縣聚義'];
const qilueJuma = ['推食解衣', '疲楚奪勢', '鴻門遁險', '約法三章', '沛縣聚義'];
const qilueHuangma = ['親釋荊縛', '橫掃河西', '封狼居胥', '摧鋒陷敵', '斬逆納降'];
const qilueYuexia = ['月下追賢', '藏書納賂', '治延軍勢', '設伏十面', '多多益善'];
const qilueShenhuo = ['設伏十面', '月下追賢', '治延軍勢', '藏書納賂', '多多益善'];

const zhenfuFaguanNote = '有藏器用親釋荊縛，無藏器用博浪椎秦。敵人火隊多時諸葛亮可改陷陣營。SP關羽帶藏器待時更強。';

export const hanyanLufuMains = [
  qsTeam('lufu-qs-wangyi-qi', '王異騎', 'T0', [
    seat('sp-xunyu', 'SP荀彧', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], chui(), {
      points: '30速+智',
      traits: ['疾馳'],
      remark: '竭力可換移花接木；拒馬弓多時改移花接木配飛熊軍',
    }),
    seat('wangyi', '王異', ['duohun', 'dangfeng'], ['奪魂挾魄', '當鋒摧決'], qizheng(), {
      points: '智',
      traits: ['騎寶物'],
    }),
    seat('jiaxu', '賈詡', ['lingji', 'luli'], ['靈機一動', '戮力同心'], chui(), {
      points: '智最高',
      traits: ['援助'],
    }),
  ], qilueZhengjunBai, '整軍', 'SP荀彧加30速度，可反彈盛氣凌敵。'),

  qsTeam('lufu-qs-xunyu-taiwei', 'SP荀彧太尉盾', 'T0.5', [
    seat('simayi', '司馬懿', ['hantian', 'zhongzhi'], ['熯天熾地', '眾志成城'], leshan(), {
      points: '智',
      traits: ['長慮', '擐甲'],
    }),
    seat('zhangchunhua', '張春華', ['meihuo', 'fengshi'], ['魅惑', '鋒矢陣'], chui(), {
      points: '智',
      traits: ['盾寶物'],
    }),
    seat('sp-xunyu', 'SP荀彧', ['xushidai', 'tuo-zhene'], ['蓄勢待發', '拓·鎮扼防拒'], chui(), {
      points: '30速+智',
      traits: ['疾馳'],
      aptNeed: { troop: '盾', letter: 'S' },
      remark: '表上裝備另寫訓兵振旅S盾',
    }),
  ], qilueZhengjunYue, '整軍', '鎮撫魅惑體系加SP荀彧警戒，表稱強度明顯提升。張春華為名將（統御3），不是藍將。'),

  qsTeam('lufu-qs-sima-feixiong', '司馬飛熊騎', 'T0.5', [
    seat('simayi', '司馬懿', ['shangbing', 'zhongzhi'], ['上兵伐謀', '眾志成城'], book('shiji', 'leshan', 'jiuzhan', 'tongjun'), {
      points: '智',
      traits: ['長慮', '擐甲', '寶物'],
    }),
    seat('wangyi', '王異', ['meihuo', 'feixiong'], ['魅惑', '飛熊軍'], chui(), {
      points: '智',
      aptNeed: { troop: '騎', letter: 'S' },
    }),
    seat('sp-xunyu', 'SP荀彧', ['tuo-zhene', 'guagu'], ['拓·鎮扼防拒', '刮骨療毒'], chui(), {
      points: '30速+智',
      traits: ['疾馳'],
    }),
  ], ['芒碭隱蹤', '推食解衣', '博浪椎秦', '約法三章', '沛縣聚義'], '整軍', 'SP荀彧加30速度，可反彈盛氣凌敵。'),

  qsTeam('lufu-qs-wangyi-taiwei', '王異太尉盾', 'T0.5', [
    seat('simayi', '司馬懿', ['hantian', 'zhongzhi'], ['熯天熾地', '眾志成城'], leshan(), {
      points: '智',
      traits: ['長慮', '擐甲'],
    }),
    seat('wangyi', '王異', ['meihuo', 'tengjia'], ['魅惑', '藤甲兵'], chui(), {
      points: '統',
      traits: ['援助'],
      remark: '表稱王異紅度高於曹操時可取代曹操，魅惑機率更高',
    }),
    seat('manchong', '滿寵', ['xushidai', 'xingyi'], ['蓄勢待發', '形一陣'], chui(), {
      points: '智',
    }),
  ], qilueZhengjunBo, '整軍', '形一陣滿寵蓄勢待發，表稱規避接近五成；熯天熾地打藤甲法官盾。'),

  qsTeam('lufu-qs-caozhen-feixiong', '曹真飛熊軍', 'T0.5', [
    seat('simayi', '司馬懿', ['shibie', 'zhongzhi'], ['士別三日', '眾志成城'], book('shiji', 'leshan', 'jiuzhan', 'tongjun'), {
      points: '智',
      traits: ['長慮', '擐甲', '騎寶物'],
    }),
    seat('sp-caozhen', 'SP曹真', ['caochuan', 'feixiong'], ['草船借箭', '飛熊軍'], book('junxing', 'xibing', 'gangrou', 'fangbei'), {
      points: '統',
      traits: ['援助'],
    }),
    seat('sp-xunyu', 'SP荀彧', ['fengshi', 'guagu'], ['鋒矢陣', '刮骨療毒'], book('jiubian', 'yuanqi', 'lijun', 'suzhan'), {
      points: '智',
      traits: ['妖氣', '長健'],
      remark: '刮骨可換移花接木（拒馬弓多時）',
    }),
  ], qilueZhengjunBo, '整軍'),

  qsTeam('lufu-qs-shanhe', '山河盾', 'T0.5', [
    seat('caocao', '曹操', ['xushidai', 'guagu'], ['蓄勢待發', '刮骨療毒'], book('jiubian', 'yuanqi', 'lijun', 'chiyuan'), {
      points: '智',
      traits: ['妖氣'],
    }),
    seat('haozhao', '郝昭', ['zhongzhi', 'shibie'], ['眾志成城', '士別三日'], manyong('wentao', 'zhirui'), {
      points: '智',
    }),
    seat('jiaxu', '賈詡', ['dangfeng', 'bingwu'], ['當鋒摧決', '兵無常勢'], qizheng('wentao', 'cangdao'), {
      points: '智',
      traits: ['盾寶物'],
    }),
  ], qilueZhengjunBai2, '整軍'),

  qsTeam('lufu-qs-zhuge-faguan', '諸葛法官盾', 'T0', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '雍雅', '盾寶物'],
      remark: '藏器可換擊其惰歸',
    }),
    seat('zhugeliang', '諸葛亮', ['tengjia', 'feigong'], ['藤甲兵', '非攻制勝'], chui(), {
      points: '統',
      traits: ['神算天機'],
      aptNeed: { troop: '盾', letter: 'S' },
    }),
    seat('sp-fazheng', 'SP法正', ['yulin', 'xushidai'], ['魚鱗陣', '蓄勢待發'], chui(), {
      points: '智',
      traits: ['出奇'],
    }),
  ], ['芒碭隱蹤', '推食解衣', '敗中求生', '沛縣聚義', '博浪椎秦'], '整軍', zhenfuFaguanNote, [
    asAlt(ayTeam('lufu-ay-zhuge-faguan', '諸葛法官', 'T0', 130, [
      seat('sp-guanyu', 'SP關羽', ['yigua', null], ['以寡敵眾', '乘勝／藏器'], book('junxing', 'xibing', 'shoushi', 'yongyi'), {
        points: '武力',
        traits: ['武聖', '雍雅', '破勢', '盾寶'],
        remark: '第二戰法截圖為乘勝／藏器，待核（可能為藏器待時）',
        tacticsRaw: '以寡敵眾、乘勝／藏器',
      }),
      seat('sp-fazheng', 'SP法正', ['xushidai', 'tuo-zhene'], ['蓄勢待發', '拓·鎮扼防拒'], chui(), {
        points: '智力',
        traits: ['奇算', '出奇'],
      }),
      seat('zhugeliang', '諸葛亮', ['feigong', 'yulin'], ['非攻制勝', '魚鱗陣'], chui(), {
        points: '統率',
        aptNeed: { troop: '盾', letter: 'S' },
      }),
    ], ['設伏十面', '博浪椎秦', '功成身退', '合圍夾擊', '楚歌四起'], '', '藏器用綠色奇略。與秋石同三將，掛成十隊共存替代。'), '十隊共存諸葛法官', [
      '阿焰 2026-02-11 十隊共存。陸服玩家分 130。',
      '戰法順序與奇略不同；關羽第二戰法截圖為乘勝／藏器，待核。',
    ]),
  ]),

  qsTeam('lufu-qs-liubei-faguan', '劉備法官盾', 'T0', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '雍雅', '盾寶物'],
      remark: '藏器可換非攻制勝',
    }),
    seat('liubei', '劉備', ['zhiji', 'yulin'], ['知己知彼', '魚鱗陣'], book('jiubian', 'yuanqi', 'jiuzhu', 'yanxu'), {
      points: '智',
      traits: ['昭烈'],
      remark: '第一戰法為知己知彼／魅惑',
    }),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'tuo-zhene'], ['蓄勢待發', '拓·鎮扼防拒'], chui(), {
      points: '智',
      traits: ['出奇'],
    }),
  ], ['芒碭隱蹤', '推食解衣', '敗中求生', '沛縣聚義', '博浪椎秦'], '整軍', '鎮撫劉備進行保護，魅惑援助也可補控制。' , [
    asAlt(qsTeam('lufu-qs-liubei-faguan-plain', '法官盾（劉備）', 'T0', [
      seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
        points: '武',
        traits: ['武聖', '雍雅', '盾寶物'],
      }),
      seat('liubei', '劉備', ['tengjia', 'feigong'], ['藤甲兵', '非攻制勝'], book('jiubian', 'yuanqi', 'jiuzhu', 'yanxu'), {
        points: '250統+智',
        traits: ['昭烈'],
        remark: '表稱恢復能力多，藤甲宜帶物理減傷',
      }),
      seat('sp-fazheng', 'SP法正', ['yulin', 'xushidai'], ['魚鱗陣', '蓄勢待發'], chui(), {
        points: '智',
        traits: ['出奇'],
      }),
    ], qilueXiraoFa, '襲擾'), '非鎮撫版', ['劉備改藤甲兵、非攻制勝；法正改魚鱗、蓄勢。奇略改襲擾路線。']),
  ]),

  qsTeam('lufu-qs-jiangwei-faguan', '姜維法官盾', 'T0', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '雍雅', '盾寶物'],
      remark: '藏器可換擊其惰歸',
    }),
    seat('jiangwei', '姜維', ['tengjia', 'feigong'], ['藤甲兵', '非攻制勝'], manyong(), {
      points: '統',
      traits: ['興師'],
      aptNeed: { troop: '盾', letter: 'S' },
    }),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'zhuan-xingyi'], ['蓄勢待發', '轉·形一陣'], chui(), {
      points: '智',
      traits: ['出奇'],
    }),
  ], ['芒碭隱蹤', '推食解衣', '敗中求生', '沛縣聚義', '博浪椎秦'], '整軍', '漢焰專屬。轉·形一陣拉高SP法正智力；姜維可輔助輸出。'),

  qsTeam('lufu-qs-zhaoyun-faguan', '趙雲法官盾', 'T0.5', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '雍雅', '盾寶物'],
      remark: '藏器可換擊其惰歸',
    }),
    seat('zhaoyun', '趙雲', ['tengjia', 'feigong'], ['藤甲兵', '非攻制勝'], book('junxing', 'xibing', 'shoushi', 'tiejia'), {
      points: '統',
      aptNeed: { troop: '盾', letter: 'S' },
    }),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'zhuan-xingyi'], ['蓄勢待發', '轉·形一陣'], chui(), {
      points: '智',
      traits: ['出奇'],
    }),
  ], qilueXiraoFa, '襲擾'),

  qsTeam('lufu-qs-longxi', '龍忠盾', 'T0.5', [
    seat('sp-zhugeliang', 'SP諸葛亮', ['xushidai', 'xianzhen'], ['蓄勢待發', '陷陣營'], chui(), {
      points: '統智',
    }),
    seat('huangzhong', '黃忠', ['qianli', 'yigua'], ['千里走單騎', '以寡敵眾'], book('shiji', 'yingji', 'guixin', 'jiuzhan'), {
      points: '武',
      remark: '表上寫千里單騎，對到圖鑑千里走單騎',
    }),
    seat('zhangbao', '張苞', ['wufeng', 'feigong'], ['武鋒陣', '非攻制勝'], book('jiubian', 'lindi', 'baizhan', 'jiuzhu'), {
      points: '速武',
    }),
  ], ['藏書納賂', '暗度陳倉', '韜晦自污', '設伏十面', '多多益善'], '襲擾'),

  qsTeam('lufu-qs-sp-zhouyu-dudu', 'SP周瑜都督弓', 'T0.5', [
    seat('sp-zhouyu', 'SP周瑜', ['zhongzhi', 'luli'], ['眾志成城', '戮力同心'], biqi(), { points: '智' }),
    seat('sp-lvmeng', 'SP呂蒙', ['meihuo', 'yanxing'], ['魅惑', '雁行陣'], qizheng(), {
      points: '一速+統',
      traits: ['援助', '踩踏'],
      remark: '雁行可換草船借箭。要帶踩踏增加控制',
    }),
    seat('luxun', '陸遜', ['tuo-zhene', 'gongbu'], ['拓·鎮扼防拒', '功不唐捐'], chuqi(), {
      points: '智',
      traits: ['雍雅'],
      remark: '雍雅壓尾速，讓SP周瑜回合開始疊長焰',
    }),
  ], qilueYuexia, '襲擾', '陸遜帶拓·鎮扼防拒，魅惑援助體系連戰更強。', [
    asAlt(qsTeam('lufu-qs-xingyi-dudu', '形一都督弓', 'T0.5', [
      seat('sp-zhouyu', 'SP周瑜', ['zhongzhi', 'luli'], ['眾志成城', '戮力同心'], yingji(), { points: '智' }),
      seat('sp-lvmeng', 'SP呂蒙', ['caochuan', 'zhuan-xingyi'], ['草船借箭', '轉·形一陣'], qizheng(), {
        points: '一速+統',
        traits: ['援助', '踩踏'],
      }),
      seat('luxun', '陸遜', ['gongbu', 'wanjun'], ['功不唐捐', '萬軍奪帥'], chuqi(), {
        points: '智',
        traits: ['雍雅'],
        remark: '萬軍可換乘敵不虞',
      }),
    ], qilueYuexia, '襲擾'), '形一都督弓', ['SP呂蒙改草船、轉·形一陣；陸遜改功不、萬軍奪帥。']),
    asAlt(qsTeam('lufu-qs-dianhuo', '點火弓', 'T0.5', [
      seat('sp-zhouyu', 'SP周瑜', ['zhongzhi', 'shibie'], ['眾志成城', '士別三日'], biqi(), { points: '智' }),
      seat('sp-lvmeng', 'SP呂蒙', ['caochuan', 'yanxing'], ['草船借箭', '雁行陣'], qizheng(), {
        points: '一速+統',
        traits: ['援助', '踩踏'],
      }),
      seat('luxun', '陸遜', ['luli', 'wanjun'], ['戮力同心', '萬軍奪帥'], chuqi(), {
        points: '智',
        traits: ['雍雅'],
        remark: '萬軍可換乘敵不虞',
      }),
    ], qilueYuexia, '襲擾'), '點火弓', ['SP周瑜改士別三日；陸遜改戮力、萬軍奪帥。']),
    asAlt(qsTeam('lufu-qs-shenhuo-lvmeng', '神火弓（呂蒙）', 'T0.5', [
      seat('sp-zhouyu', 'SP周瑜', ['zhongzhi', 'shibie'], ['眾志成城', '士別三日'], biqi(), { points: '智' }),
      seat('luxun', '陸遜', ['luli', 'chengdi'], ['戮力同心', '乘敵不虞'], chuqi(), {
        points: '智',
        traits: ['雍雅'],
      }),
      seat('lvmeng', '呂蒙', ['dangfeng', 'yanxing'], ['當鋒摧決', '雁行陣'], qizheng(), {
        points: '統',
        traits: ['喬裝', '踩踏'],
      }),
    ], qilueYuexia, '襲擾'), '神火弓（呂蒙）', ['第三將是呂蒙，不是SP呂蒙。']),
  ]),

  qsTeam('lufu-qs-shenhuo-chengpu', '神火弓', 'T0.5', [
    seat('sp-zhouyu', 'SP周瑜', ['zhongzhi', 'luli'], ['眾志成城', '戮力同心'], book('shiji', 'yingji', 'jiuzhan', 'tongjun'), { points: '智' }),
    seat('luxun', '陸遜', ['gongbu', 'wanjun'], ['功不唐捐', '萬軍奪帥'], chuqi(), {
      points: '智',
      traits: ['雍雅'],
      remark: '萬軍可換乘敵不虞。雍雅壓尾速帶SP周瑜',
    }),
    seat('chengpu', '程普', ['caochuan', 'zhuan-xingyi'], ['草船借箭', '轉·形一陣'], book('junxing', 'shoudao', 'shoushi', 'fangbei'), {
      points: '一速+統',
      traits: ['援助'],
    }),
  ], qilueYuexia, '襲擾'),

  qsTeam('lufu-qs-shenhuo-qiang', '鎮撫神火槍', 'T0.5', [
    seat('zhouyu', '周瑜', ['duohun', 'fengzhuo'], ['奪魂挾魄', '風助火勢'], shengyi(), {
      points: '智',
      traits: ['樂奏', '槍寶物'],
    }),
    seat('lvmeng', '呂蒙', ['dangfeng', 'tuo-zhene'], ['當鋒摧決', '拓·鎮扼防拒'], qizheng('wentao', 'cangdao'), {
      points: '智',
      traits: ['喬裝', '踩踏'],
      remark: '要帶踩踏，增加繳械機會',
    }),
    seat('chengpu', '程普', ['caochuan', 'meihuo'], ['草船借箭', '魅惑'], book('junxing', 'wuzhan', 'jingxin', 'tiejia'), {
      points: '統',
    }),
  ], qilueShenhuo, '襲擾', '', [
    asAlt(qsTeam('lufu-qs-shama', '殺馬弓', 'T0.5', [
      seat('zhouyu', '周瑜', ['duohun', 'fengzhuo'], ['奪魂挾魄', '風助火勢'], shengyi(), {
        points: '智',
        traits: ['樂奏'],
      }),
      seat('lvmeng', '呂蒙', ['zhongzhi', 'dangfeng'], ['眾志成城', '當鋒摧決'], qizheng('wentao', 'cangdao'), {
        points: '智',
        traits: ['喬裝', '踩踏'],
      }),
      seat('chengpu', '程普', ['caochuan', 'yanxing'], ['草船借箭', '雁行陣'], book('shiji', 'zhenge', 'chuilian', 'tongjun'), {
        points: '統',
        traits: ['援助', '弓寶物'],
      }),
    ], qilueShenhuo, '襲擾'), '殺馬弓', ['同三將改弓兵：呂蒙眾志加當鋒，程普雁行、枕戈。']),
  ]),

  qsTeam('lufu-qs-lao-zhouyu-rou', '老周瑜肉弓', 'T0.5', [
    seat('zhouyu', '周瑜', ['duohun', 'luli'], ['奪魂挾魄', '戮力同心'], book('zuozhan', 'shengyi', 'wentao', 'zhirui'), {
      points: '智',
      traits: ['樂奏'],
    }),
    seat('taishici', '太史慈', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], book('zuozhan', 'shengyi', 'shengzhan', 'zhirui'), {
      points: '武',
    }),
    seat('sp-lvmeng', 'SP呂蒙', ['caochuan', 'linwei'], ['草船借箭', '臨危救主'], qizheng(), {
      points: '速最高+統',
      traits: ['援助', '踩踏'],
      remark: '帶踩踏可計窮和震懾',
    }),
  ], ['親釋荊縛', '芒碭隱蹤', '推食解衣', '敗中求生', '博浪椎秦'], '整軍', '', [
    asAlt(qsTeam('lufu-qs-lao-zhouyu-chengpu', '老周瑜肉弓（程普）', 'T0.5', [
      seat('zhouyu', '周瑜', ['duohun', 'luli'], ['奪魂挾魄', '戮力同心'], qizheng('wentao', 'shengzhan'), {
        points: '智',
        traits: ['樂奏'],
      }),
      seat('taishici', '太史慈', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], book('zuozhan', 'shengyi', 'shengzhan', 'zhirui'), {
        points: '武',
      }),
      seat('chengpu', '程普', ['caochuan', 'linwei'], ['草船借箭', '臨危救主'], book('junxing', 'shoudao', 'shoushi', 'fangbei'), {
        points: '速最高+統',
        traits: ['弓寶'],
      }),
    ], ['親釋荊縛', '芒碭隱蹤', '推食解衣', '敗中求生', '沛縣聚義'], '整軍'), '程普版', ['第三將改程普，臨危救主、守而有道。']),
  ]),

  qsTeam('lufu-qs-diaochan-huangma', '貂蟬皇馬槍', 'T0', [
    seat('sp-machao', 'SP馬超', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], yuanqi(), {
      points: '全武',
      traits: ['神威', '踩踏'],
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'linwei'], ['草船借箭', '臨危救主'], shenshi(), {
      points: '統',
      traits: ['雍雅', '沉勢', '長健'],
      remark: '表上標轉群',
    }),
    seat('diaochan', '貂蟬', ['meihuo', 'jiefan'], ['魅惑', '解煩衛'], book('jiubian', 'shiruo', 'baizhan', 'yanxu'), {
      points: '智',
      traits: ['佳人'],
      aptNeed: { troop: '槍', letter: 'S' },
    }),
  ], qilueHuangma, '久戰', '貂蟬經訓兵振旅變槍S，吸傷補控制。SP皇甫嵩已是剛需。'),

  qsTeam('lufu-qs-diaoma-gong', '貂馬弓', 'T0.5', [
    seat('sp-machao', 'SP馬超', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], yuanqi(), {
      points: '全武',
      traits: ['神威', '踩踏'],
      aptNeed: { troop: '弓', letter: 'S' },
    }),
    seat('sp-luzhi', 'SP盧植', ['yanxing', 'gangrou-ji'], ['雁行陣', '剛柔並濟'], book('shiji', 'sanjun', 'jiuzhan', 'tongjun'), {
      points: '統',
      traits: ['長健'],
      remark: '表上標轉群',
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'linwei'], ['深藏若虛', '臨危救主'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
      remark: '表上標轉群',
    }),
  ], ['芒碭隱蹤', '鴻門遁險', '功成身退', '沛縣聚義', '推食解衣'], '整軍'),

  qsTeam('lufu-qs-hanshi-dongzhuo', '漢室弓（董卓）', 'T0', [
    seat('sp-caocao', 'SP曹操', ['gangrou-ji', 'xiandeng'], ['剛柔並濟', '先登死士'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏', '長健'],
    }),
    seat('sp-dongzhuo', 'SP董卓', ['yanxing', 'taoyuan'], ['雁行陣', '桃園結義'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍', 'SP貂蟬可以帶友軍在治療後減傷。與大漢弓差在第二將是SP董卓不是SP盧植。'),

  qsTeam('lufu-qs-luxun-hanshi', '陸遜漢室弓', 'T0.5', [
    seat('sp-caocao', 'SP曹操', ['yanxing', 'xiandeng'], ['雁行陣', '先登死士'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏', '長健'],
    }),
    seat('luxun', '陸遜', ['gongbu', 'gangrou-ji'], ['功不唐捐', '剛柔並濟'], book('yongjian', 'chuqi', 'shanzhan', 'fenli'), {
      points: '智',
      traits: ['連營', '踩踏', '長健', '習武扶漢'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍'),

  qsTeam('lufu-qs-xunyu-hangou', 'SP荀彧漢肉弓', 'T0.5', [
    seat('sp-xunyu', 'SP荀彧', ['yanxing', 'gangrou-ji'], ['雁行陣', '剛柔並濟'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏', '弓寶物'],
      remark: '表上標轉漢',
    }),
    seat('luxun', '陸遜', ['gongbu', 'wanjun'], ['功不唐捐', '萬軍奪帥'], sanjiu(), {
      points: '智',
      traits: ['連營', '踩踏', '習武扶漢'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍', '表稱SP荀彧與SP貂蟬不論搭配都在 T0.5 以上。'),

  qsTeam('lufu-qs-hanshi-huangma', '漢室皇馬槍', 'T0.5', [
    seat('sp-machao', 'SP馬超', ['sucheng', 'cuifeng'], ['速乘其利', '摧鋒斷刃'], yuanqi(), {
      points: '武',
      traits: ['神威', '踩踏', '靈動'],
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'linwei'], ['草船借箭', '臨危救主'], shenshi(), {
      points: '統',
      traits: ['雍雅', '沉勢'],
    }),
    seat('sp-xunyu', 'SP荀彧', ['jiefan', 'chengdi'], ['解煩衛', '乘敵不虞'], houfaBu(), {
      points: '速最高',
      traits: ['靈動', '槍寶物'],
      remark: '表上標轉漢',
    }),
  ], ['親釋荊縛', '橫掃河西', '孤軍深入', '摧鋒陷敵', '斬逆納降'], '久戰'),

  qsTeam('lufu-qs-jiaxu-hangou', '賈詡漢肉弓', 'T0.5', [
    seat('sp-dongzhuo', 'SP董卓', ['yanxing', 'gangrou-ji'], ['雁行陣', '剛柔並濟'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏'],
    }),
    seat('jiaxu', '賈詡', ['duohun', 'shangbing'], ['奪魂挾魄', '上兵伐謀'], book('shiji', 'sanjun', 'jiuzhan', 'yuanmou'), {
      points: '智',
      traits: ['妖氣', '踩踏', '長健'],
      remark: '表上標轉漢',
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍'),

  qsTeam('lufu-qs-zhujun-hangou', 'SP朱儁漢肉弓', 'T0.5', [
    seat('sp-dongzhuo', 'SP董卓', ['taoyuan', 'shangbing'], ['桃園結義', '上兵伐謀'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏'],
    }),
    seat('sp-zhujun', 'SP朱儁', ['xingyi', 'gangrou-ji'], ['形一陣', '剛柔並濟'], book('shiji', 'sanjun', 'jiuzhan', 'yuanmou'), {
      points: '智',
      traits: ['妖氣', '踩踏', '長健'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍', '武將欄原表為合併格，只看得到 SP董卓；SP朱儁與 SP貂蟬依戰法列推斷，待核。'),

  qsTeam('lufu-qs-meiren', '美人連環弓', 'T0.5', [
    seat('sp-dongzhuo', 'SP董卓', ['yanxing', 'taoyuan'], ['雁行陣', '桃園結義'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏', '長健'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
    seat('lvbu', '呂布', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], book('yongjian', 'chuqi', 'jingzhun', 'shanzhan'), {
      points: '武',
      traits: ['無雙', '踩踏'],
      remark: '表上標轉漢。是呂布不是40Y呂布',
    }),
  ], qilueHanshi, '整軍'),

  qsTeam('lufu-qs-yuanshu-feixiong', '袁術飛熊騎', 'T0.5', [
    seat('yuanshu', '袁術', [null, 'shangbing'], ['獅子奮迅', '上兵伐謀'], manyong('wentao', 'zhirui'), {
      points: '智',
      remark: '表上標轉漢。寫獅子奮迅、未標轉技。圖鑑僅有轉·獅子奮迅，待核',
      unlisted: ['獅子奮迅'],
    }),
    seat('sp-caozhen', 'SP曹真', ['feixiong', 'fengshi'], ['飛熊軍', '鋒矢陣'], chui(), {
      points: '統',
      traits: ['援助'],
    }),
    seat('caocao', '曹操', ['lingji', 'guagu'], ['靈機一動', '刮骨療毒'], chui(), {
      points: '速智',
      remark: '表上標轉漢',
    }),
  ], ['設伏十面', '楚歌四起', '多多益善', '臨危不懼', '合圍突擊'], '謀算', '表稱袁術轉漢、勳業台 2+1 漢。奇略末張依表謄「合圍突擊」。'),

  qsTeam('lufu-qs-kuoluo', '圓夢弓', 'T0.5', [
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'gangrou-ji'], ['深藏若虛', '剛柔並濟'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
    seat('sp-zhouyu', 'SP周瑜', ['wenwu', 'shangbing'], ['文武雙全', '上兵伐謀'], book('shiji', 'yingji', 'jiuzhan', 'tongjun'), {
      points: '智',
      traits: ['妖氣', '踩踏', '樂奏', '長健'],
    }),
    seat('caocao', '曹操', ['qianlong', 'caochuan'], ['潛龍陣', '草船借箭'], book('jiubian', 'yuanqi', 'yanxu', 'jiuzhu'), {
      points: '智',
      traits: ['妖氣', '踩踏', '援助', '弓寶物'],
    }),
  ], qilueYuanmeng, '整軍', 'SP貂蟬可為友軍在治療後減傷。', [
    asAlt(qsTeam('lufu-qs-kuoluo-zhouyu', '圓夢弓（周瑜）', 'T0.5', [
      seat('sp-diaochan', 'SP貂蟬', ['shencang', 'gangrou-ji'], ['深藏若虛', '剛柔並濟'], sanjiu(), {
        points: '智',
        traits: ['妖氣', '踩踏', '佳人', '回元'],
      }),
      seat('zhouyu', '周瑜', ['duohun', 'shangbing'], ['奪魂挾魄', '上兵伐謀'], book('shiji', 'zhenge', 'jiuzhan', 'yuanmou'), {
        points: '智',
        traits: ['妖氣', '踩踏', '樂奏', '長健'],
      }),
      seat('caocao', '曹操', ['qianlong', 'caochuan'], ['潛龍陣', '草船借箭'], book('jiubian', 'yuanqi', 'yanxu', 'jiuzhu'), {
        points: '智',
        traits: ['妖氣', '踩踏', '援助', '弓寶物'],
      }),
    ], qilueYuanmeng, '整軍'), '周瑜版', ['第二將改普通周瑜：奪魂挾魄、上兵伐謀、枕戈坐甲。']),
  ]),

  qsTeam('lufu-qs-qianlong-diao', '潛龍貂', 'T0.5', [
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'qianlong'], ['深藏若虛', '潛龍陣'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
      remark: '表上標轉群',
    }),
    seat('luxun', '陸遜', ['gongbu', 'shangbing'], ['功不唐捐', '上兵伐謀'], book('yongjian', 'chuqi', 'jingzhun', 'shanzhan'), {
      points: '智',
      traits: ['妖氣', '連營', '踩踏', '長健'],
    }),
    seat('sp-luzhi', 'SP盧植', ['gangrou-ji', 'caochuan'], ['剛柔並濟', '草船借箭'], book('jiubian', 'yuanqi', 'lijun', 'chiyuan'), {
      points: '統',
      traits: ['妖氣', '踩踏', '援助'],
      remark: '表上標轉漢',
    }),
  ], qilueYuanmeng, '整軍'),

  qsTeam('lufu-qs-guanma', '關馬槍', 'T0.5', [
    seat('guanyinping', '關銀屏', ['caochuan', 'qianlong'], ['草船借箭', '潛龍陣'], book('jiubian', 'fenji', 'suzhan', 'baizhan'), {
      points: '武',
      traits: ['踩踏'],
    }),
    seat('sp-machao', 'SP馬超', ['huju', 'cuifeng'], ['虎踞鷹揚', '摧鋒斷刃'], yuanqi(), {
      points: '武',
      traits: ['神威', '踩踏'],
      remark: '虎踞可換當鋒摧決。敵人馬超多則給自己加速，否則據敵方速度調整',
    }),
    seat('sp-xunyu', 'SP荀彧', ['jiefan', 'linwei'], ['解煩衛', '臨危救主'], xibingSF(), {
      points: '智',
      traits: ['槍寶物'],
    }),
  ], qilueHuangma, '久戰', 'SP荀彧加30速度可反彈盛氣凌敵。'),

  qsTeam('lufu-qs-gouma', '狗馬槍', 'T0.5', [
    seat('chengyu', '程昱', ['qianlong', 'caochuan'], ['潛龍陣', '草船借箭'], book('jiubian', 'lindi', 'chiyuan', 'lijun'), {
      points: '統',
      traits: ['援助'],
    }),
    seat('sp-machao', 'SP馬超', ['huju', 'cuifeng'], ['虎踞鷹揚', '摧鋒斷刃'], yuanqi(), {
      points: '武',
      traits: ['神威', '踩踏'],
    }),
    seat('sp-xunyu', 'SP荀彧', ['jiefan', 'linwei'], ['解煩衛', '臨危救主'], xibingSF(), {
      points: '智',
      traits: ['槍寶物'],
    }),
  ], qilueHuangma, '久戰', 'SP荀彧加30速度可反彈盛氣凌敵。'),

  qsTeam('lufu-qs-yanzhou', '兗州三勢關', 'T0.5', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '盾寶物'],
      remark: '藏器可換疾風驟雨。帶藏器待時更強',
    }),
    seat('chengyu', '程昱', ['meihuo', 'feigong'], ['魅惑', '非攻制勝'], book('jiubian', 'lindi', 'lijun', 'chiyuan'), {
      points: '統',
      traits: ['援助'],
    }),
    seat('manchong', '滿寵', ['sanshi', 'xushidai'], ['三勢陣', '蓄勢待發'], chui(), {
      points: '智',
      traits: ['妖氣', '雍雅', '沉重'],
    }),
  ], qilueXiraoFa, '襲擾'),

  qsTeam('lufu-qs-chaowei', '超姬槍', 'T0.5', [
    seat('wangyuanji', '王元姬', ['linwei', 'qianlong'], ['臨危救主', '潛龍陣'], yuanqi(), {
      points: '智',
      traits: ['妖氣'],
    }),
    seat('sp-machao', 'SP馬超', ['huju', 'cuifeng'], ['虎踞鷹揚', '摧鋒斷刃'], book('zuozhan', 'yigu', 'shengzhan', 'zhirui'), {
      points: '武',
      traits: ['神威', '踩踏'],
      remark: '虎踞可換當鋒摧決。敵人馬超多則給自己加速',
    }),
    seat('sp-lvmeng', 'SP呂蒙', ['jiefan', 'caochuan'], ['解煩衛', '草船借箭'], qizheng(), {
      points: '智',
      traits: ['踩踏'],
    }),
  ], qilueHuangma, '久戰'),

  qsTeam('lufu-qs-huangzong', '皇冠槍', 'T0.5', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'jifeng'], ['以寡敵眾', '疾風驟雨'], fenji(), {
      points: '武',
      traits: ['武聖', '沉重'],
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['sanshi', 'caochuan'], ['三勢陣', '草船借箭'], book('jiubian', 'lindi', 'suzhan', 'jiuzhu'), {
      points: '速+統',
      traits: ['幽影', '踩踏'],
      remark: '速度比SP關羽高1點',
    }),
    seat('sp-xunyu', 'SP荀彧', ['weimou', 'feigong'], ['威謀靡亢', '非攻制勝'], houfaBu(), {
      points: '智',
      traits: ['槍寶物'],
      remark: '威謀可換乘敵不虞',
    }),
  ], qilueXiraoFa, '襲擾'),

  qsTeam('lufu-qs-dujiang', '渡江槍', 'T0.5', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'jifeng'], ['以寡敵眾', '疾風驟雨'], fenji(), {
      points: '武',
      traits: ['武聖', '沉重'],
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['sanshi', 'caochuan'], ['三勢陣', '草船借箭'], book('jiubian', 'lindi', 'suzhan', 'jiuzhu'), {
      points: '速+統',
      traits: ['幽影', '踩踏'],
      remark: '速度比SP關羽高1點',
    }),
    seat('sp-lvmeng', 'SP呂蒙', ['weimou', 'feigong'], ['威謀靡亢', '非攻制勝'], houfaBu(), {
      points: '10速+智',
      traits: ['援助', '踩踏'],
      remark: '威謀可換乘敵不虞',
    }),
  ], qilueXiraoFa, '襲擾'),

  qsTeam('lufu-qs-gouguan', '狗官槍', 'T0.5', [
    seat('chengyu', '程昱', ['qianlong', 'caochuan'], ['潛龍陣', '草船借箭'], book('jiubian', 'lindi', 'suzhan', 'lijun'), {
      points: '速+統',
      traits: ['援助'],
      remark: '速度比SP關羽高1點先解控',
    }),
    seat('sp-guanyu', 'SP關羽', ['yigua', 'jifeng'], ['以寡敵眾', '疾風驟雨'], fenji(), {
      points: '武',
      traits: ['武聖', '沉重'],
    }),
    seat('sp-xunyu', 'SP荀彧', ['weimou', 'feigong'], ['威謀靡亢', '非攻制勝'], houfaBu(), {
      points: '30速+智',
      traits: ['疾馳', '槍寶物'],
    }),
  ], qilueXiraoFa, '襲擾', 'SP荀彧加30速度可反彈盛氣凌敵。'),

  qsTeam('lufu-qs-zhujun-hedan', 'SP朱儁核彈弓', 'T0.5', [
    seat('zhoutai', '周泰', ['qianlong', 'shengqi'], ['潛龍陣', '盛氣凌敵'], book('jiubian', 'youdi', 'lijun', 'yanxu'), {
      points: '統',
      traits: ['弓寶物'],
    }),
    seat('sp-zhujun', 'SP朱儁', ['taiping', 'wudang'], ['太平道法', '無當飛軍'], book('yongjian', 'yitui', 'jingzhun', 'shanzhan'), {
      points: '智',
      remark: '表上標轉漢',
    }),
    seat('sp-yuanshao', 'SP袁紹', ['hengsao', 'jifeng'], ['橫掃千軍', '疾風驟雨'], book('yongjian', 'yitui', 'jingzhun', 'shanzhan'), {
      points: '一速+武',
    }),
  ], ['治延軍勢', '受封增邑', '設伏十面', '居儉避禍', '楚歌四起'], '襲擾', '可當碰瓷用，表稱SP朱儁輸出很穩。'),

  qsTeam('lufu-qs-hedan-yuanshu', '核彈袁術', 'T0.5', [
    seat('zhoutai', '周泰', ['qianlong', 'baima'], ['潛龍陣', '白馬義從'], book('junxing', 'shoudao', 'shoushi', 'fangbei'), {
      points: '統',
      traits: ['弓寶物'],
    }),
    seat('yuanshu', '袁術', [null, 'shangbing'], ['獅子奮迅', '上兵伐謀'], book('yongjian', 'yizhi-bao', 'jingzhun', 'shanzhan'), {
      points: '智',
      remark: '表上寫獅子奮迅、未標轉。圖鑑僅有轉·獅子奮迅，待核',
      unlisted: ['獅子奮迅'],
    }),
    seat('xunyou', '荀攸', ['yanzhu', 'wanjun'], ['焰逐風飛', '萬軍奪帥'], manyong('shengzhan', 'zhirui'), {
      points: '一速+智',
      remark: '第一戰法截圖近焰逐風飛，待核',
    }),
  ], ['博浪椎秦', '楚歌四起', '合圍夾擊', '設伏十面', '多多益善'], '謀算', '用於碰瓷，後期可把經驗繼承給其他隊伍。與碰瓷／潛龍周泰差在第三將是荀攸。'),

  qsTeam('lufu-qs-yuliang', '瑜亮弓', 'T0.5', [
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], chui(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
    seat('zhugeliang', '諸葛亮', ['zhongzhi', 'qianlong'], ['眾志成城', '潛龍陣'], chui(), {
      points: '30速+智',
      traits: ['妖氣', '踩踏'],
    }),
    seat('zhouyu', '周瑜', ['duohun', 'fengzhuo'], ['奪魂挾魄', '風助火勢'], chui(), {
      points: '智',
      traits: ['妖氣', '踩踏', '樂奏', '長健'],
    }),
  ], qilueYuanmeng, '整軍'),

  ayTeam('lufu-ay-hangong', '漢弓', 'T1.5', 85, [
    seat('ganning', '甘寧', ['woxin', 'hengsao'], ['臥薪嘗膽', '橫掃千軍'], book('zuozhan', 'shengyi', 'shengzhan', 'zhirui'), {
      points: '武力',
      traits: ['習武', '扶漢'],
    }),
    seat('sp-yuanshao', 'SP袁紹', ['powei', 'jifeng'], ['破軍威勝', '疾風驟雨'], book('zuozhan', 'manyong', 'shengzhan', 'zhirui'), {
      points: '武力二速',
      traits: ['號令'],
    }),
    seat('gongsunzan', '公孫瓚', ['chediao', 'qiji'], ['掣刀斫敵', '奇計良謀'], book('jiubian', 'fenji', 'suzhan', 'lijun'), {
      points: '速度',
    }),
  ], ['楚歌四起', '設伏十面', '圯橋受書', '三策並進', '臨危不懼'], '', '打架約 T1.5、打野約 T0。表稱與滿配袁紹朱儁混搭相當，成型更快。'),

  ayTeam('lufu-ay-chuanzi', '傳子弓', 'T2', 70, [
    seat('sunquan', '孫權', ['baoli', 'guishen'], ['暴戾無仁', '鬼神霆威'], book('zuozhan', 'shengyi', 'shengzhan', 'zhirui'), {
      points: '武力',
      traits: ['雄才'],
    }),
    seat('sp-sunjian', 'SP孫堅', ['futang', 'yinli'], ['赴湯蹈火', '因利制權'], book('shiji', 'zhenge', 'chuilian', 'tongjun'), {
      points: '統率',
      remark: '中間兵書截圖近錘煉，對到枕戈、錘煉、統軍',
    }),
    seat('sunshangxiang', '孫尚香', ['jiemeng', 'jinfan'], ['結盟', '錦帆軍'], book('zuozhan', 'shengyi', 'shengzhan', 'zhirui'), {
      points: '武力',
    }),
  ], [], '', '只適合打野；表稱打架打不動。奇略欄空白。複刻皇馬奇略。'),

  ayTeam('lufu-ay-taoyuan', '桃園盾', 'T2', 75, [
    seat('liubei', '劉備', ['zhiji', 'xianzhen'], ['知己知彼', '陷陣營'], book('jiubian', 'yuanqi', 'yanxu', 'lijun'), {
      points: '智力',
    }),
    seat('guanyu', '關羽', ['jixing', 'juedi'], ['箕形陣', '絕地反擊'], houfaBu(), {
      points: '武力',
      traits: ['武聖'],
      remark: '第二戰法截圖寫絕道，待核是否即絕地反擊',
    }),
    seat('zhangfei', '張飛', ['gangyong', 'jiqi'], ['剛勇無前', '擊其惰歸'], book('xushi', 'gongqi', 'jiangwei-book', 'zhanbu'), {
      points: '武力',
      traits: ['燕頷', '赳赳'],
    }),
  ], [], '', '打架一般，打野較無壓力。複刻五謀或拒馬奇略。拓印戰法註記為轉·鎮扼防拒、轉·獅子奮迅（圖鑑作拓·鎮扼防拒）。'),
];

export const hanyanLufuMergeSources = [
  qsTeam('lufu-qs-wumou-qi', '五謀騎', 'T0', [
    seat('sp-xunyu', 'SP荀彧', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], chui(), {
      points: '30速+智',
      traits: ['疾馳'],
    }),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'shangbing'], ['奪魂挾魄', '上兵伐謀'], damou(), { points: '智' }),
    seat('jiaxu', '賈詡', ['lingji', 'luli'], ['靈機一動', '戮力同心'], chui(), { points: '智' }),
  ], qilueMousuanWu, '謀算', 'SP荀彧加30速度，可反彈盛氣凌敵。'),

  qsTeam('lufu-qs-wumou-gong', '五謀弓', 'T0', [
    seat('sp-xunyu', 'SP荀彧', ['jieli', 'guagu'], ['竭力佐謀', '刮骨療毒'], chui(), {
      points: '30速+智',
      traits: ['疾馳', '弓寶物'],
      remark: '竭力可換移花接木',
    }),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'shangbing'], ['奪魂挾魄', '上兵伐謀'], damou(), {
      points: '智',
      traits: ['弓寶物'],
    }),
    seat('jiaxu', '賈詡', ['luli', 'jueji'], ['戮力同心', '絕計折謀'], chui(), { points: '智' }),
  ], qilueMousuanWu, '謀算', '可用兩件弓寶物改成五謀弓。'),

  qsTeam('lufu-qs-xunyou-wumou', '荀攸五謀騎', 'T0', [
    seat('sp-xunyu', 'SP荀彧', ['lingji', 'guagu'], ['靈機一動', '刮骨療毒'], chui(), {
      points: '加30速+智',
      traits: ['靈動', '疾馳'],
    }),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'shangbing'], ['奪魂挾魄', '上兵伐謀'], damou(), { points: '智' }),
    seat('xunyou', '荀攸', ['zhuan-shizi', 'luli'], ['轉·獅子奮迅', '戮力同心'], chui(), { points: '智' }),
  ], qilueMousuanWu, '謀算'),

  qsTeam('lufu-qs-fugui-taiwei', '蓄勢太尉盾', 'T0.5', [
    seat('simayi', '司馬懿', ['hantian', 'zhongzhi'], ['熯天熾地', '眾志成城'], leshan(), {
      points: '智',
      traits: ['長慮', '擐甲'],
    }),
    seat('caocao', '曹操', ['meihuo', 'tengjia'], ['魅惑', '藤甲兵'], chui(), {
      points: '統',
      traits: ['援助'],
    }),
    seat('manchong', '滿寵', ['xushidai', 'xingyi'], ['蓄勢待發', '形一陣'], chui(), { points: '智' }),
  ], qilueZhengjunBo, '整軍', '形一陣滿寵蓄勢待發，表稱規避接近五成。'),

  qsTeam('lufu-qs-zhenfu-madai', '鎮撫法官盾（馬岱）', 'T0', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '雍雅', '盾寶物'],
    }),
    seat('madai', '馬岱', ['feigong', 'yulin'], ['非攻制勝', '魚鱗陣'], book('junxing', 'shoudao', 'jingxin', 'tiejia'), {
      points: '一速+統',
    }),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'tuo-zhene'], ['蓄勢待發', '拓·鎮扼防拒'], chui(), {
      points: '智',
      traits: ['出奇'],
    }),
  ], qilueXiraoFa, '襲擾', '表稱馬岱是最優法官盾，減傷最大；馬岱速度比關羽快，可吃萬軍奪帥。'),

  qsTeam('lufu-qs-faguan-madai', '法官盾（馬岱）', 'T0', [
    seat('sp-guanyu', 'SP關羽', ['yigua', 'cangqi'], ['以寡敵眾', '藏器待時'], fenji(), {
      points: '武',
      traits: ['武聖', '雍雅', '盾寶物'],
    }),
    seat('madai', '馬岱', ['tengjia', 'yulin'], ['藤甲兵', '魚鱗陣'], chui(), {
      points: '一速+統',
    }),
    seat('sp-fazheng', 'SP法正', ['feigong', 'xushidai'], ['非攻制勝', '蓄勢待發'], book('jiubian', 'lindi', 'suzhan', 'yanxu'), {
      points: '智',
      traits: ['出奇'],
    }),
  ], qilueXiraoFa, '襲擾'),

  qsTeam('lufu-qs-shuzhi', '蜀智盾', 'T0.5', [
    seat('pangtong', '龐統', ['shibie', 'beishe'], ['士別三日', '杯蛇鬼車'], book('shiji', 'sanjun', 'guixin', 'tongjun'), {
      points: '智',
      aptNeed: { troop: '盾', letter: 'S' },
    }),
    seat('sp-fazheng', 'SP法正', ['xushidai', 'tuo-zhene'], ['蓄勢待發', '拓·鎮扼防拒'], chui(), {
      points: '智',
      traits: ['奇算'],
    }),
    seat('zhugeliang', '諸葛亮', ['chengdi', 'guagu'], ['乘敵不虞', '刮骨療毒'], chui(), {
      points: '智',
      traits: ['神算天機', '盾寶物'],
    }),
  ], ['暗度陳倉', '設伏十面', '博浪椎秦', '背水列陣', '多多益善'], '謀算', '盾兵形態的蜀智。'),

  qsTeam('lufu-qs-guanyu-shugong', '關羽蜀弓', 'T0.5', [
    seat('sp-zhugeliang', 'SP諸葛亮', ['yanxing', 'xiandeng'], ['雁行陣', '先登死士'], chui(), {
      points: '統',
      aptNeed: { troop: '弓', letter: 'S' },
    }),
    seat('pangtong', '龐統', ['dangfeng', 'chengdi'], ['當鋒摧決', '乘敵不虞'], houfa(), { points: '智' }),
    seat('guanyu', '關羽', ['qianli', 'yigua'], ['千里走單騎', '以寡敵眾'], houfa(), {
      points: '武',
      traits: ['武聖'],
      aptNeed: { troop: '弓', letter: 'S' },
      remark: '表上寫千里單騎，對到圖鑑千里走單騎',
    }),
  ], ['親釋荊縛', '芒碭隱蹤', '推食解衣', '博浪椎秦', '敗中求生'], '整軍'),

  qsTeam('lufu-qs-qilin', '麒麟弓', 'T0.5', [
    seat('jiangwei', '姜維', ['yanxing', 'guagu'], ['雁行陣', '刮骨療毒'], manyong(), {
      points: '統智各半',
      traits: ['興師'],
    }),
    seat('zhugeliang', '諸葛亮', ['dangfeng', 'chengdi'], ['當鋒摧決', '乘敵不虞'], qizheng('wentao', 'cangdao'), {
      points: '尾速智',
      traits: ['神算天機'],
    }),
    seat('pangtong', '龐統', ['taiping', 'fenzui'], ['太平道法', '焚輜營壘'], houfa(), {
      points: '二速智',
    }),
  ], ['設伏十面', '背水列陣', '暗度陳倉', '多多益善', '楚歌四起'], '謀算', '面對皇馬槍及漢室弓小優勢；法官多帶上兵時，面對下謀看諸葛亮發揮。'),

  qsTeam('lufu-qs-zhenfu-shenhuo-gong', '鎮撫神火弓', 'T0.5', [
    seat('zhouyu', '周瑜', ['duohun', 'luli'], ['奪魂挾魄', '戮力同心'], shengyi(), {
      points: '智',
      traits: ['樂奏'],
    }),
    seat('sp-lvmeng', 'SP呂蒙', ['meihuo', 'yanxing'], ['魅惑', '雁行陣'], qizheng(), {
      points: '速最高+統',
      traits: ['援助', '踩踏'],
      remark: '雁行可換草船借箭',
    }),
    seat('luxun', '陸遜', ['dangfeng', 'tuo-zhene'], ['當鋒摧決', '拓·鎮扼防拒'], qizheng('shengzhan', 'wentao'), {
      points: '智',
      remark: '陸遜速度比周瑜快1點屬性專打SP馬超',
    }),
  ], qilueShenhuo, '襲擾', '可用程普（草船威謀）代替SP呂蒙，檔次不過降半檔。'),

  qsTeam('lufu-qs-shenhuo-gong', '神火弓（SP呂蒙）', 'T0.5', [
    seat('zhouyu', '周瑜', ['duohun', 'fengzhuo'], ['奪魂挾魄', '風助火勢'], shengyi(), {
      points: '智最高',
      traits: ['樂奏'],
    }),
    seat('sp-lvmeng', 'SP呂蒙', ['caochuan', 'yanxing'], ['草船借箭', '雁行陣'], qizheng(), {
      points: '速最高+統',
      traits: ['援助', '踩踏'],
    }),
    seat('luxun', '陸遜', ['gongbu', 'wanjun'], ['功不唐捐', '萬軍奪帥'], chuqi(), {
      points: '智',
      remark: '萬軍可換乘敵不虞',
    }),
  ], ['設伏十面', '背水列陣', '藏書納賂', '月下追賢', '多多益善'], '襲擾'),

  qsTeam('lufu-qs-lao-shenhuo', '老周瑜神火弓', 'T0.5', [
    seat('zhouyu', '周瑜', ['duohun', 'fengzhuo'], ['奪魂挾魄', '風助火勢'], book('shiji', 'sanjun', 'jiuzhan', 'yuanmou'), {
      points: '智',
      traits: ['樂奏'],
    }),
    seat('luxun', '陸遜', ['gongbu', 'wanjun'], ['功不唐捐', '萬軍奪帥'], chuqi(), {
      points: '智',
      remark: '萬軍可換乘敵不虞。陸遜速度比周瑜快1點專打SP馬超',
    }),
    seat('lvmeng', '呂蒙', ['zhongzhi', 'yanxing'], ['眾志成城', '雁行陣'], qizheng(), {
      points: '統',
      traits: ['喬裝', '踩踏'],
    }),
  ], ['設伏十面', '背水列陣', '藏書納賂', '月下追賢', '多多益善'], '襲擾', '第三將是呂蒙，不是SP呂蒙。'),

  qsTeam('lufu-qs-huangma-tongyong', '通用皇馬槍', 'T0', [
    seat('sp-machao', 'SP馬超', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], yuanqi(), {
      points: '全武',
      traits: ['神威', '踩踏'],
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'weimou'], ['草船借箭', '威謀靡亢'], houfaBu(), {
      points: '統',
      traits: ['雍雅', '沉勢', '長健'],
      remark: '表上標轉群。已是剛需，讓他最後一個出手為SP馬超解控',
    }),
    seat('xuyou', '許攸', ['jiefan', 'linwei'], ['解煩衛', '臨危救主'], xibingFB(), {
      points: '智',
      traits: ['援助', '槍寶物'],
    }),
  ], qilueHuangma, '久戰', '打非皇馬隊伍時SP馬超可帶乘敵不虞。'),

  qsTeam('lufu-qs-huangma-neizhan', '內戰皇馬槍', 'T0', [
    seat('sp-machao', 'SP馬超', ['huju', 'cuifeng'], ['虎踞鷹揚', '摧鋒斷刃'], yuanqi(), {
      points: '全武',
      traits: ['神威', '踩踏'],
      remark: '為避開盛氣繳械，用虎踞加斷刃加全武力',
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'wanjun'], ['草船借箭', '萬軍奪帥'], shenshi(), {
      points: '統',
      traits: ['雍雅', '沉勢'],
      remark: '表上標轉群',
    }),
    seat('xuyou', '許攸', ['jiefan', 'linwei'], ['解煩衛', '臨危救主'], book('junxing', 'xibing', 'shoushi', 'fangbei'), {
      points: '智',
      traits: ['援助', '槍寶物'],
    }),
  ], qilueHuangma, '久戰'),

  qsTeam('lufu-qs-huangma-dadi', '打地皇馬槍', 'T0', [
    seat('sp-machao', 'SP馬超', ['sucheng', 'cuifeng'], ['速乘其利', '摧鋒斷刃'], yuanqi(), {
      points: '全武',
      traits: ['神威', '踩踏'],
      remark: '全帶武力突擊輸出，再加鋒矢陣可打地；注意不要用鋒矢，因為SP馬超會死得快',
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['linwei', 'caochuan'], ['臨危救主', '草船借箭'], shenshi(), {
      points: '統',
      traits: ['雍雅', '沉勢'],
      remark: '表上標轉群',
    }),
    seat('xuyou', '許攸', ['jiefan', 'fengshi'], ['解煩衛', '鋒矢陣'], book('junxing', 'xibing', 'shoushi', 'fangbei'), {
      points: '智',
      traits: ['援助', '槍寶物'],
    }),
  ], qilueHuangma, '久戰'),

  qsTeam('lufu-qs-huangma-yanxing', '雁行皇馬弓', 'T0.5', [
    seat('sp-machao', 'SP馬超', ['dangfeng', 'cuifeng'], ['當鋒摧決', '摧鋒斷刃'], yuanqi(), {
      points: '全武',
      traits: ['神威', '踩踏'],
      aptNeed: { troop: '弓', letter: 'S' },
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'yanxing'], ['草船借箭', '雁行陣'], shenshi(), {
      points: '統',
      traits: ['雍雅', '沉勢'],
      remark: '表上標轉群。已是剛需',
    }),
    seat('xuyou', '許攸', ['jinfan', 'linwei'], ['錦帆軍', '臨危救主'], xibingFB(), {
      points: '智',
      traits: ['援助'],
    }),
  ], qilueHuangma, '久戰', '經訓兵振旅讓SP馬超變弓S。'),

  qsTeam('lufu-qs-hanshi-luzhi', '漢室弓', 'T0', [
    seat('sp-caocao', 'SP曹操', ['yanxing', 'taoyuan'], ['雁行陣', '桃園結義'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏', '長健'],
    }),
    seat('sp-luzhi', 'SP盧植', ['gangrou-ji', 'xiandeng'], ['剛柔並濟', '先登死士'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍', 'SP曹操威懾壓制對方戰法發動。SP貂蟬可為友軍在治療後減傷。'),

  qsTeam('lufu-qs-taishi', 'SP盧植太師弓', 'T0.5', [
    seat('sp-luzhi', 'SP盧植', ['yanxing', 'gangrou-ji'], ['雁行陣', '剛柔並濟'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏', '長健'],
    }),
    seat('sp-dongzhuo', 'SP董卓', ['taoyuan', 'shangbing'], ['桃園結義', '上兵伐謀'], sanjiu(), {
      points: '統',
      traits: ['妖氣', '踩踏'],
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'luli'], ['深藏若虛', '戮力同心'], sanjiu(), {
      points: '智',
      traits: ['妖氣', '踩踏', '佳人', '回元'],
    }),
  ], qilueHanshi, '整軍'),

  qsTeam('lufu-qs-hedan-zhang', '核彈張', 'T0.5', [
    seat('zhoutai', '周泰', ['qianlong', 'baima'], ['潛龍陣', '白馬義從'], book('junxing', 'shoudao', 'shoushi', 'fangbei'), {
      points: '統',
      traits: ['靈動', '弓寶物'],
    }),
    seat('zhangfei', '張飛', ['hengsao', 'jifeng'], ['橫掃千軍', '疾風驟雨'], book('yongjian', 'yizhi-bao', 'jingzhun', 'shanzhan'), {
      points: '武',
      traits: ['雄烈', '超頻', '灼裂'],
      aptNeed: { troop: '弓', letter: 'S' },
    }),
    seat('sp-yuanshao', 'SP袁紹', ['chediao', 'shengqi'], ['掣刀斫敵', '盛氣凌敵'], manyong('shengzhan', 'zhirui'), {
      points: '一速+武',
      traits: ['號令'],
    }),
  ], ['背水列陣', '設伏十面', '博浪椎秦', '多多益善', '楚歌四起'], '謀算', '經訓兵振旅讓張飛弓兵提升至S，走弓兵形態。'),

  ayTeam('lufu-ay-juma', '拒馬弓', 'T0', 170, [
    seat('sp-caocao', 'SP曹操', ['yanxing', 'taoyuan'], ['雁行陣', '桃園結義'], sanjiu(), {
      points: '統率',
      traits: ['御策', '活力', '護主', '治軍'],
    }),
    seat('sp-dongzhuo', 'SP董卓', ['gangrou-ji', 'caochuan'], ['剛柔並濟', '草船借箭'], sanjiu(), {
      points: '統率',
      traits: ['妖氣', '援助', '踩踏', '長健'],
      generalChoices: [
        { id: 'sp-dongzhuo', name: 'SP董卓' },
        { id: 'sp-luzhi', name: 'SP盧植' },
      ],
      remark: '有高滿盧植或打兵刃用盧植，沒有就用董卓',
    }),
    seat('sp-diaochan', 'SP貂蟬', ['shencang', 'hejun'], ['深藏若虛', '合軍聚眾'], sanjiu(), {
      points: '智力',
      traits: ['妖氣', '雍雅', '踩踏', '回元'],
    }),
  ], qilueJuma, '', '這隊最強。第二張奇略依原圖謄「疲楚奪勢」。'),

  ayTeam('lufu-ay-yunjian', '五謀臣', 'T0', 110, [
    seat('sp-xunyu', 'SP荀彧', ['guagu', 'luli'], ['刮骨療毒', '戮力同心'], chui(), {
      points: '智力',
      traits: ['符咒', '靈動', '出奇'],
    }),
    seat('xunyou', '荀攸', ['lingji', 'zhuan-shizi'], ['靈機一動', '轉·獅子奮迅'], chui(), { points: '智力' }),
    seat('sp-guojia', 'SP郭嘉', ['duohun', 'dangfeng'], ['奪魂挾魄', '當鋒摧決'], xibingSF(), { points: '智力' }),
  ], ['設伏十面', '博浪椎秦', '功成身退', '合圍夾擊', '楚歌四起'], '', '驚蟄隊，50級以後較穩。郭嘉可改點奇正。'),

  ayTeam('lufu-ay-huangma', '皇馬槍', 'T0', 105, [
    seat('sp-machao', 'SP馬超', ['sucheng', 'cuifeng'], ['速乘其利', '摧鋒斷刃'], yuanqi(), {
      points: '武力',
      traits: ['神威', '疾馳'],
    }),
    seat('sp-huangfusong', 'SP皇甫嵩', ['caochuan', 'weimou'], ['草船借箭', '威謀靡亢'], houfaBu(), {
      points: '統率',
      traits: ['沉勢'],
      remark: '表上標轉群。沒滿配滿裝備會輪到較後',
    }),
    seat('xuyou', '許攸', ['jiefan', 'linwei'], ['解煩衛', '臨危救主'], xibingSF(), { points: '智力' }),
  ], ['親釋荊縛', '芒碭隱蹤', '橫掃河西', '孤軍深入', '敗中求生'], '', '阿焰把皇馬列為第四隊。'),

  ayTeam('lufu-ay-hedan-zhujun', '核彈朱儁', 'T1', 95, [
    seat('zhoutai', '周泰', ['shengqi', 'qianlong'], ['盛氣凌敵', '潛龍陣'], xibingSF(), {
      points: '統率',
      aptNeed: { troop: '盾', letter: 'S' },
    }),
    seat('yuanshu', '袁術', ['fenzui', 'shangbing'], ['焚輜營壘', '上兵伐謀'], manyong(), { points: '智力' }),
    seat('sp-zhujun', 'SP朱儁', ['taiping', 'wudang'], ['太平道法', '無當飛軍'], book('yongjian', 'yizhi-bao', 'jingzhun', 'shanzhan'), {
      points: '智力',
    }),
  ], ['治延軍勢', '受封增邑', '楚歌四起', '居儉避禍', '合圍夾擊'], '', '表稱目前最強碰瓷隊。與巴哈碰瓷同三將。'),

  ayTeam('lufu-ay-taiwei', '太尉盾', 'T1', 95, [
    seat('simayi', '司馬懿', ['zhongzhi', 'shibie'], ['眾志成城', '士別三日'], book('shiji', 'leshan', 'tongjun', 'chuilian'), {
      points: '智力',
    }),
    seat('caocao', '曹操', ['tengjia', 'meihuo'], ['藤甲兵', '魅惑'], chui(), {
      points: '智力',
      traits: ['援助'],
    }),
    seat('manchong', '滿寵', ['xingyi', 'yingcheng'], ['形一陣', '嬰城自守'], chui(), {
      points: '智力',
    }),
  ], qilueJuma, '', '表上寫複刻拒馬奇略。表稱沒有特別好評，老版本強度。'),

  ayTeam('lufu-ay-beifa-qiang', '北伐槍', 'T1.5', 85, [
    seat('sp-zhugeliang', 'SP諸葛亮', ['fuji', 'zhongwang'], ['撫輯軍民', '眾望所歸'], book('jiubian', 'yuanqi', 'suzhan', 'yanxu'), {
      points: '統率一速',
      remark: '第一戰法截圖寫軍民，暫對撫輯軍民，待核',
    }),
    seat('guanxing', '關興', ['qianli', 'pozhen'], ['千里走單騎', '破陣摧堅'], houfa(), {
      points: '武力',
      traits: ['龍驤'],
    }),
    seat('zhangbao', '張苞', ['qingzhou', 'hengge'], ['青州兵', '橫戈躍馬'], book('zuozhan', 'shengyi', 'shengzhan', 'zhirui'), {
      points: '武力',
      traits: ['虎峙'],
    }),
  ], [], '', '打野隊，北伐槍低配版。與北伐盾同三將、兵種改槍。奇略欄寫複刻五謀奇略，未另列五張。'),
];

export const hanyanLufu = [...hanyanLufuMains, ...hanyanLufuMergeSources];
