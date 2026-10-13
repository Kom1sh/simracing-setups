import { BASE } from '../i18n/locale'

/**
 * Аккаунты и сессия без сервера: всё лежит в куках этого браузера.
 * Пароль не хранится — только PBKDF2-хэш с солью. Когда появится бэкенд с авторизацией,
 * этот модуль заменится запросами к нему, а интерфейс останется тем же.
 */

export interface Session {
  email: string
  name: string
  since: string
}

interface Account {
  email: string
  name: string
  salt: string
  hash: string
  createdAt: string
}

export type AuthError = 'exists' | 'not_found' | 'wrong_password' | 'storage' | 'crypto'
export type AuthResult = { ok: true; session: Session } | { ok: false; error: AuthError }

export const SESSION_COOKIE = 'srs_session'
const ACCOUNTS_COOKIE = 'srs_accounts'
const MONTH = 60 * 60 * 24 * 30
const YEAR = 60 * 60 * 24 * 365
const ITERATIONS = 100_000

function readCookie(name: string): string | null {
  const prefix = `${name}=`
  const hit = document.cookie.split('; ').find((c) => c.startsWith(prefix))
  return hit ? hit.slice(prefix.length) : null
}

function writeCookie(name: string, value: string, maxAge?: number) {
  const parts = [`${name}=${value}`, `Path=${BASE}`, 'SameSite=Lax']
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`)
  if (window.location.protocol === 'https:') parts.push('Secure')
  document.cookie = parts.join('; ')
}

function toBase64Url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

function encode(value: unknown): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)))
}

function decode<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(raw))) as T
  } catch {
    return null
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

export const PASSWORD_MIN = 8

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS }, key, 256)
  return toBase64Url(new Uint8Array(bits))
}

function readAccounts(): Account[] {
  const list = decode<Account[]>(readCookie(ACCOUNTS_COOKIE))
  return Array.isArray(list) ? list.filter((a) => a && typeof a.email === 'string' && typeof a.hash === 'string') : []
}

function writeAccounts(list: Account[]): boolean {
  const value = encode(list)
  writeCookie(ACCOUNTS_COOKIE, value, YEAR)
  return readCookie(ACCOUNTS_COOKIE) === value
}

function startSession(account: Account, remember: boolean): Session | null {
  const session: Session = { email: account.email, name: account.name, since: new Date().toISOString() }
  const value = encode(session)
  writeCookie(SESSION_COOKIE, value, remember ? MONTH : undefined)
  return readCookie(SESSION_COOKIE) === value ? session : null
}

export function getSession(): Session | null {
  const s = decode<Session>(readCookie(SESSION_COOKIE))
  return s && typeof s.email === 'string' && typeof s.name === 'string' ? s : null
}

export function signOut() {
  writeCookie(SESSION_COOKIE, '', 0)
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  if (!window.crypto?.subtle) return { ok: false, error: 'crypto' }
  const email = normalizeEmail(input.email)
  const accounts = readAccounts()
  if (accounts.some((a) => a.email === email)) return { ok: false, error: 'exists' }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const account: Account = {
    email,
    name: input.name.trim(),
    salt: toBase64Url(salt),
    hash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  }
  // В куку влезает около 4 КБ: если аккаунтов в браузере много, самые старые уходят
  const next = [...accounts, account]
  while (next.length > 1 && encode(next).length > 3600) next.shift()
  if (!writeAccounts(next)) return { ok: false, error: 'storage' }
  const session = startSession(account, true)
  return session ? { ok: true, session } : { ok: false, error: 'storage' }
}

export async function signIn(input: { email: string; password: string; remember: boolean }): Promise<AuthResult> {
  if (!window.crypto?.subtle) return { ok: false, error: 'crypto' }
  const account = readAccounts().find((a) => a.email === normalizeEmail(input.email))
  if (!account) return { ok: false, error: 'not_found' }
  const hash = await hashPassword(input.password, fromBase64Url(account.salt))
  if (hash !== account.hash) return { ok: false, error: 'wrong_password' }
  const session = startSession(account, input.remember)
  return session ? { ok: true, session } : { ok: false, error: 'storage' }
}

/** Куда вернуться после входа: только страницы этого сайта, чтобы ?next= не уводил на чужой адрес */
export function safeNext(next: string | null, fallback: string): string {
  if (!next || !next.startsWith(BASE) || next.startsWith('//')) return fallback
  return next
}
