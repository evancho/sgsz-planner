/** 兵演春秋 sgsdeck 推薦 25 隊。狀態待核；戰法／兵書依 2026-11-12 打開的隊伍詳情頁轉錄。 */

const DECK = (slug) => `https://sgsdeck.com/recommended/${slug}`;
const NOTE = 'sgsdeck 轉錄，官網原文待再核';

function book(branch, primary, left, right) {
  return { branch, primary, secondary: [left, right] };
}

function seat(generalId, generalName, learned, learnedNames, bingshu, extra = {}) {
  const member = { generalId, generalName, learned, learnedNames };
  if (bingshu) member.bingshu = bingshu;
  const opts = extra && typeof extra === "object" ? extra : {};
  if (opts.points) member.points = opts.points;
  if (opts.remark) member.remark = opts.remark;
  if (opts.unlisted?.length) member.unlisted = opts.unlisted;
  return member;
}

function team(id, title, slug, rank, members) {
  return {
    id,
    scenario: 'bingyan',
    title,
    status: '待核',
    origin: 'sgsdeck',
    originLabel: 'sgsdeck',
    rank,
    rankStatus: '待核',
    source: DECK(slug),
    note: NOTE,
    members,
  };
}

export const bingyanRecommended = [
  team("bingyan-40y-lvbu-b", "40Y 呂布弓（王異法正）", "og-bingyan-40y-lvbu-b", "T0", [
    seat("y40-lvbu", "40Y呂布", ["yinxian", "xueren"], ["引弦力戰", "血刃爭鋒"], book("yongjian", "yitui", "jingzhun", "chizhong"), { points: "武力" }),
    seat("wangyi", "王異", ["duohun", "dangfeng"], ["奪魂挾魄", "當鋒摧決"], book("zuozhan", "qizheng", "wentao", "cangdao"), { points: "智力" }),
    seat("sp-fazheng", "SP法正", ["sanshi", "linwei"], ["三勢陣", "臨危救主"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力", remark: "配弓兵寶物升級為 S。擅長對抗皇馬槍、五謀騎；對非藤甲法關盾互有勝負" })
  ]),
  team("bingyan-40y-lvbu-xiandeng", "40Y 呂布弓（精·先登死士）", "og-bingyan-40y-lvbu-xiandeng", "T0", [
    seat("y40-lvbu", "40Y呂布", ["xueren", "yinxian"], ["血刃爭鋒", "引弦力戰"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力", remark: "兵書大書可換不勇則死" }),
    seat("sp-luzhi", "SP盧植", ["yanxing", "xiandeng"], ["雁行陣", "先登死士"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "統率", remark: "先登死士需改造為 精·先登死士，選【抵抗】【抑勢】【奪志】【疊加】" }),
    seat("sp-diaochan", "SP貂蟬", ["shencang", "gangrou-ji"], ["深藏若虛", "剛柔並濟"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "智力" })
  ]),
  team("bingyan-40y-lvbu-d", "40Y 呂布弓（董卓貂蟬）", "og-bingyan-40y-lvbu-d", "T0", [
    seat("y40-lvbu", "40Y呂布", ["xueren", "yinxian"], ["血刃爭鋒", "引弦力戰"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力", remark: "兵書大書可換不勇則死" }),
    seat("sp-diaochan", "SP貂蟬", ["shencang", "gangrou-ji"], ["深藏若虛", "剛柔並濟"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "智力" }),
    seat("sp-dongzhuo", "SP董卓", ["yanxing", "xiandeng"], ["雁行陣", "先登死士"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "統率", remark: "也可用董卓。先登死士需改造為 精·先登死士，選【抑勢】【抵抗】" })
  ]),
  team("bingyan-40y-lvbu-a", "40Y 呂布弓（貂蟬盧植）", "og-bingyan-40y-lvbu-a", "T0", [
    seat("y40-lvbu", "40Y呂布", ["xueren", "yinxian"], ["血刃爭鋒", "引弦力戰"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力", remark: "兵書可換 以直報怨 / 精準 / 持重" }),
    seat("sp-diaochan", "SP貂蟬", ["shencang", "gangrou-ji"], ["深藏若虛", "剛柔並濟"], book("shiji", "sanjun", "tongjun", "jiuzhan"), { points: "智力", remark: "提升治療與減傷" }),
    seat("sp-luzhi", "SP盧植", ["yanxing", "xiandeng"], ["雁行陣", "先登死士"], book("shiji", "sanjun", "tongjun", "jiuzhan"), { points: "統率", remark: "雁行陣為部隊轉移負面效果" })
  ]),
  team("bingyan-wumou-bow-baimaobing", "五謀弓（轉·白毦兵）", "og-bingyan-wumou-bow-baimaobing", "T0", [
    seat("sp-xunyu", "SP荀彧", ["baimao", "guagu"], ["白毦兵", "刮骨療毒"], book("shiji", "sanjun", "tongjun", "chuilian"), { points: "智力", remark: "配政令寶物升級為 S。白毦兵需改造為 轉·白毦兵（選【轉·彎弓】轉弓兵）" }),
    seat("sp-guojia", "SP郭嘉", ["duohun", "dangfeng"], ["奪魂挾魄", "當鋒摧決"], book("zuozhan", "qizheng", "cangdao", "wentao"), { points: "智力", remark: "配弓兵寶物升級為 S" }),
    seat("jiaxu", "賈詡", ["lingji", "shangbing"], ["靈機一動", "上兵伐謀"], book("shiji", "sanjun", "tongjun", "chuilian"), { points: "智力", remark: "靈機一動需改造為 精·靈機一動" })
  ]),
  team("bingyan-wunv-cavalry-hubaoqi", "吳女騎（精·虎豹騎）", "og-bingyan-wunv-cavalry-hubaoqi", "T0", [
    seat("wushuang-daqiao", "無雙大喬", ["meihuo", "caochuan"], ["魅惑", "草船借箭"], book("shiji", "dongruo", "chuilian", "tongjun"), { points: "統率", remark: "大兵書可換三軍之眾" }),
    seat("sunshangxiang", "孫尚香", ["dangfeng", "sucheng"], ["當鋒摧決", "速乘其利"], book("zuozhan", "shengyi", "shengzhan", "cangdao"), { points: "武力", remark: "加點帶驚鴻。兵書可換 以治擊亂 / 神機 / 將威" }),
    seat("wushuang-xiaoqiao", "無雙小喬", ["linwei", "hubao"], ["臨危救主", "虎豹騎"], book("shiji", "zhenge", "chuilian", "tongjun"), { points: "武力 統率", remark: "虎豹騎需改造為 精·虎豹騎，選【神行】【操演】【延益】【重創】" })
  ]),
  team("bingyan-taishi-bow-feixiong", "太師弓（轉·飛熊軍）", "og-bingyan-taishi-bow-feixiong", "T0", [
    seat("sp-dongzhuo", "SP董卓", ["feixiong", "shangbing"], ["飛熊軍", "上兵伐謀"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "統率", remark: "飛熊軍需改造為 轉·飛熊軍（選【轉·彎弓】轉弓兵）" }),
    seat("sp-luzhi", "SP盧植", ["yanxing", "gangrou-ji"], ["雁行陣", "剛柔並濟"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "統率" }),
    seat("sp-diaochan", "SP貂蟬", ["shencang", "luli"], ["深藏若虛", "戮力同心"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "智力" })
  ]),
  team("bingyan-zhangfei-nuke-bow", "張飛核彈弓（精·無當飛軍）", "og-bingyan-zhangfei-nuke-bow", "T0", [
    seat("zhoutai", "周泰", ["qianlong", "shengqi"], ["潛龍陣", "盛氣凌敵"], book("junxing", "shoudao", "shoushi", "fangbei"), { points: "統率", remark: "兵書可換 誘敵之策 / 掩虛 / 勵軍" }),
    seat("zhangfei", "張飛", ["jifeng", "gangyong"], ["疾風驟雨", "剛勇無前"], book("yongjian", "yitui", "jingzhun", "chizhong"), { points: "武力", remark: "配政令與弓兵寶物升級為 S。加點帶雄烈" }),
    seat("sp-zhujun", "SP朱儁", ["wudang", "taiping"], ["無當飛軍", "太平道法"], book("yongjian", "yitui", "jingzhun", "chizhong"), { points: "智力", remark: "無當飛軍需改造為 精·無當飛軍，選【兼修】【未定】【破軍】【智絕】" })
  ]),
  team("bingyan-faguan-shield-tengjia", "法關盾（精·藤甲兵）", "og-bingyan-faguan-shield-tengjia", "T0", [
    seat("sp-guanyu", "SP關羽", ["yigua", "jifeng"], ["以寡敵眾", "疾風驟雨"], book("jiubian", "fenji", "baizhan", "yanxu"), { points: "武力" }),
    seat("madai", "馬岱", ["yulin", "tengjia"], ["魚鱗陣", "藤甲兵"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "統率", remark: "也可用無雙星彩。藤甲兵需改造為 精·藤甲兵，選【忍耐】【藤甲】【免疫】【堅韌】" }),
    seat("sp-fazheng", "SP法正", ["xushidai", "feigong"], ["蓄勢待發", "非攻制勝"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力" })
  ]),
  team("bingyan-huangma-spear-jiefanwei", "皇馬槍（精·解煩衛）", "og-bingyan-huangma-spear-jiefanwei", "T0", [
    seat("sp-machao", "SP馬超", ["dangfeng", "cuifeng"], ["當鋒摧決", "摧鋒斷刃"], book("jiubian", "yuanqi", "suzhan", "yanxu"), { points: "武力" }),
    seat("sp-huangfusong", "SP皇甫嵩", ["caochuan", "wanjun"], ["草船借箭", "萬軍奪帥"], book("yongjian", "shenshi", "kaihe", "fenli"), { points: "統率" }),
    seat("xuyou", "許攸", ["linwei", "jiefan"], ["臨危救主", "解煩衛"], book("junxing", "xibing", "shoushi", "fangbei"), { points: "智力", remark: "解煩衛需改造為 精·解煩衛，選【精研】【武魁】【救護】【軍心】" })
  ]),
  team("bingyan-dongzhuo-bow-xiandeng", "董卓弓（精·先登死士）", "og-bingyan-dongzhuo-bow-xiandeng", "T0", [
    seat("y40-lvbu", "40Y呂布", ["xueren", "yinxian"], ["血刃爭鋒", "引弦力戰"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力", remark: "兵書大書可換不勇則死" }),
    seat("sp-diaochan", "SP貂蟬", ["shencang", "gangrou-ji"], ["深藏若虛", "剛柔並濟"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "智力" }),
    seat("sp-dongzhuo", "SP董卓", ["yanxing", "xiandeng"], ["雁行陣", "先登死士"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "統率", remark: "也可用董卓。先登死士需改造為 精·先登死士，選【抵抗】【抑勢】【奪志】【疊加】" })
  ]),
  team("bingyan-xuyou-spmachao-cavalry", "許攸馬超騎", "og-bingyan-xuyou-spmachao-cavalry", "T0", [
    seat("wushuang-daqiao", "無雙大喬", ["qianlong", "duxing"], ["潛龍陣", "獨行赴斗"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "統率", remark: "配騎兵寶物升級為 S。高統率配獨行赴鬥承擔敵軍傷害" }),
    seat("xuyou", "許攸", ["linwei", "hubao"], ["臨危救主", "虎豹騎"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力", remark: "使用魏登庸令轉魏陣營。虎豹騎需改造為 精·虎豹騎，提升馬超突擊發動率" }),
    seat("sp-machao", "SP馬超", ["dangfeng", "cuifeng"], ["當鋒摧決", "摧鋒斷刃"], book("jiubian", "yuanqi", "suzhan", "yanxu"), { points: "武力 速度", remark: "維持經典戰法搭配，在大喬和許攸輔助下穩定輸出" })
  ]),
  team("bingyan-taoyuan-shield-huijun", "桃園盾（麾軍結陣）", "og-bingyan-taoyuan-shield-huijun", "T0.5", [
    seat("liubei", "劉備", ["xianzhen", "guagu"], ["陷陣營", "刮骨療毒"], book("jiubian", "yuanqi", "yanxu", "lijun"), { points: "智力", remark: "透過自帶戰法和刮骨療毒，承擔部隊的治療和解控效果" }),
    seat("guanyu", "關羽", ["weimou", "huijun"], ["威謀靡亢", "麾軍結陣"], book("xushi", "houfa", "guimou", "jiangwei-book"), { points: "武力 速度", remark: "任命關興軍師技。戰法可換破陣摧堅 / 絕其汲道" }),
    seat("zhangfei", "張飛", ["gangyong", "jiqi"], ["剛勇無前", "擊其惰歸"], book("yongjian", "yizhi-bao", "jingzhun", "shanzhan"), { points: "武力", remark: "剛勇無前和擊其惰歸提高傷害" })
  ]),
  team("bingyan-40y-lvbu-c", "40Y 呂布群弓（甘寧許攸）", "og-bingyan-40y-lvbu-c", "T1", [
    seat("ganning", "甘寧", ["jinfan", "caochuan"], ["錦帆軍", "草船借箭"], book("shiji", "leshan", "chuilian", "tongjun"), { points: "武力", remark: "使用登庸令·群轉群陣營" }),
    seat("y40-lvbu", "40Y呂布", ["xueren", "yinxian"], ["血刃爭鋒", "引弦力戰"], book("yongjian", "yizhi-bao", "jingzhun", "chizhong"), { points: "武力", remark: "兵書可換 不勇則死 / 武略 / 執銳" }),
    seat("xuyou", "許攸", ["yanxing", "linwei"], ["雁行陣", "臨危救主"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力 統率", remark: "配弓兵寶物升級為 S。臨危救主提供治療和謀略減傷" })
  ]),
  team("bingyan-40y-lvbu-qun-bow-jinfan", "40Y 呂布群弓（精·錦帆軍）", "og-bingyan-40y-lvbu-qun-bow-jinfan", "T1", [
    seat("ganning", "甘寧", ["caochuan", "jinfan"], ["草船借箭", "錦帆軍"], book("shiji", "leshan", "chuilian", "tongjun"), { points: "武力 統率", remark: "使用登庸令·群轉群陣營。錦帆軍需改造為 精·錦帆軍，選【神射】【勇武】【招架】【營嘯】" }),
    seat("y40-lvbu", "40Y呂布", ["yinxian", "xueren"], ["引弦力戰", "血刃爭鋒"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力" }),
    seat("xuyou", "許攸", ["linwei", "yanxing"], ["臨危救主", "雁行陣"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力" })
  ]),
  team("bingyan-beifa-shield-huweijun", "北伐盾（精·虎衛軍）", "og-bingyan-beifa-shield-huweijun", "T1", [
    seat("sp-zhugeliang", "SP諸葛亮", ["huwei", "xushidai"], ["虎衛軍", "蓄勢待發"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "統率", remark: "配政令與盾兵寶物升級為 S。虎衛軍需改造為 精·虎衛軍" }),
    seat("guanxing", "關興", ["qianli", "wenwu"], ["千里走單騎", "文武雙全"], book("xushi", "houfa", "guimou", "jiangwei-book"), { points: "武力", remark: "也可用關羽" }),
    seat("zhangbao", "張苞", ["futang", "feigong"], ["赴湯蹈火", "非攻制勝"], book("shiji", "zhenge", "tongjun", "chuilian"), { points: "統率", remark: "配盾兵寶物升級為 S" })
  ]),
  team("bingyan-lvbu-zhouyu-bow", "呂布周瑜弓", "og-bingyan-lvbu-zhouyu-bow", "T1", [
    seat("xuyou", "許攸", ["qianlong", "linwei"], ["潛龍陣", "臨危救主"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力", remark: "配弓兵寶物升級為 S。使用魏登庸令轉魏陣營" }),
    seat("lvbu", "呂布", ["dangfeng", "cuifeng"], ["當鋒摧決", "摧鋒斷刃"], book("yongjian", "chuqi", "chizhong", "jingzhun"), { points: "武力", remark: "作為一速，當鋒摧決破防，高頻普攻＋摧鋒斷刃壓制敵軍輸出" }),
    seat("zhouyu", "周瑜", ["duohun", "fenzui"], ["奪魂挾魄", "焚輜營壘"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力", remark: "作為尾速，敵軍智力被持續壓制下打出大量謀略傷害" })
  ]),
  team("bingyan-lvguoqiao-baima", "呂郭喬（精·白馬義從）", "og-bingyan-lvguoqiao-baima", "T1", [
    seat("lvbu", "呂布", ["wangong", null], ["彎弓飲羽", "破甲"], book("yongjian", "chuqi", "chizhong", "jingzhun"), { points: "武力", remark: "任命貂蟬軍師", unlisted: ["破甲"] }),
    seat("guojia", "郭嘉", ["sanshi", "huochi"], ["三勢陣", "火熾原燎"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "半智半統" }),
    seat("wushuang-xiaoqiao", "無雙小喬", ["wenwu", "baima"], ["文武雙全", "白馬義從"], book("yongjian", "yitui", "jingzhun", "chizhong"), { points: "武力", remark: "白馬義從需改造為 精·白馬義從，選【飛馳】【習武】【靈光】【久戰】" })
  ]),
  team("bingyan-taishici-bow", "太史慈弓", "og-bingyan-taishici-bow", "T1", [
    seat("ganning", "甘寧", ["caochuan", "jinfan"], ["草船借箭", "錦帆軍"], book("shiji", "leshan", "jiuzhan", "tongjun"), { points: "統率", remark: "利用草船借箭和樂善好施效果，為部隊提供高額治療量" }),
    seat("taishici", "太史慈", ["dangfeng", "cuifeng"], ["當鋒摧決", "摧鋒斷刃"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力", remark: "大兵書可換蠻勇非勇。摧鋒斷刃壓制敵人輸出，當鋒摧決施加控制" }),
    seat("sp-lvmeng", "SP呂蒙", ["linwei", "yanxing"], ["臨危救主", "雁行陣"], book("shiji", "sanjun", "jiuzhan", "tongjun"), { points: "統率", remark: "提供控制，高統率搭配雁行陣可最大發揮效果" })
  ]),
  team("bingyan-jiangwei-feixiong-cavalry", "姜維飛熊軍", "og-bingyan-jiangwei-feixiong-cavalry", "T1", [
    seat("jiangwei", "姜維", ["duohun", "shangbing"], ["奪魂挾魄", "上兵伐謀"], book("zuozhan", "manyong", "zhirui", "wentao"), { points: "智力", remark: "使用魏登庸令轉魏陣營" }),
    seat("caocao", "曹操", ["meihuo", "fengshi"], ["魅惑", "鋒矢陣"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力 統率", remark: "加點帶援助甲" }),
    seat("manchong", "滿寵", ["feixiong", "lingji"], ["飛熊軍", "靈機一動"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力", remark: "飛熊軍需改造為 精·飛熊軍" })
  ]),
  team("bingyan-zhangjiao-yuji-cavalry", "張角于吉騎", "og-bingyan-zhangjiao-yuji-cavalry", "T1", [
    seat("zhangjiao", "張角", ["taiping", "wenwu"], ["太平道法", "文武雙全"], book("xushi", "jizhan", "guimou", "jiangwei-book"), { points: "智力", remark: "配騎兵寶物升級為 S。士別三日可保障生存並造成傷害，文武雙全大幅提升智力" }),
    seat("yuji", "于吉", ["caochuan", "feixiong"], ["草船借箭", "飛熊軍"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "統率（1速）", remark: "一速發動草船借箭解控。也可用竭力佐謀＋刮骨療毒替代草船借箭" }),
    seat("zuoci", "左慈", ["fengshi", "guagu"], ["鋒矢陣", "刮骨療毒"], book("jiubian", "yuanqi", null, "jiuzhu"), { points: "智力", remark: "攜帶鋒矢陣為張角提供穩定增傷", unlisted: ["散仙"] })
  ]),
  team("bingyan-kangkai-bow-jinfan", "慷慨弓（精·錦帆軍）", "og-bingyan-kangkai-bow-jinfan", "T1", [
    seat("ganning", "甘寧", ["caochuan", "jinfan"], ["草船借箭", "錦帆軍"], book("shiji", "leshan", "chuilian", "tongjun"), { points: "武力 統率", remark: "錦帆軍需改造為 精·錦帆軍，選【神射】【勇武】【招架】【營嘯】" }),
    seat("taishici", "太史慈", ["dangfeng", "cuifeng"], ["當鋒摧決", "摧鋒斷刃"], book("zuozhan", "shengyi", "wulue", "zhirui"), { points: "武力" }),
    seat("sp-lvmeng", "SP呂蒙", ["linwei", "yanxing"], ["臨危救主", "雁行陣"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "統率" })
  ]),
  team("bingyan-quan-cavalry-hubaoqi", "權騎（精·虎豹騎）", "og-bingyan-quan-cavalry-hubaoqi", "T1", [
    seat("sunquan", "孫權", ["yiqi", "baiqi"], ["一騎當千", "百騎劫營"], book("zuozhan", "yigu", "wulue", "zhirui"), { points: "武力" }),
    seat("lingtong", "凌統", ["luoyi", "dangfeng"], ["裸衣血戰", "當鋒摧決"], book("zuozhan", "buyong", "shengzhan", "fenxian"), { points: "武力 速度" }),
    seat("zhoutai", "周泰", ["hubao", "fengshi"], ["虎豹騎", "鋒矢陣"], book("junxing", "shoudao", "shoushi", "jingxin"), { points: "統率", remark: "虎豹騎需改造為 精·虎豹騎，選【神行】【衝鋒】【延益】【重創】" })
  ]),
  team("bingyan-dudu-bow-baimaobing", "都督弓（轉·白毦兵）", "og-bingyan-dudu-bow-baimaobing", "T1", [
    seat("zhouyu", "周瑜", ["duohun", "fenzui"], ["奪魂挾魄", "焚輜營壘"], book("shiji", "sanjun", "yuanmou", "tongjun"), { points: "智力" }),
    seat("luxun", "陸遜", ["luli", "baimao"], ["戮力同心", "白毦兵"], book("yongjian", "chuqi", "jingzhun", "kaihe"), { points: "智力", remark: "白毦兵需改造為 轉·白毦兵（選【轉·彎弓】轉弓兵）；靈機一動需改造為 精·靈機一動" }),
    seat("sp-lvmeng", "SP呂蒙", ["yanxing", "caochuan"], ["雁行陣", "草船借箭"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "統率" })
  ]),
  team("bingyan-guanyu-weiyan-fazheng-shield", "關魏法盾", "og-bingyan-guanyu-weiyan-fazheng-shield", "T1", [
    seat("guanyu", "關羽", ["pozhen", "yulin"], ["破陣摧堅", "魚鱗陣"], book("xushi", "houfa", "guimou", "jiangwei-book"), { points: "武力", remark: "任命關興軍師技。高武力高統率配魚鱗陣，為副將提供抵禦" }),
    seat("weiyan", "魏延", ["jueqi", "suoxiang"], ["絕其汲道", "所向披靡"], book("yongjian", "yitui", "chizhong", "jingzhun"), { points: "武力", remark: "先禁療再打大量傷害" }),
    seat("sp-fazheng", "SP法正", ["xushidai", "xianzhen"], ["蓄勢待發", "陷陣營"], book("shiji", "sanjun", "chuilian", "tongjun"), { points: "智力", remark: "為部隊提供剛毅和治療能力。全隊懼怕必中效果，如吳騎" })
  ]),
];
