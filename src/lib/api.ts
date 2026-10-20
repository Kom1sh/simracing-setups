/** Запросы к своему бэкенду: тот же домен, кука сессии уходит сама. Ошибки — в формате {status: 'error', error: {...}} */

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message)
  }
}

export async function api<T = unknown>(path: string, opts: { method?: 'GET' | 'POST'; body?: unknown; signal?: AbortSignal; timeoutMs?: number } = {}): Promise<T> {
  const signals = [AbortSignal.timeout(opts.timeoutMs ?? 30_000)]
  if (opts.signal) signals.push(opts.signal)
  const res = await fetch(path, {
    method: opts.method ?? 'GET',
    credentials: 'same-origin',
    headers: opts.body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: AbortSignal.any(signals),
  })
  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // пустой или не JSON ответ
  }
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null)?.error
    throw new ApiError(res.status, err?.code ?? 'error', err?.message ?? `HTTP ${res.status}`, err?.fields ?? {})
  }
  return data as T
}
