#!/usr/bin/env node
// 盲测运行器：调用 agnes-2.0-flash 扮演"第一次玩的新玩家"答题。
// 每次调用无历史 = 每次都是新会话，提示词逐字一致（控制变量），可跑多轮看稳定性。
// 用法：node blindtest/run.mjs <prologue|case1|case2|case3|all> [轮数，默认1]
// 密钥：game-demo/.env.local 的 AGNES_AI_API_KEY（已 gitignore，严禁提交/严禁在 src/ 引用）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// 手工解析 .env.local（不引依赖）
const env = {}
const envPath = join(ROOT, '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/)
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2]
  }
}
const KEY = process.env.AGNES_AI_API_KEY ?? env.AGNES_AI_API_KEY
if (!KEY) {
  console.error('缺 AGNES_AI_API_KEY：写入 game-demo/.env.local（AGNES_AI_API_KEY=sk-...）')
  process.exit(1)
}

const CASES = ['prologue', 'case1', 'case2', 'case3', 'case4', 'case5', 'case6', 'case7', 'case8', 'case9']
const API = 'https://apihub.agnes-ai.com/v1/chat/completions'
const MODEL = 'agnes-2.0-flash'

const SYSTEM =
  '你是一款阴间档案复核推理游戏的第一次接触的玩家。你只知道卷面上写的东西，' +
  '禁止假设卷面之外的任何设定。严格按问卷要求的形式作答，不确定的组合也要照实列出并标低确定度。'

async function askOnce(caseId, runNo) {
  const q = readFileSync(join(__dirname, 'questions', `${caseId}.md`), 'utf8')
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        // 尾缀批次号防 API 缓存（否则同题多轮会逐字复用首轮答案，不算独立样本）
        { role: 'system', content: `${SYSTEM}（测试批次 #${runNo}-${Math.floor(Math.random() * 1e6)}）` },
        { role: 'user', content: q },
      ],
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 600)}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error(`返回无 content：${JSON.stringify(data).slice(0, 600)}`)
  return content
}

const [argCase = 'all', runsRaw = '1'] = process.argv.slice(2)
const runs = Math.max(1, Number.parseInt(runsRaw, 10) || 1)
const targets = argCase === 'all' ? CASES : [argCase]
if (!CASES.includes(targets[0])) {
  console.error(`未知案件参数：${argCase}（可选：${CASES.join(' / ')} / all）`)
  process.exit(1)
}

mkdirSync(join(__dirname, 'results'), { recursive: true })
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)

for (const c of targets) {
  for (let k = 1; k <= runs; k++) {
    process.stdout.write(`[${c}] 第 ${k}/${runs} 轮请求中…`)
    const t0 = Date.now()
    try {
      const answer = await askOnce(c, k)
      const file = join(__dirname, 'results', `${c}-run${k}-${ts}.md`)
      const header =
        `# 盲测答卷 · ${c} · 第${k}轮\n\n` +
        `> 时间：${new Date().toLocaleString('zh-CN')} · 模型：${MODEL} · 耗时：${((Date.now() - t0) / 1000).toFixed(0)}s\n` +
        `> 阅卷对照：blindtest/answers.md\n\n---\n\n`
      writeFileSync(file, header + answer + '\n')
      console.log(` 完成 → ${file}（${answer.length} 字）`)
    } catch (err) {
      console.log(` 失败：${err.message}`)
      process.exitCode = 1
    }
  }
}
console.log('全部完成。请把 results/ 下的答卷交给阅卷人（AI）对照 answers.md 打分。')
