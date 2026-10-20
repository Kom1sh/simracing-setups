// Фейковый бэкенд по контракту ALE-03 (как FastAPI Родиона) — гонять фронт без Python.
// Правила — демо из src/assistant/demoRules.ts; car и track не проверяются.
//   node scripts/fake-backend.mjs [порт]        (нужен Node 23.6+ — он читает .ts сам)
//   …/ru/app/?api=http://localhost:8765
// Комментарий с «#500» вызывает внутреннюю ошибку — для проверки экрана ошибки.
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { demoRules } from '../src/assistant/demoRules.ts'

const PORT = Number(process.argv[2] ?? 8765)

const send = (res, code, body) => {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(body === null ? '' : JSON.stringify(body))
}

const invalid = (fields) => ({ status: 'error', error: { code: 'validation_error', message: 'Проверьте заполнение полей', fields } })

function validate(b) {
  const fields = {}
  if (typeof b?.car !== 'string') fields.car = 'Field required'
  if (typeof b?.track !== 'string') fields.track = 'Field required'
  if (!['understeer', 'oversteer'].includes(b?.symptom_type)) fields.symptom_type = "Input should be 'understeer' or 'oversteer'"
  if (!['entry', 'mid', 'exit'].includes(b?.corner_phase)) fields.corner_phase = "Input should be 'entry', 'mid' or 'exit'"
  const c = typeof b?.comment === 'string' ? b.comment : ''
  if (c.length < 3) fields.comment = 'String should have at least 3 characters'
  if (c.length > 500) fields.comment = 'String should have at most 500 characters'
  if (b?.stint_moment != null && !['from_start', 'after_laps'].includes(b.stint_moment)) fields.stint_moment = "Input should be 'from_start' or 'after_laps'"
  return fields
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, null)
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok' })
  if (req.method !== 'POST' || req.url !== '/api/v1/recommendations') return send(res, 404, { detail: 'Not Found' })
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return send(res, 400, invalid({ body: 'JSON decode error' }))
    }
    const fields = validate(body)
    if (Object.keys(fields).length) return send(res, 400, invalid(fields))
    if (body.comment.includes('#500')) return send(res, 500, { status: 'error', error: { code: 'internal_error', message: 'Внутренняя ошибка сервера' } })
    const request_id = randomUUID()
    const hits = demoRules.filter((r) => r.symptom === body.symptom_type && r.phase === body.corner_phase && (!r.stint || body.stint_moment == null || r.stint === body.stint_moment))
    if (hits.length === 0) return send(res, 200, { status: 'no_match', request_id, message: 'Подходящее правило не найдено.' })
    send(res, 200, {
      status: 'match',
      request_id,
      recommendations: hits.map((r) => ({
        rule_id: r.id,
        parameter: r.parameter,
        direction: r.direction,
        change_description: r.change.ru,
        expected_effect: r.effect.ru,
        limitations: r.limits.ru,
        basis: 'фейковый бэкенд фронтенда',
      })),
    })
  })
}).listen(PORT, () => console.log(`fake backend (ALE-03): http://localhost:${PORT}`))
