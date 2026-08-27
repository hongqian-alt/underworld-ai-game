import type { CaseData } from '../engine/types'

// 第二案：同名同姓（身份核验 · 三种不一致完整教学）
// 素材来源：废弃稿存档 Ch4 同名同姓（切片文档三节）
// 三种 kind 全部出现且各含可教学样本：system_tamper / memory_bias / fact_update×2
// 陈述文本为弱模型初稿，全部待人工终审（文本铁律）
export const CASE2: CaseData = {
  id: 'case2',
  title: '核验批 辛-4812 · 同名错录复核',
  brief:
    '城东有两名"陈六"：一名布商，殁年四十七；一名脚夫，殁年四十六。同年同月先后身故。\n\n' +
    '生死簿上只勾了一条"陈六"。剩下的那个陈六的家属不干了：凭什么我家的陈六成了没死的人？\n' +
    '信息科的规矩：同名同姓错录，错在簿，不在人。',
  epilogue:
    '布商陈六与脚夫陈六的记录终于分开，各自归位。\n' +
    '你合上卷宗时发现，系统给两条记录编了同一串辅号——大概是对"同名"这种事偷了懒。\n' +
    '它偷懒的每一步，都得有人替它擦。', // 待人工终审
  ap: 12,
  days: 7,
  actionsPerDay: 4,
  statements: [
    {
      id: 'doc_register',
      source: 'document',
      label: '生死簿勾录页',
      text: '生死簿载："陈六，殁于七月十二，布商。"墨迹工整。但页脚有一行小字批注：七月十九复勾"陈六"——脚夫。两条勾录叠在同一个名字上。', // 待人工终审
    },
    {
      id: 'grey_tomb2',
      source: 'greytrace',
      label: '布商陈六墓碑',
      text: '阳间坟砖："陈公六之墓，卒于七月十二。"砖刻与簿录对得上——布商陈六确实死于七月十二。', // 待人工终审
    },
    {
      id: 'po_liu1',
      source: 'poread',
      label: '脚夫陈六口述·一',
      text: '"我七月十二还在城门下等人雇脚！那天热得很，我在茶棚底下躲日头——我死那天是七月十九，发时疫死的。"' + '\n（说到时疫他的魂焰就发灰，执念泡过的时间，得拿别的东西钉。）', // 待人工终审
      hidden: true,
    },
    {
      id: 'grey_epidemic',
      source: 'greytrace',
      label: '县志时疫条',
      text: '县志载："七月十五起，城东时疫，旬日而止。"时疫始于七月十五——脚夫说"七月十二躲日头"那天，疫还没起来。他记忆的日期能对上吗？对不上。但他死的月份没错。', // 待人工终审
      hidden: true,
    },
    {
      id: 'doc_tally',
      source: 'document',
      label: '脚行雇佣流水',
      text: '脚行流水：七月十二、十三、十四，均有"陈六"受雇记录，工钱照付。七月十五以后再无陈六——脚夫陈六七月十五前后才病例倒下，十九日身故。', // 待人工终审
      hidden: true,
    },
    {
      id: 'po_liu2',
      source: 'poread',
      label: '脚夫陈六口述·二',
      text: '"跟我同名的那个布商……我知道他。他先死的，死讯传开那天茶棚里都在讲。我还想，陈六死了，人家烧纸别烧错坟头。"', // 待人工终审
      hidden: true,
    },
  ],
  pairs: [
    // 真矛盾①：系统篡改（生死簿两条勾录同串辅号 = 薄错）
    { id: 'p_book', a: 'doc_register', b: 'grey_tomb2', kind: 'system_tamper' },
    // 真矛盾②：记忆偏差（脚夫口述一日期漂移，需县志/流水补链）
    { id: 'p_worker', a: 'doc_register', b: 'po_liu1', kind: 'memory_bias', resolver: 'doc_tally' },
    // 事实更新×2（两边都对，只是错位）：布商墓碑 vs 脚行流水日期不同人不同事；口述二 vs 县志疫期
    { id: 'p_tomb2', a: 'grey_tomb2', b: 'grey_epidemic', kind: 'fact_update' },
    { id: 'p_liu2', a: 'po_liu2', b: 'grey_tomb2', kind: 'fact_update' },
  ],
  hints: [
    { trigger: 'start', text: '同名同姓案，先把两个"陈六"分开看。生死簿那页有两条勾录——先钉布商的死亡日期，那是全案的锚。' }, // 待人工终审
    { trigger: 'found1', text: '脚夫口述的日期跟簿对不上。但口述日期被执念泡过——脚行的雇佣流水能钉住他最后的日子。' }, // 待人工终审
    { trigger: 'found2', text: '剩下几组日期对不上的东西，别急着全改判。想想第一案那张修船单：有的差异只是两边都对、时间错开。' }, // 待人工终审
  ],
}
