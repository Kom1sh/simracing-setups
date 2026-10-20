// Сессия для проверок кабинета: настоящая регистрация через API, каждый прогон — новый пользователь.
// Кука srs_sid (httpOnly) и подсказка srs_in остаются в контексте браузера.
export async function withSession(context, base) {
  // Корень сайта — всё до /ru/app/
  const root = new URL(base).href.replace(/(ru|en)\/(app\/?)?$/, '')
  const email = `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`
  const r = await context.request.post(`${root}api/v2/auth/register`, { data: { email, name: 'QA', password: 'qa-pass-123' } })
  if (!r.ok()) throw new Error(`регистрация для теста: ${r.status()} ${await r.text()}`)
  return email
}
