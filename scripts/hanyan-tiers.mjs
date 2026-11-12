/** 去重後 30 張主卡的強度。替代配置不繼承。 */

const A = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11645';
const B = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11647';
const C = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11650';
const D = 'https://forum.gamer.com.tw/C.php?bsn=36815&snA=11651';
const deck = (slug) => `https://sgsdeck.com/recommended/${slug}`;

function tier(rank, confidence, basis, sources) {
  return { rank, confidence, basis, sources };
}

const src = (label, url) => ({ label, url });

export const hanyanTiers = {
  'hanyan-sanshi-lvbu': tier('T0', '低', '整理站直接標「T0」。Fiona 評許攸版在高強度區略好於皇甫嵩和程普。本卡是血刃加瞋目，不是藏器版。', [
    src('整理站', deck('s27-official-sanshi-lvbu-dun')),
    src('4everfiona', C),
  ]),
  'hanyan-erqiao': tier('T0', '低', '整理站標「T0」，轉述推薦指數五星，並稱給孫尚香連擊和破陣。巴哈未見同三將實測。', [
    src('整理站', deck('s27-official-erqiao-gong')),
  ]),
  'hanyan-dudu': tier('T1', '中', '整理站標「T1」，稱顯著穩定周瑜和陸遜。Fiona 的肉嘟嘟稱既能打續航，也有一定控制。', [
    src('整理站', deck('s27-official-dudu-gong')),
    src('4everfiona', C),
  ]),
  'hanyan-qilin': tier('T1', '低', '整理站標「T1」，稱提高主動戰法發動率和傷害。李老師只把蜀智弓當環境定位，不是這套六戰法實測。', [
    src('整理站', deck('s27-official-qilin-gong')),
    src('24李老师', D),
  ]),
  'hanyan-lvdiaolu': tier('T0', '低', '整理站標「T0」，稱以治療續航為主，再補增傷和連擊。巴哈 40 呂盾的戰報不能背書這支弓。', [
    src('整理站', deck('s27-official-lv-diao-lu-gong')),
  ]),
  'hanyan-qianlong-lvbu': tier('T0', '低', '整理站標「T0」，稱整體以中長回合對抗為主。溫侯弓不能拿來證實或否定這隊。', [
    src('整理站', deck('s27-official-qianlong-lvbu-gong')),
  ]),
  'hanyan-pangtong-gong': tier('T1', '低', '整理站標「T1」，稱用對主動戰法增益明顯的奇略來穩定發揮。不是麒麟弓或蜀智。', [
    src('整理站', deck('s27-official-pangtong-gong')),
  ]),
  'hanyan-beifa': tier('T1', '低', '整理站標「T1」，稱減傷加治療、攻守兼備。上一季北伐盾的評語不作本季證據。', [
    src('整理站', deck('s27-official-beifa-dun')),
  ]),
  'hanyan-hedan': tier('T1', '低', '整理站標「T1」，稱進一步強化陣容中回合的傷害。周泰袁術碰瓷不是這套。', [
    src('整理站', deck('s27-official-hedan-zhang')),
  ]),
  'hanyan-sanxian': tier('T1.5', '低', '整理站標「T1.5」，稱整體以張角為核心。漢弓作者只支持張角的克制方向，不能當整隊更高評級。', [
    src('整理站', deck('s27-official-sanxian-feixiong')),
    src('你看星星无数', B),
  ]),
  'baha-a-huangfu': tier('T0', '中高', '我三弟無敵說皇甫能防止爆頭，但打大漢和內戰會下滑。Fiona 稱綜合能力不錯，防守續航更出眾。', [
    src('我三弟無敵', A),
    src('4everfiona', C),
  ]),
  'baha-a-chengpu': tier('T0', '中高', '我三弟無敵說換成控制跟坦度，程普版對馬超大優勢。Fiona 稱五到八回合是表現期，建議 49 到 50 級再考慮。', [
    src('我三弟無敵', A),
    src('4everfiona', C),
  ]),
  'baha-d-dahan': tier('T0', '中高', '李老師稱四環神之首大漢弓，和 40 呂布平分天下。整理站也標「T0」。漢弓作者提醒 45 到 48 級的法傷弱點。', [
    src('24李老师', D),
    src('整理站', deck('s27-official-dahan-gong')),
    src('你看星星无数', B),
  ]),
  'baha-d-taishi': tier('T0.5', '中低', '李老師稱沒抽滿 SP曹操時的最優選擇，強度略有下降，但依然在線。', [
    src('24李老师', D),
  ]),
  'baha-d-qianlong-fa': tier('T1.5', '中', '李老師稱克制和戰損比尚可，但遠遠不值得犧牲兩個體系，推薦程度一般。', [
    src('24李老师', D),
  ]),
  'baha-d-huangma': tier('T0.5', '中', '整理站標「T0」。Fiona 稱第三幻神。李老師列怕法官、40 呂、大漢弓和蜀智盾，因此下修半級。', [
    src('整理站', deck('s27-official-huangma-qiang')),
    src('4everfiona', C),
    src('24李老师', D),
  ]),
  'baha-d-qiaoliao': tier('T1', '中', '李老師稱是皇馬之外不錯的去處，但怕法官、大漢弓、40 呂布和五謀，優平馬超。', [
    src('24李老师', D),
  ]),
  'baha-d-saozi': tier('T2', '中低', '李老師稱模擬評分很好，但自己實戰非常拉胯。實戰負評優先於模擬。', [
    src('24李老师', D),
  ]),
  'baha-d-kangkai': tier('T1.5', '中', '整理站標「T1.5」。李老師稱是平民開荒第一隊，但交戰盯著皇馬打，打其他隊伍是劣勢。', [
    src('整理站', deck('s27-official-kangkai-gong')),
    src('24李老师', D),
  ]),
  'baha-d-wenhou': tier('T1.5', '低', '李老師稱如果甘寧紅，還不如玩更優先的慷慨弓。這是推薦順位，不能繼承潛龍周瑜版的 T0。', [
    src('24李老师', D),
  ]),
  'baha-d-pengci': tier('黑科技', '中', '李老師稱優勢皇馬和太師弓，對大漢弓效果一般，一個武將帶 6000 到 7000 即可。', [
    src('24李老师', D),
  ]),
  'dami-madai': tier('T0.5', '中', '整理站把同六戰法的法關盾標「T0」。Fiona 說台服已跌下 T0。李老師稱它是 40 呂的下替。', [
    src('整理站', deck('s27-official-fa-guan-dun')),
    src('4everfiona', C),
    src('24李老师', D),
  ]),
  'dami-xingcai': tier('T0.5', '中低', '李老師稱星彩大於馬岱。整理站把 CO 星彩和馬岱列在同一法關盾。Fiona 說這環境已跌下 T0。', [
    src('24李老师', D),
    src('整理站', deck('s27-official-fa-guan-dun')),
    src('4everfiona', C),
  ]),
  'dami-shuzhi': tier('T0.5', '中', '李老師稱航母區更推薦蜀智盾、專打高端局，但續航和穩定性遠不如 40 呂和法官。', [
    src('24李老师', D),
  ]),
  'dami-shugong': tier('T1', '低', '整理站把同三將的麒麟弓標「T1」。李老師說大漢怕蜀智弓。這套四格不同，沒有同構築戰報。', [
    src('整理站', deck('s27-official-qilin-gong')),
    src('24李老师', D),
  ]),
  'dami-beifa': tier('T1', '低', '整理站把北伐盾標「T1」、攻守兼備。這套改知己、奇正和文武，不是同一配置。', [
    src('整理站', deck('s27-official-beifa-dun')),
  ]),
  'dami-wanghong': tier('T1.5', '低', '沒有可用的台港澳同構築評級。依截圖的裸衣加疾風橫掃暫判次選。大戰士仍未核對。', []),
  'dami-fugui': tier('T1', '中', '整理站把五謀騎標「T0」。Fiona 說賈詡對主流斷檔差於荀攸。漢弓作者說要挑克制打。', [
    src('整理站', deck('s27-official-wumou-qi')),
    src('4everfiona', C),
    src('你看星星无数', B),
  ]),
  'dami-shuzhi-qi': tier('T0.5', '中', 'Fiona 說高強度航母是荀攸優先於賈詡，但對 40 呂仍是劣勢。漢弓作者建議先出荀攸版五謀。', [
    src('4everfiona', C),
    src('你看星星无数', B),
  ]),
  'dami-taiwei': tier('T1', '中低', '整理站把刮骨太尉標「T1」，以減傷加治療為主。李老師列 40 呂怕帶藤甲的太尉盾。', [
    src('整理站', deck('s27-official-taiwei-dun')),
    src('24李老师', D),
  ]),
};

export function applyTiers(list) {
  return list.map((team) => {
    const tierRow = hanyanTiers[team.id];
    if (!tierRow) return team;
    return {
      ...team,
      rank: tierRow.rank,
      rankStatus: team.origin === 'dami' ? '待核' : '已核',
      rankBasis: tierRow.basis,
      rankConfidence: tierRow.confidence,
      rankSources: tierRow.sources,
    };
  });
}
