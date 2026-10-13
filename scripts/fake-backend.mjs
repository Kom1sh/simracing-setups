// Фейковый бэкенд строго по контракту техлида (api-contract.md, KIR-02) — чтобы проверять фронт
// до готовности FastAPI (ROD-01…04). Правила — демо из src/assistant/demoRules.ts, ответы по-русски.
//   node scripts/fake-backend.mjs [порт]        (нужен Node 23.6+ — он читает .ts сам)
//   …/ru/app/?api=http://localhost:8765
// Жалоба с «#500» внутри вызывает внутреннюю ошибку — для проверки экрана ошибки.
import { createServer } from 'node:http'
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

const validationError = { status: 'error', error: { code: 'validation_error', message: 'Поле symptom обязательно и должно содержать от 3 до 500 символов', fields: { symptom: 'обязательное поле' } } }

createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, null)
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok' })
  if (req.method !== 'POST' || req.url !== '/api/v1/recommendations') return send(res, 404, { status: 'error', error: { code: 'not_found', message: 'Нет такого адреса' } })
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return send(res, 400, validationError)
    }
    const symptom = typeof body?.symptom === 'string' ? body.symptom.trim() : ''
    if (symptom.length < 3 || symptom.length > 500) return send(res, 400, validationError)
    if (symptom.includes('#500')) return send(res, 500, { status: 'error', error: { code: 'internal_error', message: 'Внутренняя ошибка сервера, попробуйте повторить запрос позже' } })
    const text = symptom.toLowerCase()
    const hits = demoRules.filter((r) => r.keywords.every((k) => text.includes(k)))
    if (hits.length === 0) return send(res, 200, { status: 'no_match', message: 'Подходящее правило не найдено. Попробуйте описать жалобу точнее.' })
    send(res, 200, {
      status: 'match',
      recommendations: hits.slice(0, 3).map((r) => ({
        rule_id: r.id,
        parameter: r.parameter.ru,
        direction: r.direction,
        change_description: r.change.ru,
        expected_effect: r.effect.ru,
        limitations: r.limits.ru,
        basis: 'фейковый бэкенд фронтенда',
      })),
    })
  })
}).listen(PORT, () => console.log(`fake backend: http://localhost:${PORT}`))
