/** 把核准的 10 組近重複收成主卡上的替代配置。主卡狀態不繼承替代來源。 */

const GONE = new Set([
  'hanyan-dahan-gong',
  'baha-b-gong-1',
  'baha-b-gong-2',
  'baha-b-gong-3',
  'baha-a-xuyou',
  'hanyan-huangma',
  'hanyan-faguan',
  'hanyan-wumou',
  'baha-b-jiaxu-2',
  'baha-b-xunyou-1',
  'baha-b-xunyou-2',
  'baha-c-fugui',
  'baha-c-roudu',
  'hanyan-taiwei',
  'hanyan-kangkai',
  'baha-d-shuzhi',
]);

const B = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11647';
const A = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11645';
const C = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11650';
const D = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11651';
const FB = 'https://www.facebook.com/100064157226677/posts/1549258503889376/';

function alt(id, title, originLabel, author, source, status, diffs, officialSource = '') {
  const row = { id, title, originLabel, author, source, status, diffs };
  if (officialSource) row.officialSource = officialSource;
  return row;
}

const deck = (slug) => `https://sgsdeck.com/recommended/${slug}`;

const ALTS = {
  'baha-d-dahan': [
    alt('hanyan-dahan-gong', '官方整理版', '官方推薦', '', deck('s27-official-dahan-gong'), '待核', [
      '六戰法與主卡相同，只差簡稱。',
      '方略：整軍。三將兵書皆三軍之眾、久戰、統軍。不寫進李老師原卡。',
      '奇略：芒碭隱蹤→沛縣聚義→約法三章→鴻門遁險→推食解衣。',
    ], FB),
    alt('baha-b-gong-1', '草船版', '巴哈玩家版', '你看星星无数', B, '已核', [
      'SP曹操：草船借箭、剛柔並濟。其餘戰法同主卡。',
      '45～48級穩定；曹操2速貼盧植。奇略、兵書、方略未寫。',
    ]),
    alt('baha-b-gong-2', '移花版', '巴哈玩家版', '你看星星无数', B, '已核', [
      'SP貂蟬：移花接木、戮力同心。其餘戰法同主卡。',
      '建議48級後。奇略、兵書、方略未寫。',
    ]),
    alt('baha-b-gong-3', '先登曹操版', '巴哈玩家版', '你看星星无数', B, '已核', [
      'SP曹操：草船借箭／桃園結義、先登死士。',
      'SP盧植：雁行陣、剛柔並濟。先登從盧植轉給曹操。',
      '速度盧植＞貂蟬＞曹操。原文適用有雍雅沉重。',
    ]),
  ],
  'hanyan-sanshi-lvbu': [
    alt('baha-a-xuyou', '藏器版', '巴哈玩家版', '我三弟無敵', A, '已核', [
      '40呂：藏器、血刃。兵書蠻勇武略執銳／示敵百戰掩虛。',
      'SP法正：蓄勢、三勢。三勢從許攸轉入。',
      '許攸：藤甲、臨危。藤甲從法正轉入。盾散。',
      '奇略：韜晦→背水→十面→長安→多多。血刃可換的寫法不另開卡。',
    ]),
  ],
  'baha-d-huangma': [
    alt('hanyan-huangma', '官方整理版', '官方推薦', '', deck('s27-official-huangma-qiang'), '待核', [
      '許攸只列臨危救主、解煩衛。主卡另可乘敵不虞。',
      '方略：強攻。三將兵書另列，不覆寫主卡。',
      '奇略：橫掃河西→封狼居胥→摧鋒陷敵→斬逆納降→追亡逐北。',
    ], FB),
    alt('baha-d-huangma-gong', '皇馬弓', '巴哈玩家版', '24李老师', D, '待核', [
      'SP皇甫嵩：雁形陣、草船，或不帶草船、改先登。',
      '許攸：臨危救主、錦帆軍。SP馬超技能留言未重列。',
      '兵書、方略、奇略未另列，不從槍版複製。',
    ]),
  ],
  'dami-madai': [
    alt('hanyan-faguan', '官方整理版', '官方推薦', '', deck('s27-official-fa-guan-dun'), '待核', [
      '馬岱固定藤甲兵、魚鱗陣；SP法正固定非攻制勝。',
      '方略：襲擾。六戰法與兵書在這支選法下與主卡相同。',
      '奇略：設伏十面→背水列陣→楚歌四起→治延軍勢→多多益善。',
      '馬岱可換無雙星彩，見星彩法關盾，不併成同一張卡。',
    ], FB),
  ],
  'dami-fugui': [
    alt('hanyan-wumou', '官方整理版', '官方推薦', '', deck('s27-official-wumou-qi'), '待核', [
      '郭嘉上兵伐謀、賈詡戮力同心時，六戰法與主卡這支相同。',
      'SP郭嘉兵書：以治擊亂、鬼謀、將威。方略：謀算。',
      '奇略：設伏十面→背水列陣→楚歌四起→多多益善→合圍夾擊。',
    ], FB),
    alt('baha-b-jiaxu-2', '48級後版', '巴哈玩家版', '你看星星无数', B, '已核', [
      'SP荀彧：戮力同心、刮骨療毒。',
      '賈詡：靈機一動、拓·聚石成金。拓本不當原版。',
      'SP郭嘉：奪魂挾魄、上兵伐謀。',
    ]),
  ],
  'dami-shuzhi-qi': [
    alt('baha-b-xunyou-1', '靈機在荀彧', '巴哈玩家版', '你看星星无数', B, '已核', [
      'SP荀彧：靈機一動、刮骨療毒。1速。',
      '荀攸：轉獅子、上兵伐謀。轉獅子仍是候選全名。',
      'SP郭嘉貼速。兵書、方略、奇略未寫，不以大米補。',
    ]),
    alt('baha-b-xunyou-2', '戮力版', '巴哈玩家版', '你看星星无数', B, '已核', [
      'SP荀彧：戮力同心、刮骨療毒。',
      '荀攸：靈機一動、上兵伐謀。',
      'SP郭嘉戰法不變。兵書、方略、奇略未寫。',
    ]),
    alt('baha-c-fugui', '上兵版', '巴哈玩家版', '4everfiona', C, '已核', [
      '荀攸：轉獅子、上兵。不要和郭嘉同時再帶上兵。',
      'SP郭嘉兵書：以退、善戰、精準。缺當鋒時保留這套。',
    ]),
  ],
  'hanyan-dudu': [
    alt('baha-c-roudu', '肉嘟嘟', '巴哈玩家版', '4everfiona', C, '已核', [
      '周瑜：戮力同心、聚石成金。不紅可換SP周瑜。',
      '陸遜：拓·鎮扼防拒（功不）、萬軍奪帥。',
      'SP呂蒙：雁行陣（當鋒也可以）、草船。程普也可以。',
      '整套保留。合圍突擊／合圍夾擊疑點仍在主卡。',
    ]),
  ],
  'dami-taiwei': [
    alt('hanyan-taiwei', '刮骨版', '官方推薦', '', deck('s27-official-taiwei-dun'), '待核', [
      '滿寵：蓄勢待發、刮骨療毒。形一陣改刮骨，不是轉·形一陣。',
      '司馬懿兵書：樂善好施、統軍、錘煉。',
      '方略：整軍。',
      '奇略：芒碭隱蹤→推食解衣→沛縣聚義→博浪椎秦→敗中求生。',
    ], FB),
  ],
  'baha-d-kangkai': [
    alt('hanyan-kangkai', '官方整理版', '官方推薦', '', deck('s27-official-kangkai-gong'), '待核', [
      'SP呂蒙固定雁行陣、臨危救主。主卡另可程普或乘敵不虞。',
      '方略：強攻。奇略五張及順序與主卡相同。',
      '兵書與特技另列，不寫進李老師原卡。',
    ], FB),
  ],
  'dami-shuzhi': [
    alt('baha-d-shuzhi', '藤甲奇略版', '巴哈玩家版', '24李老师', D, '已核', [
      '諸葛亮可改藤甲兵。前期刮骨、後期藤甲。',
      '奇略：芒砀隐踪→沛县聚义→波浪推秦→推食解衣→约法三章。',
      '未寫兵書與盾適性，不倒灌進大米主卡。',
    ]),
  ],
};

function rank(team) {
  if (team.origin === 'dami') return 0;
  if (team.origin === 'bahamut' && team.author === '24李老师') return 1;
  if (team.origin === 'bahamut') return 2;
  return 3;
}

export function applyMerges(list) {
  const next = list.filter((team) => !GONE.has(team.id)).map((team) => {
    const alternatives = ALTS[team.id];
    return alternatives ? { ...team, alternatives } : team;
  });
  return next.sort((a, b) => rank(a) - rank(b));
}
