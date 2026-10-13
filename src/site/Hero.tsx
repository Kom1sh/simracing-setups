import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'

/** Картинки, которые есть в public/img на момент сборки: без файла блок выглядит нормально и без фото */
export interface SiteImages {
  hero?: string
  about?: string
  final?: string
}

/** Знак: жёлтый квадрат с поворотом — поворот и есть то место, где теряется время */
export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" />
      <path d="M8 22V14a6 6 0 0 1 6-6h6" />
    </svg>
  )
}

export function SiteHeader({ c, lang }: { c: LandingContent; lang: Locale }) {
  return (
    <header className="site-top">
      <div className="site-top__inner">
        <a className="site-mark" href={pagePath('home', lang)}>
          <Mark />
          {lang === 'ru' ? 'Сетапы' : 'Setups'}
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
          <a className="btn btn--accent" href={pagePath('signup', lang)} data-guest="">
            {c.hero.cta}
          </a>
          <a className="btn btn--accent" href={pagePath('app', lang)} data-user="" hidden>
            {c.nav.dashboard}
          </a>
        </div>
      </div>
    </header>
  )
}

export function Hero({ c, lang, img }: { c: LandingContent; lang: Locale; img: SiteImages }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {img.hero && <img className="hero__photo" src={img.hero} width={1024} height={1536} alt={c.hero.photoAlt} fetchPriority="high" />}
      <div className="hero__inner">
        <h1 id="hero-title" className="hero__title">
          {c.hero.title}
        </h1>
        <p className="hero__sub">{c.hero.sub}</p>
        <p className="hero__lead">{c.hero.lead}</p>
        <div className="hero__actions">
          <a className="btn btn--accent btn--lg" href={pagePath('signup', lang)} data-guest="">
            {c.hero.cta}
          </a>
          <a className="btn btn--accent btn--lg" href={pagePath('app', lang)} data-user="" hidden>
            {c.nav.dashboard}
          </a>
          <a className="btn btn--ghost-dark btn--lg" href="#example">
            {c.hero.secondary}
          </a>
        </div>
        <p className="hero__note">{c.hero.note}</p>
      </div>
    </section>
  )
}

/** Пример ответа: вкладки сверху, жалоба пилота слева, правка из правила справа */
export function Demo({ c, lang }: { c: LandingContent; lang: Locale }) {
  const h = c.hero
  return (
    <section id="example" className="demo" aria-labelledby="demo-title">
      <div className="demo__inner">
        <div className="demo__head">
          <h2 id="demo-title" className="title-2">
            {c.demo.title}
          </h2>
          <p className="demo__intro">{c.demo.intro}</p>
        </div>
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
                  <p className="example__dir">{h.directions[e.direction]}</p>
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
        <a className="btn btn--accent btn--lg demo__cta" href={pagePath('signup', lang)} data-guest="">
          {c.hero.cta}
        </a>
      </div>
    </section>
  )
}
