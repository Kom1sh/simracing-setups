import type { ApiError, ApiResult, Recommendation, RecommendationRequest } from './types'

const API_KEY = 'simracing-setups:api'
const TIMEOUT_MS = 15_000
const HEALTH_TIMEOUT_MS = 5_000
/** Боевой бэкенд на hq (docs/deploy.md); CORS открыт для GitHub Pages */
const DEFAULT_API = 'https://simracing.egorprotasov.ru'

const trim = (url: string) => url.replace(/\/+$/, '')

/** Адрес, заданный вручную: ?api=http://localhost:8000 — действует до закрытия вкладки, ?api= без значения сбрасывает */
export function customApi(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get('api')
  try {
    if (fromQuery === '') window.sessionStorage.removeItem(API_KEY)
    else if (fromQuery) window.sessionStorage.setItem(API_KEY, trim(fromQuery))
    return window.sessionStorage.getItem(API_KEY)
  } catch {
    return fromQuery ? trim(fromQuery) : null
  }
}

/** Адрес бэкенда: заданный вручную, иначе VITE_API_URL при сборке, иначе боевой */
export function apiBase(): string {
  return customApi() ?? trim((import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API)
}

/** GET /health — сервер на связи, если ответил {"status": "ok"} */
export async function checkHealth(signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/health`, { signal: AbortSignal.any([signal, AbortSignal.timeout(HEALTH_TIMEOUT_MS)]) })
    const body = (await res.json()) as { status?: unknown }
    return res.ok && body?.status === 'ok'
  } catch (e) {
    if (signal.aborted) throw e
    return false
  }
}

const isText = (v: unknown): v is string => typeof v === 'string'

function isRecommendation(r: unknown): r is Recommendation {
  const x = r as Recommendation
  return !!x && isText(x.rule_id) && isText(x.parameter) && isText(x.change_description) && isText(x.expected_effect) && (x.direction === 'increase' || x.direction === 'decrease')
}

/** 200: match с рекомендациями или no_match с сообщением; оба с request_id */
function readOk(body: unknown): ApiResult {
  const data = body as { status?: string; request_id?: unknown; recommendations?: unknown[]; message?: unknown }
  const requestId = isText(data?.request_id) ? data.request_id : null
  if (data?.status === 'no_match') return { kind: 'no_match', requestId, message: isText(data.message) ? data.message : null }
  if (data?.status !== 'match' || !Array.isArray(data.recommendations) || data.recommendations.length === 0) return { kind: 'bad_response' }
  if (!data.recommendations.every(isRecommendation)) return { kind: 'bad_response' }
  const recommendations = (data.recommendations as Recommendation[]).map((r) => ({ ...r, limitations: isText(r.limitations) ? r.limitations : '', basis: isText(r.basis) ? r.basis : '' }))
  return { kind: 'match', requestId, recommendations }
}

/** 400 по контракту: {status: 'error', error: {message, fields}}; 422 — если сработала стандартная проверка FastAPI */
function readValidation(body: unknown): ApiResult {
  const err = (body as ApiError)?.error
  if (err && isText(err.message)) {
    const fields = Object.entries(err.fields ?? {}).map(([field, message]) => ({ field, message: String(message) }))
    return { kind: 'validation', message: err.message, fields }
  }
  const detail = (body as { detail?: unknown })?.detail
  const fields = Array.isArray(detail)
    ? detail.map((d: { loc?: unknown[]; msg?: string }) => ({ field: Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : '', message: d.msg ?? '' }))
    : []
  return { kind: 'validation', message: null, fields }
}

export async function requestRecommendations(req: RecommendationRequest, signal: AbortSignal): Promise<ApiResult> {
  const base = apiBase()
  let res: Response
  try {
    res = await fetch(`${base}/api/v1/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
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
  if (res.status === 400 || res.status === 422) return readValidation(body)
  if (!res.ok) {
    const message = (body as ApiError)?.error?.message
    return { kind: 'server', status: res.status, message: isText(message) ? message : null }
  }
  return readOk(body)
}
