// Сессия для проверок кабинета: та же кука, что ставит вход (src/lib/session.ts)
export async function withSession(context, base) {
  const value = Buffer.from(JSON.stringify({ email: 'qa@example.com', name: 'QA', since: new Date().toISOString() })).toString('base64url')
  const { origin } = new URL(base)
  await context.addCookies([{ name: 'srs_session', value, url: `${origin}/simracing-setups/` }])
}
