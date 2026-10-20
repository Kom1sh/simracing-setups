// Сессия для проверок кабинета: та же кука, что ставит вход (src/lib/session.ts)
export async function withSession(context, base) {
  const value = Buffer.from(JSON.stringify({ email: 'qa@example.com', name: 'QA', since: new Date().toISOString() })).toString('base64url')
  // Корень сайта — всё до /ru/app/: /simracing-setups/ на Pages, / на своём домене
  const root = new URL(base).href.replace(/(ru|en)\/(app\/?)?$/, '')
  await context.addCookies([{ name: 'srs_session', value, url: root }])
}
