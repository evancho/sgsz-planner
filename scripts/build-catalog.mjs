/**
 * One-shot catalog builder. Output JSON is the source of truth;
 * this script is not required at runtime.
 *
 * Aptitude letters follow 騎、盾、弓、槍、器械 (wiki column order).
 */
import { writeFileSync } from 'node:fs';
import { tacticRows } from './tactic-catalog.mjs';

const VERSION = '1.2.1';

const APT_ORDER = ['騎', '盾', '弓', '槍', '器械'];

function parseApt(code) {
  if (!/^[SABC]{5}$/.test(code)) throw new Error(`bad apt ${code}`);
  const apt = {};
  APT_ORDER.forEach((key, i) => {
    apt[key] = code[i];
  });
  return apt;
}

function g(id, name, camp, cost, role, apt, dyn, innate = '', tags = null) {
  const general = {
    id,
    name,
    camp,
    cost,
    role,
    quality: '名將',
    collection: false,
    dynamic: Boolean(dyn),
    awaken: role === '軍事',
    apt: parseApt(apt),
    innate,
    nameKey: name,
  };
  if (tags?.length) general.tags = tags;
  return general;
}

const generals = [
  g('wushuang-caopi', '無雙曹丕', '魏', 7, '軍事', 'SASCC', 1),
  g('sp-xunyu', 'SP荀彧', '魏', 7, '軍事', 'SBAAC', 1),
  g('jiaxu', '賈詡', '魏', 7, '軍事', 'SASCA', 1),
  g('simayi', '司馬懿', '魏', 7, '軍事', 'ASASA', 1, '鷹視狼顧'),
  g('caocao', '曹操', '魏', 7, '軍事', 'SSAAB', 1, '亂世奸雄'),
  g('zhangliao', '張遼', '魏', 7, '軍事', 'SABSB', 1, '陷陣之志'),
  g('sp-guanyu', 'SP關羽', '蜀', 7, '軍事', 'SACSC', 1),
  g('liubei', '劉備', '蜀', 7, '軍事', 'SSAAC', 1, '仁德載世'),
  g('pangtong', '龐統', '蜀', 7, '軍事', 'CBSAB', 1),
  g('machao', '馬超', '蜀', 7, '軍事', 'SBBSB', 1),
  g('zhugeliang', '諸葛亮', '蜀', 7, '軍事', 'CBSSS', 1, '神機妙算'),
  g('guanyu', '關羽', '蜀', 7, '軍事', 'SACSC', 1, '威震華夏'),
  g('sp-sunjian', 'SP孫堅', '吳', 7, '軍事', 'ASSAC', 1),
  g('sp-lvmeng', 'SP呂蒙', '吳', 7, '軍事', 'BBSSS', 1),
  g('sunshangxiang', '孫尚香', '吳', 7, '軍事', 'SBSAC', 1, '梟姬'),
  g('zhanghong', '張紘', '吳', 7, '內政', 'CCBCA', 0),
  g('zhangzhao', '張昭', '吳', 7, '內政', 'CCCBC', 0),
  g('luxun', '陸遜', '吳', 7, '軍事', 'CBSAA', 1),
  g('wushuang-lvlingqi', '無雙呂玲綺', '群', 7, '軍事', 'SBSAC', 1),
  g('sp-machao', 'SP馬超', '群', 7, '軍事', 'SBBSB', 1),
  g('sp-yuanshao', 'SP袁紹', '群', 7, '軍事', 'BASBS', 1),
  g('menghuo', '孟獲', '群', 7, '軍事', 'SSBAC', 1),
  g('yuji', '于吉', '群', 7, '軍事', 'CBCCC', 1),
  g('dongzhuo', '董卓', '群', 7, '軍事', 'ASSBC', 1),
  g('lvbu', '呂布', '群', 7, '軍事', 'SBSAC', 1),
  g('sp-lejin', 'SP樂進', '魏', 6, '軍事', 'SABSS', 1),
  g('sp-dianwei', 'SP典韋', '魏', 6, '軍事', 'ASCAC', 1),
  g('sp-xuchu', 'SP許褚', '魏', 6, '軍事', 'ASBSC', 1),
  g('sp-caozhen', 'SP曹真', '魏', 6, '軍事', 'SSBAC', 1),
  g('sp-liuye', 'SP劉曄', '魏', 6, '軍事', 'SCSBS', 1),
  g('sp-pangde', 'SP龐德', '魏', 6, '軍事', 'ABSBB', 1),
  g('sp-guojia', 'SP郭嘉', '魏', 6, '軍事', 'SAABB', 1),
  g('majun', '馬鈞', '魏', 6, '內政', 'CCCCS', 0),
  g('wangyi', '王異', '魏', 6, '軍事', 'ABSCB', 1),
  g('chenqun', '陳群', '魏', 6, '內政', 'CBBCC', 0),
  g('caozhi', '曹植', '魏', 6, '內政', 'BBCCB', 0),
  g('xuchu', '許褚', '魏', 6, '軍事', 'ASBSC', 1),
  g('zhanghe', '張郃', '魏', 6, '軍事', 'ASBSA', 1),
  g('haozhao', '郝昭', '魏', 6, '軍事', 'BSABS', 1),
  g('caoren', '曹仁', '魏', 6, '軍事', 'ASBAC', 1),
  g('zhenji', '甄姬', '魏', 6, '內政', 'BBCCB', 0),
  g('chengyu', '程昱', '魏', 6, '軍事', 'SCACA', 1),
  g('xunyu', '荀彧', '魏', 6, '內政', 'CCBCC', 0),
  g('xunyou', '荀攸', '魏', 6, '軍事', 'SBSCB', 1),
  g('dianwei', '典韋', '魏', 6, '軍事', 'ASCAC', 1),
  g('xuhuang', '徐晃', '魏', 6, '軍事', 'ASCAB', 1),
  g('xiahoudun', '夏侯惇', '魏', 6, '軍事', 'SACAB', 1),
  g('zhonghui', '鍾會', '魏', 6, '軍事', 'ABSAA', 1),
  g('wushuang-xingcai', '無雙星彩', '蜀', 6, '軍事', 'BSCSB', 1),
  g('wushuang-guanping', '無雙關平', '蜀', 6, '軍事', 'SACSC', 1),
  g('sp-huangzhong', 'SP黃忠', '蜀', 6, '軍事', 'ASSAC', 1),
  g('sp-fazheng', 'SP法正', '蜀', 6, '軍事', 'BSAAA', 1),
  g('sp-zhugeliang', 'SP諸葛亮', '蜀', 6, '軍事', 'CBSSS', 1),
  g('yiji', '伊籍', '蜀', 6, '軍事', 'SBBAC', 1),
  g('yanyan', '嚴顏', '蜀', 6, '軍事', 'BASAB', 1),
  g('zhangbao', '張苞', '蜀', 6, '軍事', 'AABSC', 1),
  g('guanxing', '關興', '蜀', 6, '軍事', 'AABSC', 1),
  g('madai', '馬岱', '蜀', 6, '軍事', 'SSBAB', 1),
  g('guanyinping', '關銀屏', '蜀', 6, '軍事', 'SBCSC', 1),
  g('mayunlu', '馬雲祿', '蜀', 6, '軍事', 'SCBAC', 1),
  g('chendao', '陳到', '蜀', 6, '軍事', 'CBBSB', 1),
  g('jiangwei', '姜維', '蜀', 6, '軍事', 'SASAC', 1),
  g('weiyan', '魏延', '蜀', 6, '軍事', 'ASBSC', 1),
  g('huangzhong', '黃忠', '蜀', 6, '軍事', 'ASSAC', 1),
  g('zhaoyun', '趙雲', '蜀', 6, '軍事', 'SAASC', 1, '一身是膽'),
  g('zhangfei', '張飛', '蜀', 6, '軍事', 'ASCSC', 1, '萬夫莫敵'),
  g('wushuang-daqiao', '無雙大喬', '吳', 6, '軍事', 'ACSAC', 1),
  g('wushuang-zhuran', '無雙朱然', '吳', 6, '軍事', 'BBSAB', 1),
  g('sp-bulianshi', 'SP步練師', '吳', 6, '軍事', 'CCSCA', 1),
  g('sp-zhouyu', 'SP周瑜', '吳', 6, '軍事', 'BASAC', 1),
  g('mazhong', '馬忠', '吳', 6, '軍事', 'CASAA', 1),
  g('lingtong', '凌統', '吳', 6, '軍事', 'SACAC', 1),
  g('lusu', '魯肅', '吳', 6, '軍事', 'BASAA', 1),
  g('sunquan', '孫權', '吳', 6, '軍事', 'SBSAC', 1),
  g('ganning', '甘寧', '吳', 6, '軍事', 'AASSS', 1),
  g('zhoutai', '周泰', '吳', 6, '軍事', 'SSAAC', 1),
  g('lvmeng', '呂蒙', '吳', 6, '軍事', 'BBSSS', 1),
  g('taishici', '太史慈', '吳', 6, '軍事', 'SCSBC', 1),
  g('sunjian', '孫堅', '吳', 6, '軍事', 'ASSAC', 1),
  g('lukang', '陸抗', '吳', 6, '軍事', 'ABSAS', 1),
  g('zhouyu', '周瑜', '吳', 6, '軍事', 'BASAC', 1),
  g('sp-luzhi', 'SP盧植', '群', 6, '軍事', 'BCSBS', 1),
  g('sp-diaochan', 'SP貂蟬', '群', 6, '軍事', 'BCSCC', 1),
  g('sp-dongzhuo', 'SP董卓', '群', 6, '軍事', 'ASSBC', 1),
  g('sp-zhangbao', 'SP張寶', '群', 6, '軍事', 'BSAAS', 1),
  g('sp-huangfusong', 'SP皇甫嵩', '群', 6, '軍事', 'AAASS', 1),
  g('sp-zhujun', 'SP朱儁', '群', 6, '軍事', 'CBSBA', 1),
  g('quyi', '麴義', '群', 6, '軍事', 'BCSCB', 1),
  g('xuyou', '許攸', '群', 6, '軍事', 'AAAAC', 1),
  g('caiyong', '蔡邕', '群', 6, '內政', 'CCBCC', 0),
  g('duosi', '朵思大王', '群', 6, '軍事', 'SSACC', 1),
  g('jushou', '沮授', '群', 6, '軍事', 'BSSAA', 1),
  g('yuanshu', '袁術', '群', 6, '軍事', 'SBSBC', 1),
  g('tianfeng', '田豐', '群', 6, '軍事', 'ASBAA', 1),
  g('lvlingqi', '呂玲綺', '群', 6, '軍事', 'SBSAC', 1),
  g('zhurong', '祝融夫人', '群', 6, '軍事', 'SAAAC', 1),
  g('wutugu', '兀突骨', '群', 6, '軍事', 'SSCBC', 1),
  g('gongsunzan', '公孫瓚', '群', 6, '軍事', 'SCSCB', 1),
  g('yuanshao', '袁紹', '群', 6, '軍事', 'BASBS', 1),
  g('zhangjiao', '張角', '群', 6, '軍事', 'ASSBA', 1),
  g('wushuang-zhenji', '無雙甄姬', '魏', 5, '軍事', 'SBSBC', 1),
  g('manchong', '滿寵', '魏', 5, '軍事', 'ASABA', 1),
  g('wangshuang', '王雙', '魏', 5, '軍事', 'ASCAB', 1),
  g('wangyuanji', '王元姬', '魏', 5, '軍事', 'ABASB', 1),
  g('caochun', '曹純', '魏', 5, '軍事', 'SCBBC', 1),
  g('yujin', '于禁', '魏', 5, '軍事', 'ASBAC', 1),
  g('lejin', '樂進', '魏', 5, '軍事', 'SABSS', 1),
  g('dengai', '鄧艾', '魏', 5, '軍事', 'ABASS', 1),
  g('xiahouyuan', '夏侯淵', '魏', 5, '軍事', 'SBSBA', 1),
  g('pangde', '龐德', '魏', 5, '軍事', 'ABSBB', 1),
  g('guojia', '郭嘉', '魏', 5, '軍事', 'SAABB', 1),
  g('jiangwan', '蔣琬', '蜀', 5, '內政', 'BCSCS', 0),
  g('wangping', '王平', '蜀', 5, '軍事', 'BBSCC', 1),
  g('xushu', '徐庶', '蜀', 5, '軍事', 'SBABB', 1),
  g('wushuang-xiaoqiao', '無雙小喬', '吳', 5, '軍事', 'BCAAC', 1),
  g('huanggai', '黃蓋', '吳', 5, '軍事', 'BASAB', 1),
  g('chengpu', '程普', '吳', 5, '軍事', 'BAASB', 1),
  g('sunce', '孫策', '吳', 5, '軍事', 'SBASA', 1),
  g('sp-zhangliang', 'SP張梁', '群', 5, '軍事', 'BABSA', 1),
  g('zhangrang', '張讓', '群', 5, '軍事', 'CSABB', 1),
  g('gaolan', '高覽', '群', 5, '軍事', 'AABSC', 1),
  g('muludawang', '木鹿大王', '群', 5, '軍事', 'SCCAC', 1),
  g('liru', '李儒', '群', 5, '軍事', 'SBABB', 1),
  g('gaoshun', '高順', '群', 5, '軍事', 'CSBCS', 1),
  g('mateng', '馬騰', '群', 5, '軍事', 'SCBCC', 1),
  g('wenchou', '文醜', '群', 5, '軍事', 'AASAC', 1),
  g('huaxiong', '華雄', '群', 5, '軍事', 'SBBAC', 1),
  g('yanliang', '顏良', '群', 5, '軍事', 'AABSC', 1),
  g('huatuo', '華佗', '群', 5, '軍事', 'CCCCC', 1),
  g('zuoci', '左慈', '群', 5, '軍事', 'CCCCC', 1),
  g('caopi', '曹丕', '魏', 4, '軍事', 'AASCC', 1),
  g('sp-huangyueying', 'SP黃月英', '蜀', 4, '軍事', 'CCCCS', 1),
  g('zhangshi', '張氏', '蜀', 4, '軍事', 'ABBSC', 1),
  g('huangyueying', '黃月英', '蜀', 4, '軍事', 'CCCCS', 1),
  g('fazheng', '法正', '蜀', 4, '軍事', 'BSAAA', 1),
  g('zhugege', '諸葛恪', '吳', 4, '軍事', 'CCASA', 1),
  g('daqiao', '大喬', '吳', 4, '軍事', 'CCBCC', 1),
  g('diaochan', '貂蟬', '群', 4, '軍事', 'BCBCC', 1),
  g('chengong', '陳宮', '群', 4, '軍事', 'ABSAA', 1),
  g('simahui', '司馬徽', '群', 4, '內政', 'CCBCC', 0),
  g('zhangchunhua', '張春華', '魏', 3, '軍事', 'AAACB', 1),
  g('xiaoqiao', '小喬', '吳', 3, '軍事', 'CCBCC', 1),
  g('zoushi', '鄒氏', '群', 3, '內政', 'CBCCC', 0),
  g('dongbai', '董白', '群', 3, '軍事', 'CCCBC', 1),
  g('caiwenji', '蔡文姬', '群', 3, '軍事', 'BCCCC', 1),
  // 英雄命示都尉。拜師才決定陣營，名冊預設群。適性未知，暫以全 A 佔位。統御記基礎 7。
  g('duwei-shenheng', '沈姮', '群', 7, '軍事', 'AAAAA', 0, '風焰相形', ['都尉']),
  g('duwei-qinxi', '秦溪', '群', 7, '軍事', 'AAAAA', 0, '先聲奪人', ['都尉']),
  g('duwei-liuqin', '柳沁', '群', 7, '軍事', 'AAAAA', 0, '杯弓蛇影', ['都尉']),
  g('duwei-xiaozhi', '蕭芷', '群', 7, '軍事', 'AAAAA', 0, '堅如磐石', ['都尉']),
  g('duwei-chenyi', '陳翊', '群', 7, '軍事', 'AAAAA', 0, '劍拔弩張', ['都尉']),
  g('duwei-zhoushao', '周劭', '群', 7, '軍事', 'AAAAA', 0, '流雲千變', ['都尉']),
  g('duwei-chenxi', '陳熙', '群', 7, '軍事', 'AAAAA', 0, '針鋒相對', ['都尉']),
  g('duwei-suxin', '蘇信', '群', 7, '軍事', 'AAAAA', 0, '技高一籌', ['都尉']),
  g('duwei-huangfuhong', '皇甫宏', '群', 7, '軍事', 'AAAAA', 0, '破釜沉舟', ['都尉']),
  g('duwei-xuyan', '徐彥', '群', 7, '軍事', 'AAAAA', 0, '緩兵之計', ['都尉']),
  g('duwei-yangqi', '楊琪', '群', 7, '軍事', 'AAAAA', 0, '愈戰愈勇', ['都尉']),
  g('duwei-machan', '馬禪', '群', 7, '軍事', 'AAAAA', 0, '運籌帷幄', ['都尉']),
];

const ids = new Set();
for (const general of generals) {
  if (ids.has(general.id)) throw new Error(`dup ${general.id}`);
  ids.add(general.id);
}

const TACTIC_TYPES = ['指揮', '主動', '突擊', '被動', '兵種', '陣法', '內政'];
const TACTIC_SOURCES = ['傳承', '事件', '自帶', '賽季'];

function t(row) {
  if (row.rank !== 'S' && row.rank !== 'A') throw new Error(`rank ${row.id}`);
  if (!TACTIC_TYPES.includes(row.type)) throw new Error(`type ${row.id}`);
  if (!TACTIC_SOURCES.includes(row.source)) throw new Error(`source ${row.id}`);
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    source: row.source,
    from: row.from,
    troops: row.troops,
    copies: 1,
    orange: true,
    rank: row.rank,
    desc: row.desc,
  };
}

function extra(id, name, type, source, from, troops, desc) {
  return { id, name, type, source, from, troops, rank: 'S', desc };
}

const extraTactics = [
  extra('fengyan', '風焰相形', '指揮', '自帶', ['duwei-shenheng'], null, '成功發動主動或突擊戰法時，有機率治療我軍單體，並有較高機率立刻再施放一次；再次發動無需準備與冷卻。'),
  extra('xiansheng', '先聲奪人', '指揮', '自帶', ['duwei-qinxi'], null, '偷取敵軍武力最高者的武力與速度給我軍武力最高者，並偷取智力最高者的智力與統率給我軍智力最高者。可疊加，持續兩回合。'),
  extra('beigong', '杯弓蛇影', '指揮', '自帶', ['duwei-liuqin'], null, '戰鬥前數回合降低敵軍全體戰鬥屬性；中後段並有機率使敵軍群體陷入恐懼，造成傷害或施加控制時可能失敗。'),
  extra('jianru', '堅如磐石', '指揮', '自帶', ['duwei-xiaozhi'], null, '每回合依統率差對敵軍單體造成無視防禦的傷害，並將一部分轉為可抵擋傷害的俘兵，隨機施放數次。'),
  extra('jianba', '劍拔弩張', '指揮', '自帶', ['duwei-chenyi'], null, '友軍受傷時有機率對敵軍單體反打，每名武將每回合次數有限；我軍統率最高者被控制時，還會對敵軍全體造成傷害。'),
  extra('liuyun', '流雲千變', '主動', '自帶', ['duwei-zhoushao'], null, '隨機施放因利制權、坐守孤城、淨化、智計、料事如神、杯蛇鬼車其中一項的滿級效果，可執行一到兩次，無需準備與冷卻。'),
  extra('zhenfeng', '針鋒相對', '指揮', '自帶', ['duwei-chenxi'], null, '自身無法造成傷害。第二回合起，友軍受到普通攻擊後有機率發動反擊，且可觸發普通攻擊類效果。'),
  extra('jigao', '技高一籌', '指揮', '自帶', ['duwei-suxin'], null, '敵軍發動主動戰法時，我軍智力最高者有機率打出謀略反擊；發動突擊戰法時，武力最高者有機率打出兵刃反擊。'),
  extra('pofu', '破釜沉舟', '指揮', '自帶', ['duwei-huangfuhong'], null, '使我軍統率最高者減傷，並有較高機率嘲諷敵軍全體；偶數回合還有機率治療該武將。'),
  extra('huanbing', '緩兵之計', '主動', '自帶', ['duwei-xuyan'], null, '對敵我隨機武將多次施加抵御。落到我軍則降低受到的傷害，落到敵軍則降低其造成的傷害，持續一回合。'),
  extra('yuzhan', '愈戰愈勇', '指揮', '自帶', ['duwei-yangqi'], null, '我軍發動主動戰法後有機率提高戰鬥屬性，可疊加到戰鬥結束；累積觸發數次後治療我軍全體。'),
  extra('yunwei', '運籌帷幄', '指揮', '自帶', ['duwei-machan'], null, '戰鬥前數回合降低友軍受到的傷害，並賦予急救，受傷時有機率依智力獲得治療。'),
  extra('huijun', '麾軍結陣', '指揮', '事件', [], null, '前四回合提高攜帶者主動戰法的發動率，第五回合造成傷害並治療。'),
  extra('yanren', '燕人咆哮', '被動', '自帶', ['zhangfei'], null, '第二、四回合對敵軍全體造成兵刃傷害；目標處於繳械或計窮時降低統率。自身為主將時，第六回合再打一輪。'),
  extra('jiangtian', '江天長焰', '指揮', '自帶', ['sp-zhouyu'], null, '每回合對敵軍施加長焰，提高其受到的謀略傷害，並造成謀略傷害。自身為主將時，長焰夠多有機率再打一次。'),
  extra('huoshao', '火燒連營', '主動', '自帶', ['luxun'], null, '對敵軍群體造成謀略傷害並施加灼燒；目標已在灼燒時傷害更高。'),
  extra('weiwu', '威武並昭', '突擊', '自帶', ['sp-machao'], null, '普通攻擊後對敵軍單體造成兵刃傷害，並降低目標統率。'),
  extra('fuwei', '扶危定傾', '指揮', '自帶', ['sp-huangfusong'], null, '援護我軍承受一部分傷害，受到普通攻擊時反擊，並以休整回復兵力。'),
  extra('aoni', '傲睨王侯', '指揮', '自帶', ['xuyou'], null, '偷取敵軍屬性，轉為我軍的持續增益。'),
  extra('shenmou', '深謀遠慮', '指揮', '傳承', ['sp-bulianshi'], ['弓', '器械'], '將我軍主將的普通攻擊轉為謀略傷害，造成謀略傷害時治療我軍單體。僅弓兵與器械。'),
  extra('gangrou-ji', '剛柔並濟', '指揮', '傳承', ['sp-dongzhuo'], ['弓', '器械'], '降低我軍兵力最低者受到的傷害，並壓低敵軍兵力最高者的輸出。僅弓兵與器械。'),
  extra('tuo-duohun', '拓·奪魂挾魄', '主動', '賽季', [], null, '英雄命示賽季商店的奪魂挾魄拓本，每輪最多可購兩項。沿用原戰法：偷取敵軍屬性，此消彼長。'),
  extra('tuo-shibie', '拓·士別三日', '被動', '賽季', [], null, '英雄命示賽季商店的士別三日拓本，每輪最多可購兩項。沿用原戰法：前三回合無法普通攻擊但有機率規避，第四回合提高智力並對敵軍全體造成謀略傷害。'),
  extra('tuo-yibao', '拓·以暴制暴', '主動', '賽季', [], null, '英雄命示賽季商店的以暴制暴拓本，每輪最多可購兩項。與原戰法分開登記，具體係數以遊戲內為準。'),
  extra('tuo-jifeng', '拓·疾風驟雨', '主動', '賽季', [], null, '英雄命示賽季商店的疾風驟雨拓本，每輪最多可購兩項。與原戰法分開登記，具體係數以遊戲內為準。'),
  extra('jing-yulin', '精·魚鱗陣', '陣法', '賽季', [], null, '英雄命示賽季商店的魚鱗陣精進版，每輪最多可購兩項。提升統率，並有機會獲得抵御或治療。具體係數以遊戲內為準。'),
  extra('jing-fengshi', '精·鋒矢陣', '陣法', '賽季', [], ['騎', '盾', '槍'], '英雄命示賽季商店的鋒矢陣精進版，每輪最多可購兩項。沿用原戰法：主將傷害提高也更易受傷，副將傷害下降但更耐打。'),
];

const tactics = [...tacticRows.map(t), ...extraTactics.map(t)];


const tacticIds = new Set();
for (const tactic of tactics) {
  if (tacticIds.has(tactic.id)) throw new Error(`dup tactic ${tactic.id}`);
  tacticIds.add(tactic.id);
  for (const fromId of tactic.from) {
    if (!ids.has(fromId)) throw new Error(`missing general ${fromId} for ${tactic.id}`);
  }
}

const node = (id, name, desc) => ({ id, name, desc });

const bingshu = {
  catalogVersion: VERSION,
  branches: [
    {
      id: 'zuozhan',
      name: '作戰',
      blurb: '普通攻擊與突擊',
      primary: [
        node('yigu', '一鼓作氣', '提高普通攻擊與突擊戰法傷害。'),
        node('buyong', '不勇則死', '戰鬥拖長後，有機會打出普通攻擊連擊。'),
        node('qizheng', '奇正相生', '謀略武將帶突擊時，強化那段傷害。'),
        node('manyong', '蠻勇非勇', '提高智力。'),
        node('shengyi', '勝而益強', '造成傷害時有機會回復兵力。'),
      ],
      secondary: [
        node('shengzhan', '勝戰', '第二回合無視對方一部分防禦。'),
        node('zhirui', '執銳', '穩定提高造成的傷害。'),
        node('wentao', '文韜', '偏向智力輸出的加成。'),
        node('wulue', '武略', '提高普通攻擊傷害。'),
        node('cangdao', '藏刀', '略降傷害，換突擊更容易發動。'),
        node('fenxian', '分險', '輔助型突擊的加成。'),
      ],
    },
    {
      id: 'xushi',
      name: '虛實',
      blurb: '主動戰法',
      primary: [
        node('mouding', '謀定後動', '不需準備的主動多等一回合，該次傷害大增。'),
        node('houfa', '後發先至', '縮短需要準備的主動戰法。'),
        node('jizhan', '疾戰突圍', '有機會跳過準備、直接打出。'),
        node('yizhi', '以治擊亂', '打控制中的目標時傷害提高。'),
        node('gongqi', '攻其不備', '通用的主動傷害強化。'),
        node('shunying', '順應天時', '有機會把負面狀態變得更有利。'),
        node('damou', '大謀不謀', '高發動率的主動戰法更容易打滿。'),
      ],
      secondary: [
        node('guimou', '鬼謀', '提高主動戰法傷害。'),
        node('miaosuan', '妙算', '控制生效後有機會追加傷害。'),
        node('jiangwei-book', '將威', '提高會心與奇謀出現率。'),
        node('shenji', '神機', '提高速度，主動更早出手。'),
        node('zhanbu', '占卜', '略為提高一項防禦。'),
        node('hebian', '合變', '略為提高另一項防禦。'),
      ],
    },
    {
      id: 'junxing',
      name: '軍形',
      blurb: '承傷與反擊',
      primary: [
        node('yanzhen', '嚴陣以待', '開局降低受到的傷害。'),
        node('xibing', '惜兵愛民', '受傷時有機會回復兵力。'),
        node('biqi', '避其銳氣', '主將在開局有機會閃避大量傷害。'),
        node('sanli', '三里而還', '中段回合獲得反擊。'),
        node('shoudao', '守而有道', '降低受到的謀略傷害。'),
        node('wuzhan', '無戰而勝', '受到攻擊時有機會反彈壓力。'),
      ],
      secondary: [
        node('shoushi', '守勢', '前三回合減傷。'),
        node('tiejia', '鐵甲', '降低突擊與普通攻擊造成的傷害。'),
        node('jingxin', '靜心', '降低受到的謀略傷害。'),
        node('fangbei', '防備', '全程略為減傷，適合持久。'),
        node('gangrou', '剛柔', '受到治療時治療量提高。'),
        node('yongyi', '勇毅', '面對特定兵種時減傷更多。'),
      ],
    },
    {
      id: 'jiubian',
      name: '九變',
      blurb: '治療與輔助',
      primary: [
        node('lindi', '臨敵不亂', '有機會解除灼燒、震懾等控制。'),
        node('wugong', '無功而勵', '自己被控制時回復兵力。'),
        node('shiruo', '示敵以弱', '前期少打一點，之後主動更容易發動。'),
        node('yuanqi', '援其必攻', '治療殘血友軍時，額外給減傷。'),
        node('fenji', '分而疾戰', '速度較高時，降低自己受到的傷害。'),
        node('youdi', '誘敵之策', '把敵軍的輸出引到較不痛的位置。'),
      ],
      secondary: [
        node('yanxu', '掩虛', '降低受到的謀略爆發。'),
        node('jiuzhu', '救主', '主將更安全，適配鋒矢一類陣法。'),
        node('suzhan', '速戰', '提高速度。'),
        node('baizhan', '百戰', '自帶主動發動率偏低時更好發動。'),
        node('chiyuan', '馳援', '治療或援護友軍的收益提高。'),
        node('lijun', '勵軍', '隨機提高一名友軍的傷害。'),
      ],
    },
    {
      id: 'shiji',
      name: '始計',
      blurb: '續航與屬性',
      primary: [
        node('dongruo', '洞若觀火', '受到降屬性時有機會免疫。'),
        node('leshan', '樂善好施', '治療有機會大幅提高。'),
        node('zhenge', '枕戈坐甲', '中段回合有機會獲得抵御。'),
        node('sanjun', '三軍之眾', '中段回合獲得急救。'),
        node('shenqing', '神清氣淨', '累積受到控制後，清除我軍一人的負面。'),
        node('yingji', '應機立斷', '每回合第一次傷害提高。'),
      ],
      secondary: [
        node('jiuzhan', '久戰', '獲得少量攻心與倒戈。'),
        node('yuanmou', '遠謀', '提高持續傷害。'),
        node('ruili', '銳利', '略微提高突擊發動率。'),
        node('guixin', '歸心', '略微提高準備戰法發動率。'),
        node('chuilian', '錘煉', '降低受到的持續傷害。'),
        node('tongjun', '統軍', '提高統率。'),
      ],
    },
    {
      id: 'yongjian',
      name: '用間',
      blurb: '特化取捨',
      primary: [
        node('shenshi', '審時度勢', '自己更易受傷，但治療明顯提高。'),
        node('bingxing', '兵行詭道', '第二回合大幅壓低一名敵我的輸出。'),
        node('yizhi-bao', '以直報怨', '被控制時有機會反打兵刃傷害。'),
        node('yitui', '以退為進', '先減傷，之後每回合逐漸更易受傷。'),
        node('qianli', '千里疾行', '大幅降低武力智力，換突擊更容易發動。'),
        node('chuqi', '出奇制勝', '壓低一般傷害，換自帶主動更容易發動。'),
      ],
      secondary: [
        node('kaihe', '開闔', '成功發動主動後，短時間減傷。'),
        node('xianzi', '仙姿', '依魅力提高武力與智力。'),
        node('chizhong', '持重', '中後段免疫混亂。'),
        node('jingzhun', '精準', '第二、三回合獲得必中。'),
        node('shanzhan', '善戰', '每次造成傷害後，傷害略微提高，可疊加。'),
        node('fenli', '分利', '受到兵刃或謀略傷害後，分別提高統率或智力。'),
      ],
    },
  ],
};

const meta = {
  catalogVersion: VERSION,
  updated: '2026-09-26',
  scope: '戰鬥類 S 級收到兗州之戰的公開清冊，並補上已核對的後續事件戰法；A 級只收已核對類型的常用戰法。另收英雄命示都尉自帶，以及賽季商店的拓本與精進陣法。直接編輯 scripts/tactic-catalog.mjs 或本腳本的增補列後重跑建置即可擴充。',
};

writeFileSync('data/meta.json', `${JSON.stringify(meta, null, 2)}\n`);
writeFileSync('data/generals.json', `${JSON.stringify({ catalogVersion: VERSION, generals }, null, 2)}\n`);
writeFileSync('data/tactics.json', `${JSON.stringify({ catalogVersion: VERSION, tactics }, null, 2)}\n`);
writeFileSync('data/bingshu.json', `${JSON.stringify(bingshu, null, 2)}\n`);

const byCamp = {};
for (const general of generals) byCamp[general.camp] = (byCamp[general.camp] || 0) + 1;
console.log(`generals ${generals.length}`, byCamp, `tactics ${tactics.length}`);
