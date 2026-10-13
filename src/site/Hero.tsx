import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'

/** Картинки, которые есть в public/img на момент сборки: без файла блок выглядит нормально и без фото */
export interface SiteImages {
  hero?: string
  about?: string
  final?: string
}

export function SiteHeader({ c, lang }: { c: LandingContent; lang: Locale }) {
  return (
    <header className="site-top">
      <div className="site-top__inner">
        <a className="site-mark" href={pagePath('home', lang)}>
          {lang === 'ru' ? 'Сетапы' : 'Setups'} <span>{lang === 'ru' ? 'для симрейсинга' : 'for sim racing'}</span>
        </a>
        <nav className="site-nav" aria-label={lang === 'ru' ? 'Разделы' : 'Sections'}>
          <a href="#how">{c.nav.how}</a>
          <a href="#symptoms">{c.nav.symptoms}</a>
          <a href="#faq">{c.nav.faq}</a>
        </nav>
        <div className="site-top__end">
          <nav className="lang" aria-label={c.nav.language}>
            {LOCALES.map((l) => (
              <a key={l} href={`${BASE}${l}/`} hrefLang={l} lang={l} aria-current={l === lang ? 'page' : undefined} className={l === lang ? 'is-selected' : undefined}>
                {l.toUpperCase()}
              </a>
            ))}
          </nav>
          <a className="site-link" href={pagePath('login', lang)} data-guest="">
            {c.nav.login}
          </a>
          <a className="site-button" href={pagePath('signup', lang)} data-guest="">
            {c.nav.signup}
          </a>
          <a className="site-button" href={pagePath('app', lang)} data-user="" hidden>
            {c.nav.dashboard}
          </a>
        </div>
      </div>
    </header>
  )
}

/** Пример ответа — та же карточка, что в кабинете: жалоба сверху, правка снизу */
function Examples({ c }: { c: LandingContent }) {
  const h = c.hero
  return (
    <div className="example" data-examples="">
      <div className="example__tabs" role="tablist" aria-label={h.examplesLabel}>
        {h.examples.map((e, i) => (
          <button key={e.id} type="button" role="tab" id={`ex-tab-${e.id}`} aria-controls={`ex-${e.id}`} aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} className="example__tab">
            {e.chip}
          </button>
        ))}
      </div>
      {h.examples.map((e, i) => (
        <div key={e.id} id={`ex-${e.id}`} role="tabpanel" aria-labelledby={`ex-tab-${e.id}`} className="example__panel" hidden={i !== 0}>
          <div className="example__complaint">
            <p className="example__label">{h.complaintLabel}</p>
            <p className="example__quote">{e.complaint}</p>
          </div>
          <div className="example__answer">
            <p className="example__label">{h.answerLabel}</p>
            <div className="example__head">
              <p className="example__param">{e.param}</p>
              <p className={`example__dir example__dir--${e.direction}`}>{h.directions[e.direction]}</p>
            </div>
            <p className="example__action">{e.action}</p>
            <dl className="example__facts">
              <div>
                <dt>{h.effect}</dt>
                <dd>{e.effect}</dd>
              </div>
              <div>
                <dt>{h.watch}</dt>
                <dd>{e.watch}</dd>
              </div>
            </dl>
            <p className="example__meta">
              {h.checked} {e.rule}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Hero({ c, lang, img }: { c: LandingContent; lang: Locale; img: SiteImages }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            {c.hero.title}
          </h1>
          <p className="hero__lead">{c.hero.lead}</p>
          <div className="hero__actions">
            <a className="site-button site-button--lg" href={pagePath('signup', lang)} data-guest="">
              {c.hero.cta}
            </a>
            <a className="site-button site-button--lg" href={pagePath('app', lang)} data-user="" hidden>
              {c.nav.dashboard}
            </a>
            <a className="hero__login" href={pagePath('login', lang)} data-guest="">
              {c.hero.login}
            </a>
          </div>
          <p className="hero__note">{c.hero.note}</p>
        </div>

        <div className={img.hero ? 'hero__visual has-photo' : 'hero__visual'}>
          {img.hero && <img className="hero__photo" src={img.hero} width={1024} height={1536} alt={c.hero.photoAlt} fetchPriority="high" />}
          <Examples c={c} />
        </div>
      </div>
    </section>
  )
}
