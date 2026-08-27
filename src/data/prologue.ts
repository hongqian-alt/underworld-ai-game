import type { CaseData } from '../engine/types'

export const PROLOGUE: CaseData = {
  id: 'prologue',
  title: '受理编号 辛-4771 · 误捕复核',
  brief:
    '新鬼 沈砚，书吏，殁年四十一。原判：七月初三子时，溺亡于城西漕河，判入轮回。' +
    '家属申诉：其不识水性，从未夜行。依《误捕补偿例》复核。\n\n' +
    '（信息科按语：此类小案归入积压批次，历来派给新来的复核吏。卷宗堆到了房梁，总得有人翻——这次轮到你。）', // 待人工终审（2026-08-27 用户指出主角非身居高位，此为弱模型初稿）
  epilogue:
    '沈砚的记录改回了六月初九。他朝你作了个揖，转身走进轮回的白雾里。\n' +
    '你没有告诉他：修正他的案卷时，系统在另一页悄悄记了一笔——"信息科，又修正一起。"\n' +
    '那行字的墨色，比别的字都新。',
  statements: [
    {
      id: 'doc_judgment',
      source: 'document',
      label: '原判文书',
      text: '"沈砚，七月初三子时溺亡于漕河，判入轮回。"朱印完好，笔迹工整。',
    },
    {
      id: 'grey_tombstone',
      source: 'greytrace',
      label: '坟砖铭刻',
      text: '阳间坟砖一方，铭文："沈砚之墓，卒于六月初九。"砖是老砖，字是旧刻，没有动过的痕迹。',
    },
    {
      id: 'po_shen1',
      source: 'poread',
      label: '沈砚口述·一',
      text: '"那晚我在值房抄完最后一页，吹了灯，出门——再睁眼就在这儿了。我不记得水。我这辈子没下过水。"',
    },
    {
      id: 'po_shen2',
      source: 'poread',
      label: '沈砚口述·二',
      text: '"六月里我一直在河堤上当差，工头日日点名。七月初三那夜我没出门——灯芯都数过的，一夜三根，一根不多。"\n（他说到"灯芯"时，魂焰稳了一下。这不是编的。）', // 待人工终审（2026-08-27 盲测补对时加"七月"消歧：原"初三"有六/七月歧义）
      hidden: true,
    },
    {
      id: 'grey_ledger',
      source: 'greytrace',
      label: '漕河水志',
      text: '当夜水志："七月初三，闸口放水，冲毁民船两艘，溺者三人。"名册：赵大、赵二、马氏。\n——没有沈砚。',
      hidden: true,
    },
    {
      id: 'po_shen3',
      source: 'poread',
      label: '沈砚口述·三',
      text: '"要说落水……我十岁那年六月确实掉过一回河，让渔翁捞起来了，喝了好几肚子水。打那以后我是真不碰水。"',
      hidden: true,
    },
    {
      id: 'doc_transfer',
      source: 'document',
      label: '判官笔录贴黄',
      text: '笔录一处贴黄补录，纸色与正文不符，"补录"二字墨色偏淡——像是后来添上去，又怕人看出来。',
      hidden: true,
    },
  ],
  pairs: [
    { id: 'p_date', a: 'doc_judgment', b: 'grey_tombstone', kind: 'system_tamper' },
    { id: 'p_water', a: 'doc_judgment', b: 'po_shen1', kind: 'memory_bias', resolver: 'po_shen2' },
    { id: 'p_old', a: 'po_shen3', b: 'grey_tombstone', kind: 'fact_update' },
    // ---- 2026-08-27 盲测补对（用户授权）：吸收"逻辑成立但引擎无对"的假阴性空间 ----
    // 判文×水志：名册无沈砚=佐证冤情（盲测 2/2 命中·中高确定度）；同时让崔钰提示#3成真
    { id: 'p_roster', a: 'doc_judgment', b: 'grey_ledger', kind: 'system_tamper' },
    // 判文×口述二："初三夜没出门"直接反驳溺亡判定（盲测 1/2 命中·高确定度）；补链=水志钉住溺者名单
    { id: 'p_night', a: 'doc_judgment', b: 'po_shen2', kind: 'memory_bias', resolver: 'grey_ledger' },
    // 口述一×口述三：同源自述前后不一（"这辈子没下过水"vs"十岁掉过河"）——最响假信号（盲测 2/2），吸收为时间错位陷阱
    { id: 'p_self', a: 'po_shen1', b: 'po_shen3', kind: 'fact_update' },
    // 口述二×坟砖：真实玩家两轮踩中的原卡点——"初三夜"实为执念错构（他六月初九已故），吸收为陷阱
    { id: 'p_shen2_tomb', a: 'po_shen2', b: 'grey_tombstone', kind: 'fact_update' },
  ],
  hints: [
    { trigger: 'start', text: '先看摆在明处的两份东西。判文的日期，和坟砖的日期，对得上吗？' },
    { trigger: 'found1', text: '口述会撒谎吗？不会。但记忆会被执念泡过——他说不记得水，你要找的是能钉住他那晚行踪的东西，不是他怕水不怕。' },
    { trigger: 'found2', text: '日期对上了，人却对不上。去翻当夜的水志名册。还有——别把十年前的旧事当成今夜的冤情，系统在看。' },
  ],
  ap: 20, // 2026-08-27 盲测补对：4个必处置对（改判12+魄读4+勘验2=18）→12不够，提到20（含2点崔钰余量）
  days: 7,
  actionsPerDay: 4,
}
