import type { ApiResult, Recommendation, RecommendationRequest, RecommendationResponse } from './types'
import { demoRules } from './demoRules'

const API_KEY = 'simracing-setups:api'
const TIMEOUT_MS = 15_000

/**
 * Адрес бэкенда: ?api=http://localhost:8000 (запоминается в браузере, ?api=demo сбрасывает),
 * иначе VITE_API_URL при сборке. Нет адреса — работает заглушка с демо-правилами.
 */
export function apiBase(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('api')
  try {
    if (fromQuery === 'demo') window.localStorage.removeItem(API_KEY)
    else if (fromQuery) window.localStorage.setItem(API_KEY, fromQuery)
    const stored = window.localStorage.getItem(API_KEY)
    if (stored) return stored.replace(/\/+$/, '')
  } catch {
    if (fromQuery && fromQuery !== 'demo') return fromQuery.replace(/\/+$/, '')
  }
  const env = import.meta.env.VITE_API_URL as string | undefined
  return env ? env.replace(/\/+$/, '') : null
}

function isRecommendation(r: unknown): r is Recommendation {
  const x = r as Recommendation
  return !!x && typeof x.rule_id === 'string' && typeof x.parameter === 'string' && typeof x.effect === 'string' && !!x.change && typeof x.change.amount === 'number' && Array.isArray(x.limitations)
}

function readResponse(body: unknown): ApiResult {
  const data = body as RecommendationResponse
  if (!data || (data.status !== 'found' && data.status !== 'not_found') || !Array.isArray(data.recommendations)) return { kind: 'bad_response' }
  if (!data.recommendations.every(isRecommendation)) return { kind: 'bad_response' }
  if (data.status === 'found' && data.recommendations.length > 0) return { kind: 'found', data }
  return { kind: 'not_found', data: { ...data, status: 'not_found' } }
}

/** FastAPI отдаёт 422 как {detail: [{loc: ['body', 'symptom'], msg}]} */
function readValidation(body: unknown): ApiResult {
  const detail = (body as { detail?: unknown })?.detail
  const fields = Array.isArray(detail)
    ? detail.map((d: { loc?: unknown[]; msg?: string }) => ({
        field: Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : '',
        message: d.msg ?? '',
      }))
    : [{ field: '', message: typeof detail === 'string' ? detail : '' }]
  return { kind: 'validation', fields }
}

export async function requestRecommendations(req: RecommendationRequest, signal: AbortSignal): Promise<ApiResult> {
  const base = apiBase()
  if (!base) return mockRecommendations(req, signal)
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(`${base}/api/v1/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.any([signal, timeout]),
    })
  } catch (e) {
    if (signal.aborted) throw e
    return { kind: 'network' }
  }
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    if (res.ok) return { kind: 'bad_response' }
  }
  if (res.status === 422 || res.status === 400) return readValidation(body)
  if (!res.ok) return { kind: 'server', status: res.status }
  return readResponse(body)
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = window.setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      window.clearTimeout(id)
      reject(signal.reason)
    })
  })
}

/** Заглушка: ?mock=slow — долгий ответ, ?mock=error — 500, ?mock=offline — нет сети */
export async function mockRecommendations(req: RecommendationRequest, signal: AbortSignal): Promise<ApiResult> {
  const mode = new URLSearchParams(window.location.search).get('mock')
  await wait(mode === 'slow' ? 2500 : 650, signal)
  if (mode === 'offline') return { kind: 'network' }
  if (mode === 'error') return { kind: 'server', status: 500 }
  const lang = req.locale
  const hits = demoRules.filter(
    (r) => r.symptom === req.symptom && (!r.phase || r.phase === req.corner_phase) && (!r.speed || r.speed === req.corner_speed),
  )
  const recommendations: Recommendation[] = hits.slice(0, 3).map((r) => ({
    rule_id: r.id,
    parameter: r.parameter,
    position: r.position,
    parameter_label: r.label[lang],
    change: { direction: r.direction, amount: r.amount, unit: r.unit },
    effect: r.effect[lang],
    limitations: r.limits.map((l) => l[lang]),
    explanation: r.why ? r.why[lang] : null,
    verification: 'unverified',
    source: lang === 'ru' ? 'Демо-правило фронтенда' : 'Frontend demo rule',
  }))
  return readResponse({ status: recommendations.length ? 'found' : 'not_found', recommendations, message: null })
}
