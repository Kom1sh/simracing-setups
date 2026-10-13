import { locale } from '../i18n/locale'
import type { ApiError, ApiResult, Recommendation, RecommendationRequest } from './types'
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

const isText = (v: unknown) => typeof v === 'string'

function isRecommendation(r: unknown): r is Recommendation {
  const x = r as Recommendation
  return !!x && isText(x.rule_id) && isText(x.parameter) && isText(x.change_description) && isText(x.expected_effect) && (x.direction === 'increase' || x.direction === 'decrease')
}

/** 200: match с рекомендациями или no_match с сообщением */
function readOk(body: unknown, demo: boolean): ApiResult {
  const data = body as { status?: string; recommendations?: unknown[]; message?: unknown }
  if (data?.status === 'no_match') return { kind: 'no_match', message: isText(data.message) ? (data.message as string) : null }
  if (data?.status !== 'match' || !Array.isArray(data.recommendations) || data.recommendations.length === 0) return { kind: 'bad_response' }
  if (!data.recommendations.every(isRecommendation)) return { kind: 'bad_response' }
  const recommendations = (data.recommendations as Recommendation[]).map((r) => ({ ...r, limitations: isText(r.limitations) ? r.limitations : '', basis: isText(r.basis) ? r.basis : '' }))
  return { kind: 'match', recommendations, demo }
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
  if (!base) return mockRecommendations(req, signal)
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
  return readOk(body, false)
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

/** Заглушка ведёт себя как бэкенд по контракту. ?mock=slow — долгий ответ, ?mock=error — 500, ?mock=offline — нет сети */
export async function mockRecommendations(req: RecommendationRequest, signal: AbortSignal): Promise<ApiResult> {
  const mode = new URLSearchParams(window.location.search).get('mock')
  await wait(mode === 'slow' ? 2500 : 650, signal)
  if (mode === 'offline') return { kind: 'network' }
  if (mode === 'error') return { kind: 'server', status: 500, message: 'Внутренняя ошибка сервера, попробуйте повторить запрос позже' }
  const text = req.symptom.trim()
  if (text.length < 3 || text.length > 500) {
    return readValidation({ status: 'error', error: { code: 'validation_error', message: 'Поле symptom обязательно и должно содержать от 3 до 500 символов', fields: { symptom: 'обязательное поле' } } })
  }
  const lower = text.toLowerCase()
  const hits = demoRules.filter((r) => r.keywords.every((k) => lower.includes(k)))
  if (hits.length === 0) return readOk({ status: 'no_match', message: null }, true)
  const lang = locale
  return readOk(
    {
      status: 'match',
      recommendations: hits.slice(0, 3).map((r) => ({
        rule_id: r.id,
        parameter: r.parameter[lang],
        direction: r.direction,
        change_description: r.change[lang],
        expected_effect: r.effect[lang],
        limitations: r.limits[lang],
        basis: lang === 'ru' ? 'демо-правило фронтенда, не проверено экспертом' : 'frontend demo rule, not reviewed by an expert',
      })),
    },
    true,
  )
}
