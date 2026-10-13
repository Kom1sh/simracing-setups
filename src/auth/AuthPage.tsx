import { useEffect, useId, useState, type FormEvent } from 'react'
import { at } from '../i18n/auth'
import { pagePath } from '../i18n/locale'
import { SPA } from '../data/heroTrack'
import { getSession, isValidEmail, PASSWORD_MIN, safeNext, signIn, signUp, type AuthError } from '../lib/session'

type Mode = 'login' | 'signup'
type FieldErrors = { name?: string; email?: string; password?: string }

export function AuthPage({ mode }: { mode: Mode }) {
  const isSignup = mode === 'signup'
  const ids = { name: useId(), email: useId(), password: useId(), nameHint: useId(), passHint: useId(), form: useId() }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)

  const next = safeNext(new URLSearchParams(window.location.search).get('next'), pagePath('app'))
  const otherHref = `${pagePath(isSignup ? 'login' : 'signup')}${window.location.search}`

  useEffect(() => {
    document.title = isSignup ? at.docSignup : at.docLogin
    if (getSession()) window.location.replace(next)
  }, [isSignup, next])

  const validate = (): FieldErrors => {
    const e: FieldErrors = {}
    if (isSignup && !name.trim()) e.name = at.errors.nameRequired
    if (!isValidEmail(email)) e.email = at.errors.emailInvalid
    if (password.length < PASSWORD_MIN) e.password = at.errors.passwordShort
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setFormError(null)
    const first = (['name', 'email', 'password'] as const).find((k) => e[k])
    if (first) {
      document.getElementById(ids[first])?.focus()
      return
    }
    setBusy(true)
    const res = isSignup ? await signUp({ name, email, password }) : await signIn({ email, password, remember })
    if (res.ok) {
      window.location.assign(next)
      return
    }
    setBusy(false)
    setFormError(res.error)
    if (res.error === 'wrong_password') document.getElementById(ids.password)?.focus()
  }

  const fieldClass = (k: keyof FieldErrors) => (errors[k] ? 'text-input is-invalid' : 'text-input')

  return (
    <div className="auth">
      <aside className="auth__band">
        <a className="auth__wordmark" href={pagePath('home')}>
          {at.back}
        </a>
        <svg className="auth__map" viewBox={SPA.viewBox} aria-hidden="true">
          <path d={SPA.path} />
        </svg>
        <div className="auth__pitch">
          <p className="auth__band-title">{at.bandTitle}</p>
          <ul className="auth__points">
            {at.bandPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth__main">
        <form className="auth__form" noValidate onSubmit={submit} aria-describedby={formError ? ids.form : undefined}>
          <h1 className="auth__title">{isSignup ? at.signup : at.login}</h1>

          {formError && (
            <p id={ids.form} className="auth__alert" role="alert">
              {at.errors[formError]}
              {(formError === 'exists' || formError === 'not_found') && (
                <>
                  {' '}
                  <a href={otherHref}>{formError === 'exists' ? at.toLogin[1] : at.toSignup[1]}</a>
                </>
              )}
            </p>
          )}

          {isSignup && (
            <div className="auth__field">
              <label htmlFor={ids.name}>{at.name}</label>
              <input id={ids.name} className={fieldClass('name')} autoComplete="nickname" value={name} maxLength={40} aria-invalid={!!errors.name} aria-describedby={ids.nameHint} onChange={(e) => setName(e.target.value)} />
              <p id={ids.nameHint} className={errors.name ? 'auth__hint is-error' : 'auth__hint'}>
                {errors.name ?? at.nameHint}
              </p>
            </div>
          )}

          <div className="auth__field">
            <label htmlFor={ids.email}>{at.email}</label>
            <input id={ids.email} className={fieldClass('email')} type="email" inputMode="email" autoComplete={isSignup ? 'email' : 'username'} value={email} aria-invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="auth__hint is-error">{errors.email}</p>}
          </div>

          <div className="auth__field">
            <label htmlFor={ids.password}>{at.password}</label>
            <div className="auth__password">
              <input
                id={ids.password}
                className={fieldClass('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                aria-invalid={!!errors.password}
                aria-describedby={ids.passHint}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="text-button" aria-pressed={showPassword} aria-controls={ids.password} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? at.hide : at.show}
              </button>
            </div>
            <p id={ids.passHint} className={errors.password ? 'auth__hint is-error' : 'auth__hint'}>
              {errors.password ?? (isSignup ? at.passwordHint : '')}
            </p>
          </div>

          {!isSignup && (
            <label className="auth__check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>{at.remember}</span>
            </label>
          )}

          <button type="submit" className="button button--primary auth__submit" disabled={busy}>
            {busy ? at.submitting : isSignup ? at.submitSignup : at.submitLogin}
          </button>

          <p className="auth__switch">
            {isSignup ? at.toLogin[0] : at.toSignup[0]} <a href={otherHref}>{isSignup ? at.toLogin[1] : at.toSignup[1]}</a>
          </p>
          <p className="auth__note">{at.localNote}</p>
        </form>
      </main>
    </div>
  )
}
