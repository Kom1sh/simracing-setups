import { SPA } from '../data/heroTrack'
import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'
import { parsePolyline, pointAt } from './trackGeometry'

const spa = parsePolyline(SPA.path)
const MARK = 64

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

export function Hero({ c, lang }: { c: LandingContent; lang: Locale }) {
  const demos = c.hero.demos
  const first = pointAt(spa, demos[0].at)
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            {c.hero.title}
          </h1>
          <p className="hero__lead">{c.hero.lead}</p>
          <div className="hero__actions">
            <a className="site-button site-button--light site-button--lg" href={pagePath('signup', lang)} data-guest="">
              {c.hero.cta}
            </a>
            <a className="site-button site-button--light site-button--lg" href={pagePath('app', lang)} data-user="" hidden>
              {c.nav.dashboard}
            </a>
            <a className="hero__login" href={pagePath('login', lang)} data-guest="">
              {c.hero.login}
            </a>
          </div>
          <p className="hero__note">{c.hero.note}</p>
        </div>

        <div className="demo" data-demo="">
          <div className="demo__chips" role="radiogroup" aria-label={c.hero.chipsLabel}>
            {demos.map((d, i) => {
              const p = pointAt(spa, d.at)
              return (
                <button key={d.id} type="button" role="radio" aria-checked={i === 0} tabIndex={i === 0 ? 0 : -1} className="demo__chip" data-demo-id={d.id} data-at={d.at} data-x={p.x.toFixed(1)} data-y={p.y.toFixed(1)}>
                  {d.chip}
                </button>
              )
            })}
          </div>

          <figure className="demo__map">
            <svg viewBox={SPA.viewBox} role="img" aria-label={demos[0].corner} data-demo-svg="">
              <path className="demo__under" d={SPA.path} />
              <path className="demo__track" d={SPA.path} pathLength={1} />
              <rect className="demo__corner" data-demo-corner="" x={first.x - MARK / 2} y={first.y - MARK / 2} width={MARK} height={MARK} />
              <rect className="demo__car" data-demo-car="" x={first.x - 13} y={first.y - 13} width={26} height={26} />
            </svg>
          </figure>

          <div className="radio">
            {demos.map((d, i) => (
              <div key={d.id} className="radio__msg" data-demo-panel={d.id} hidden={i !== 0}>
                <p className="radio__corner">{d.corner}</p>
                <p className="radio__you">
                  <span className="radio__who">{c.hero.you}</span>
                  {d.quote}
                </p>
                <div className="radio__answer">
                  <p className="radio__who">
                    {c.hero.assistant}, {c.hero.demoLabel.toLowerCase()}
                  </p>
                  <p className="radio__param">{d.param}</p>
                  <p className="radio__change">{d.change}</p>
                  <dl className="radio__facts">
                    <div>
                      <dt>{c.hero.effect}</dt>
                      <dd>{d.effect}</dd>
                    </div>
                    <div>
                      <dt>{c.hero.watch}</dt>
                      <dd>{d.watch}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
