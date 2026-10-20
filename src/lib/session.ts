import { BASE } from '../i18n/locale'
import { api, ApiError } from './api'

/**
 * Аккаунты на сервере (/api/v2/auth). Сессия — httpOnly-кука srs_sid, из скрипта её не видно;
 * рядом сервер ставит подсказку srs_in=1, по ней статические страницы понимают, что вход есть.
 */

export interface Session {
  email: string
  name: string
  since: string
}

export type AuthError = 'exists' | 'not_found' | 'wrong_password' | 'invalid' | 'rate' | 'network'
export type AuthResult = { ok: true; session: Session } | { ok: false; error: AuthError }

export const HINT_COOKIE = 'srs_in'
export const PASSWORD_MIN = 8

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizeEmail(email))
}

/** Есть ли подсказка о входе — без запроса к серверу */
export function hasSessionHint(): boolean {
  return document.cookie.split('; ').some((c) => c.startsWith(`${HINT_COOKIE}=`))
}

const toSession = (u: { email: string; name: string; since: string }): Session => ({ email: u.email, name: u.name, since: u.since })

/** Текущий пользователь с сервера или null */
export async function getSession(): Promise<Session | null> {
  try {
    const r = await api<{ user: Session }>('/api/v2/auth/me')
    return toSession(r.user)
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  try {
    await api('/api/v2/auth/logout', { method: 'POST' })
  } catch {
    // Кука всё равно истечёт; выходим из интерфейса
  }
}

function authError(e: unknown, fallback: AuthError): AuthError {
  if (!(e instanceof ApiError)) return 'network'
  if (e.status === 409) return 'exists'
  if (e.status === 429) return 'rate'
  if (e.code === 'no_account') return 'not_found'
  if (e.code === 'wrong_password') return 'wrong_password'
  if (e.status === 400) return 'invalid'
  return fallback
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  try {
    const r = await api<{ user: Session }>('/api/v2/auth/register', { method: 'POST', body: { name: input.name.trim(), email: normalizeEmail(input.email), password: input.password } })
    return { ok: true, session: toSession(r.user) }
  } catch (e) {
    return { ok: false, error: authError(e, 'invalid') }
  }
}

export async function signIn(input: { email: string; password: string; remember: boolean }): Promise<AuthResult> {
  try {
    const r = await api<{ user: Session }>('/api/v2/auth/login', { method: 'POST', body: { email: normalizeEmail(input.email), password: input.password } })
    return { ok: true, session: toSession(r.user) }
  } catch (e) {
    return { ok: false, error: authError(e, 'wrong_password') }
  }
}

/** Куда вернуться после входа: только страницы этого сайта, чтобы ?next= не уводил на чужой адрес */
export function safeNext(next: string | null, fallback: string): string {
  if (!next || !next.startsWith(BASE) || next.startsWith('//')) return fallback
  return next
}
