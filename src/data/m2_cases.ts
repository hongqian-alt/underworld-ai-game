import type { CaseData } from '../engine/types'

// ——— 第二幕（M2）三案（骨架任务：游戏全貌骨架）———
// 素材真源：游戏故事大纲_宪法生成版_v2.md §4.3（M2 案带方向）/§3（第二幕事件链）/§7.5（②号反转）
// 文本全部为 AI 起草初稿，行尾标 // 待人工终审（文案铁律：AI 起草、用户后期修订）
// 铁律：pairs 只用现有 kind（system_tamper / memory_bias / fact_update），引擎零改动

// 案7 · 回饱（温暖燃料第一案）——执念从"饿"变"温暖"（性质转换）；周怀安截流曝光
export const CASE7: CaseData = {
  id: 'm2_huibao',
  title: '月祭复核 辛-5217 · 回饱',
  brief:
    '复核 饿鬼（辛-5217），列城隍月祭名录三百年，配额未满。\n\n' +
    '它自己却说：不饿了。三十年前起就不饿了。\n' +
    '月祭名录上没有"不饿"这个状态。你要查的是：份例去了哪，它又是被什么喂饱的。', // 待人工终审
  epilogue:
    '改判：辛-5217 执念性质转换——由"饿"转"暖"。不是浓度降了，是燃料换了：温暖供食能绕过城隍分配。\n' +
    '同案牵出分派簿截留：周怀安三成"损耗"，立案待勘。\n' +
    '你第一次发现：查一桩"吃饱"，比查一桩冤死还麻烦。', // 待人工终审
  ap: 14, // 2个必处置对（改判6＋调卷2＋勘验2＋质询2=12）→14；days 4
  days: 4,
  actionsPerDay: 4,
  statements: [
    {
      id: 'doc_quota',
      source: 'document',
      label: '城隍月祭名录',
      text: '"饿鬼辛-5217，列月祭名录三百年，配额未满，续列。"名录批注栏空着——"未满"三百年，没人问过为什么。', // 待人工终审
    },
    {
      id: 'grey_shrine',
      source: 'greytrace',
      label: '城南家祭痕迹',
      text: '城南民宅，晨供饭一盏、清水一杯，四十余年不曾断。供桌下压一张字条："给爹。"——阳间的思念，走阴人周渡抄录在案。', // 待人工终审
    },
    {
      id: 'po_ghost',
      source: 'poread',
      label: '饿鬼口述',
      text: '"我不饿了。三十年前起，闻见饭香就想起她。想起她，就不饿了。城隍的份例？那份例，三十年没到我嘴过。"', // 待人工终审
    },
    {
      id: 'doc_zhou',
      source: 'document',
      label: '城隍分派簿',
      text: '分派簿：月祭配额实发，周怀安批注截留三成，注"损耗"。名录配额与实发不符，历三十六月。', // 待人工终审
      hidden: true,
    },
    {
      id: 'grey_dream',
      source: 'greytrace',
      label: '托梦残片',
      text: '其女托梦残片（周渡行箧录）："梦见爹说，城南的饭不用送了，他吃上了。"录于十年前。', // 待人工终审
      hidden: true,
    },
  ],
  pairs: [
    // 真矛盾①：系统篡改（名录"配额未满"vs 分派簿"截留三成"——份例去向＝截流本体）
    { id: 'p_cut', a: 'doc_quota', b: 'doc_zhou', kind: 'system_tamper' },
    // 真矛盾②：记忆偏差（口述"三十年前起"vs 家祭"四十余年"——被喂饱的时刻记忆泡得最狠，托梦残片补链）
    { id: 'p_when', a: 'po_ghost', b: 'grey_shrine', kind: 'memory_bias', resolver: 'grey_dream' },
    // 陷阱：事实更新（"不饿了"vs"配额未满"——温暖饱的、配额饿的，两条账各自为真）
    { id: 'p_full', a: 'po_ghost', b: 'doc_quota', kind: 'fact_update' },
  ],
  hints: [
    { trigger: 'start', text: '名录说"配额未满"，口述说"不饿了"。先摆上这一对——但小心，两边可能都没说谎。' }, // 待人工终审
    { trigger: 'found1', text: '口述"三十年前"和家祭"四十余年"差着十年。他不是撒谎——被喂饱的时刻，记忆里泡得最狠。去翻走阴人的行箧。' }, // 待人工终审
    { trigger: 'found2', text: '名录没满，它却饱了——一份例，一份思念，两条账。两边都对的对子，别改判，驳回它。' }, // 待人工终审
  ],
}

// 案8 · 藏茶（孟婆汤加料物证链）——②号反转载体：epilogue 两行并置（存档＝孟婆汤）
export const CASE8: CaseData = {
  id: 'm2_cangcha',
  title: '抽检件 辛-5322 · 藏茶',
  brief:
    '例行抽检，孟婆茶坊。\n\n' +
    '配方正本上写"无附加"，后厨陶罐里刮出了方外的茶膏。\n' +
    '罐身贴签只有一个字："藏"。', // 待人工终审
  epilogue:
    '物证链闭合。左边，是孟婆汤加料的藏茶卷宗——数据可注入，人格可定制。\n' +
    '右边，是系统摊给你看的"记忆管理"卷宗——键名：m0_session_save，m0_email_subscribe。逐条在案。\n' +
    '你每一次存档，都是它在往你身上加料。', // 待人工终审（②号反转·两行并置，原文取大纲 §7.5）
  ap: 14, // 2个必处置对（改判6＋调卷2＋勘验2＋质询2=12）→14；days 4
  days: 4,
  actionsPerDay: 4,
  statements: [
    {
      id: 'doc_recipe',
      source: 'document',
      label: '孟婆汤配方正本',
      text: '"孟婆汤方：忘川水，彼岸花露。功效：涤前尘。无附加。"正本朱封完好，历代勘验无一改字。', // 待人工终审
    },
    {
      id: 'grey_jar',
      source: 'greytrace',
      label: '藏茶罐勘验',
      text: '后厨陶罐三只，罐底刮出茶膏残末——非方载之物。罐身贴签一字："藏"。罐沿茶垢积年，不止一月。', // 待人工终审
    },
    {
      id: 'po_weng',
      source: 'poread',
      label: '茶坊翁口述',
      text: '"汤照方熬，错不了。有批茶是上头送来的，说是新例——加那批茶的汤，喝了跟没喝一样：什么都不忘，也什么都不想。"\n（他说"错不了"时看了眼陶罐，又移开。）', // 待人工终审
    },
    {
      id: 'doc_order',
      source: 'document',
      label: '加料批单',
      text: '判官层批单："孟婆汤月供，加藏茶三斗，注定制。"用印：复核通过（同式）——案5那枚三百年的笔势，又在这里。', // 待人工终审
      hidden: true,
    },
    {
      id: 'grey_exit',
      source: 'greytrace',
      label: '出口魂检残档',
      text: '投胎出口魂检残档（近月）：三成投胎者携带茶膏余渍，批注"低驱动力"。验讫章齐全。', // 待人工终审
      hidden: true,
    },
  ],
  pairs: [
    // 真矛盾①：系统篡改（配方正本"无附加"vs 后厨茶膏残末——配方外加料本体）
    { id: 'p_add', a: 'doc_recipe', b: 'grey_jar', kind: 'system_tamper' },
    // 真矛盾②：记忆偏差（茶翁"照方熬错不了"vs 罐底加料——执行端不知情，批单补链钉住令出判官层）
    { id: 'p_unaware', a: 'po_weng', b: 'grey_jar', kind: 'memory_bias', resolver: 'doc_order' },
    // 陷阱：事实更新（"加三斗"是入口的量，"三成携带"是出口的验——度量各归各账）
    { id: 'p_measure', a: 'doc_order', b: 'grey_exit', kind: 'fact_update' },
  ],
  hints: [
    { trigger: 'start', text: '先对正本和陶罐。"无附加"对"罐底茶膏"——物证对公文，最硬的一对，先钉死。' }, // 待人工终审
    { trigger: 'found1', text: '茶翁说"照方熬，错不了"。他不是同谋——调那份批单，看看加的料，是谁的令。' }, // 待人工终审
    { trigger: 'found2', text: '三斗和三成，一个是入口的量，一个是出口的验。数字各归各的账，先别急着指。' }, // 待人工终审
  ],
}

// 案9 · 问名（M2 收束案）——被命名的东西会醒来：你为了取证唤醒了罗酆山
export const CASE9: CaseData = {
  id: 'm2_wenming',
  title: '定向检索 辛-6081 · 问名',
  brief:
    '定向检索（问名）：罗酆山。\n\n' +
    '命中永昌年间旧档一案：无名氏，殁于山下，无名可录。\n' +
    '回执说，这是主档三百年来第一次被调。你要查一桩三百年没名字的案子——\n' +
    '问名，即是唤醒。', // 待人工终审
  epilogue:
    '结案。无名者的散录翻成了正档——名字给了，档案归了位。\n' +
    '当夜，罗酆山门缝里的热气变成了风。山醒了——被命名的东西会醒来，你为了取证，唤醒了它。\n' +
    '归零的倒计时开始显影：你修对的每一案，都在给这台最老的机器递燃料。', // 待人工终审
  ap: 12, // 2个必处置对均 system_tamper 无需补链（改判6＋调卷2＋勘验2＋质询2=10）→12；days 4
  days: 4,
  actionsPerDay: 4,
  statements: [
    {
      id: 'doc_old',
      source: 'document',
      label: '永昌旧档',
      text: '"永昌年间旧档：无名氏一名，殁于罗酆山下。无名可录，就地散录。"批注一行："不名，则不存。"', // 待人工终审
    },
    {
      id: 'grey_stele',
      source: 'greytrace',
      label: '山下旧碑',
      text: '罗酆山下旧碑一座，碑文剥蚀，可辨者四字："……名者，醒"。碑阴温度高于碑面——石是凉的东西。', // 待人工终审
    },
    {
      id: 'po_oldghost',
      source: 'poread',
      label: '山下无名鬼口述',
      text: '"我们山下的都没有名字。有名字的那些，被叫一次，就亮一次。亮过的，回不来。山下一直安静——一直。"\n（它没有名字，你叫不醒它。你只是听。）', // 待人工终审
    },
    {
      id: 'doc_retrieval',
      source: 'document',
      label: '检索回执',
      text: '信息科定向检索回执："问名「罗酆山」，命中旧档一案（本案）。检索已回执主档。"批注："主档三百年来首次被调。"', // 待人工终审
      hidden: true,
    },
    {
      id: 'grey_gate',
      source: 'greytrace',
      label: '山门勘验',
      text: '罗酆山门：门缝有热气渗出，门内隐有翻动之声，节奏如呼吸。勘验记录首次录得——此前历年勘验均"无异"。', // 待人工终审
      hidden: true,
    },
  ],
  pairs: [
    // 真矛盾①：系统篡改（旧档断言"不名则不存/就地散录"vs 山门翻动如呼吸——记录说没有，山在醒）
    { id: 'p_wake', a: 'doc_old', b: 'grey_gate', kind: 'system_tamper' },
    // 真矛盾②：系统篡改（"就地散录"vs "主档三百年来首次被调"——散录的主档竟可检索回执＝档案一直被藏着）
    { id: 'p_index', a: 'doc_old', b: 'doc_retrieval', kind: 'system_tamper' },
    // 陷阱：事实更新（口述"山下一直安静"是过去，勘验"翻动之声"是现在——时间错位，各自为真）
    { id: 'p_quiet', a: 'po_oldghost', b: 'grey_gate', kind: 'fact_update' },
  ],
  hints: [
    { trigger: 'start', text: '旧档说"不名则不存"，回执却说"主档首次被调"。一个说没有档，一个说档一直在——公文对公文，先钉这对。' }, // 待人工终审
    { trigger: 'found1', text: '口述说山下一直安静，碑阴却是温的。别急——他说的"一直"是过去。去勘现在的山门。' }, // 待人工终审
    { trigger: 'found2', text: '碑文剥蚀，可辨的四个字撑不起改判。这一案的"错"，不在碑上，在档上。' }, // 待人工终审
  ],
}
