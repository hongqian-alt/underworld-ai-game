import type { CaseData } from '../engine/types'

// 第一案：三十七口箱子（积压调查 · 时钟/警戒度/驳回教学）
// 素材来源：废弃稿存档 Ch2 箱子 / Ch6 积压（切片文档三节）
// 陈述文本为弱模型初稿，全部待人工终审（文本铁律）
export const CASE1: CaseData = {
  id: 'case1',
  title: '积压批次 辛-4773 · 押运折损复核',
  brief:
    '死者 阮大椿，漕帮押运头目，殁年五十三。原判：七月初五夜押运失足，坠亡于运河闸口，判入轮回。\n\n' +
    '依《积压案清理例》，积压卷宗须在作七之内清理。这批卷宗在架上积了半年——你翻到哪算哪。',
  epilogue:
    '阮大椿的死亡记录改回了"旧疾暴亡，免于渎职追责"。他家属的抚恤按新记录重算了。\n' +
    '结案归档时，系统在卷尾盖了个章——"积压件，已清理"。\n' +
    '章印是热的。', // 待人工终审
  ap: 12,
  days: 7,
  actionsPerDay: 4,
  statements: [
    {
      id: 'doc_waybill',
      source: 'document',
      label: '押运清单存根',
      text: '"七月初五，漕帮阮姓头目押运三十七口木箱过闸，夜风骤起，失足坠河。箱货沉没大半。"存根纸角有水渍，字迹尚清晰。', // 待人工终审
    },
    {
      id: 'grey_ledger1',
      source: 'greytrace',
      label: '闸口夜值簿',
      text: '夜值簿载："七月初五戌时，闸口起风。漕帮船队过闸，无事故。"记录笔迹连续，无涂改。', // 待人工终审
    },
    {
      id: 'po_ruan1',
      source: 'poread',
      label: '阮大椿口述·一',
      text: '"箱子里装的是青瓷，官家的。那晚闸口稳得很，船都没晃。我没坠河——我记得我坐在船头抽了袋烟，然后就到这儿了。"', // 待人工终审
      hidden: true,
    },
    {
      id: 'doc_repair',
      source: 'document',
      label: '船行修船单',
      text: '七月十一，船行报修单：该船队一船"船板开裂，渗水"，入坞检修。日子在事发之后——修船是常事，但这单子被人塞进了本案卷宗。', // 待人工终审
      hidden: true,
    },
    {
      id: 'grey_cargo',
      source: 'greytrace',
      label: '闸口货栈残票',
      text: '货栈残票存根："七月初五，漕帮过闸三十七口箱，验讫，无损。"票面完好，与夜值簿同日同笔。', // 待人工终审
      hidden: true,
    },
    {
      id: 'po_ruan2',
      source: 'poread',
      label: '阮大椿口述·二',
      text: '"要说失足……我年轻时在粮船上摔断过腿，打那以后夜里行船我从不站立。那晚我在船头坐着——船工都看得见。"', // 待人工终审
      hidden: true,
    },
  ],
  pairs: [
    // 真矛盾①：系统篡改（判文说坠河溺亡 vs 夜值簿/货栈残票都说无事故）
    { id: 'p_accident', a: 'doc_waybill', b: 'grey_ledger1', kind: 'system_tamper' },
    // 真矛盾②：记忆偏差（口述一说不坠河 vs 判文；需口述二"从不站立"补链）
    { id: 'p_voyage', a: 'doc_waybill', b: 'po_ruan1', kind: 'memory_bias', resolver: 'po_ruan2' },
    // 驳回教学位：事实更新（修船单事发后属正常，不构成冤情——教玩家识别"不是所有差异都是矛盾"）
    { id: 'p_repair', a: 'doc_repair', b: 'grey_cargo', kind: 'fact_update' },
  ],
  hints: [
    { trigger: 'start', text: '先对明处的两份：押运清单和夜值簿。一个说"坠河"，一个说"无事故"——这种硬碰硬的差异，先钉死它。' }, // 待人工终审
    { trigger: 'found1', text: '口述说他没坠河，跟判文对不上。但口述要谨慎——去找能钉住他当时状态的第三条，比如他夜里的习惯。' }, // 待人工终审
    { trigger: 'found2', text: '案卷堆里有张修船单，日子在事发之后。想想：日子错开的东西，一定构成冤情吗？' }, // 待人工终审
  ],
}
