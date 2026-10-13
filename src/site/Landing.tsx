import type { ReactNode } from 'react'
import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'
import { HandlingDiagram } from './HandlingDiagram'
import { Demo, Hero, Mark, SiteHeader, type SiteImages } from './Hero'

const PHASES = { en: ['Entry', 'Mid-corner', 'Exit'], ru: ['Вход', 'Середина', 'Выход'] }
const CLASSES = { en: ['GT3', 'GT4', 'GT2', 'Cup'], ru: ['GT3', 'GT4', 'GT2', 'Кубковые'] }

/** Мини-интерфейсы в карточках шагов — показать, а не описать */
function StepVisual({ step, c, lang }: { step: number; c: LandingContent; lang: Locale }) {
  const ex = c.hero.examples
  if (step === 0)
    return (
      <div className="mini" aria-hidden="true">
        {ex.map((e, i) => (
          <span key={e.id} className={i === 0 ? 'mini__row is-on' : 'mini__row'}>
            {e.chip}
          </span>
        ))}
        <span className="mini__seg">
          {PHASES[lang].map((x, i) => (
            <span key={x} className={i === 1 ? 'is-on' : undefined}>
              {x}
            </span>
          ))}
        </span>
      </div>
    )
  if (step === 1)
    return (
      <div className="mini" aria-hidden="true">
        <span className="mini__head">
          {ex[0].param} <b>{c.hero.directions[ex[0].direction]}</b>
        </span>
        <span className="mini__strong">{ex[0].action}</span>
        <span className="mini__mute">{ex[0].effect}</span>
      </div>
    )
  return (
    <div className="mini" aria-hidden="true">
      <span className="mini__seg">
        {CLASSES[lang].map((x, i) => (
          <span key={x} className={i === 0 ? 'is-on' : undefined}>
            {x}
          </span>
        ))}
      </span>
      <span className="mini__mute">{lang === 'ru' ? 'Спа-Франкоршам, 7,004 км' : 'Spa-Francorchamps, 7.004 km'}</span>
    </div>
  )
}

/** Блок страницы: тон фона и заголовок слева, пояснение справа — как у girlvoice.ai */
function Band({ id, tone, title, intro, children, labelId }: { id?: string; tone: 'light' | 'grey' | 'dark'; title: string; intro?: string; children: ReactNode; labelId: string }) {
  return (
    <section id={id} className={`band band--${tone}`} aria-labelledby={labelId}>
      <div className="band__inner">
        <div className="band__head">
          <h2 id={labelId} className="title-2">
            {title}
          </h2>
          {intro && <p className="band__intro">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

export function Landing({ c, lang, img }: { c: LandingContent; lang: Locale; img: SiteImages }) {
  return (
    <>
      <a className="skip-link" href="#main">
        {c.nav.skip}
      </a>
      <SiteHeader c={c} lang={lang} />
      <main id="main">
        <Hero c={c} lang={lang} img={img} />
        <Demo c={c} lang={lang} />

        <section className="band band--light about" aria-labelledby="about-title">
          <div className="band__inner about__inner">
            <div className="about__text">
              <h2 id="about-title" className="title-2">
                {c.about.title}
              </h2>
              {c.about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {img.about && (
              <figure className="about__media">
                <img src={img.about} width={1536} height={1024} loading="lazy" decoding="async" alt={c.about.photoAlt} />
                <figcaption className="about__card">
                  <b>{c.about.card.label}</b>
                  <span>{c.about.card.text}</span>
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        <Band id="how" tone="grey" title={c.how.title} intro={c.how.intro} labelId="how-title">
          <ol className="steps">
            {c.how.steps.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step__num" aria-hidden="true">
                  {i + 1}
                </span>
                <StepVisual step={i} c={c} lang={lang} />
                <h3 className="title-3">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </Band>

        <Band tone="dark" title={c.handling.title} intro={c.handling.intro} labelId="handling-title">
          <div className="handling">
            {c.handling.items.map((h) => (
              <figure key={h.id} className="handling__item">
                <HandlingDiagram kind={h.id} title={h.title} />
                <figcaption>
                  <h3 className="title-3">{h.title}</h3>
                  <p>{h.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="handling__legend">
            <span className="handling__key handling__key--planned">{c.handling.planned}</span>
            <span className="handling__key">{c.handling.actual}</span>
          </p>
        </Band>

        <Band id="symptoms" tone="light" title={c.symptoms.title} intro={c.symptoms.intro} labelId="symptoms-title">
          <div className="symptom-grid">
            {c.symptoms.items.map((s) => (
              <article key={s.id} id={s.id} className="card">
                <h3 className="title-3">{s.title}</h3>
                <p>{s.text}</p>
                <p className="card__label">{c.symptoms.paramsLabel}</p>
                <ul className="tags">
                  {s.params.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Band>

        <Band tone="grey" title={c.rules.title} intro={c.rules.intro} labelId="rules-title">
          <ul className="rule-grid">
            {c.rules.items.map((r) => (
              <li key={r.title} className="card">
                <h3 className="title-3">{r.title}</h3>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
        </Band>

        <Band tone="light" title={c.numbers.title} intro={c.numbers.intro} labelId="numbers-title">
          <dl className="numbers">
            {c.numbers.rows.map((r) => (
              <div key={r.value} className="numbers__item">
                <dt>{r.value}</dt>
                <dd>{r.text}</dd>
              </div>
            ))}
          </dl>
          <p className="numbers__source">{c.numbers.source}</p>
        </Band>

        <Band tone="dark" title={c.preview.title} intro={c.preview.text} labelId="preview-title">
          <figure className="preview">
            <img src={`${BASE}img/dashboard-${lang}.jpg`} width={1440} height={900} loading="lazy" decoding="async" alt={c.preview.alt} />
          </figure>
          <div className="preview__foot">
            <ul className="tags tags--dark">
              {c.preview.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <a className="btn btn--accent btn--lg" href={pagePath('app', lang)}>
              {c.preview.cta}
            </a>
          </div>
        </Band>

        <Band id="faq" tone="light" title={c.faq.title} labelId="faq-title">
          <div className="faq">
            {c.faq.items.map((f, i) => (
              <details key={f.q} className="faq__item" open={i === 0}>
                <summary>
                  <h3>{f.q}</h3>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Band>

        <section className={img.final ? 'final has-photo' : 'final'} aria-labelledby="final-title">
          {img.final && <img className="final__photo" src={img.final} width={1536} height={1024} loading="lazy" decoding="async" alt={c.final.photoAlt} />}
          <div className="final__inner">
            <h2 id="final-title" className="title-1">
              {c.final.title}
            </h2>
            <p className="final__text">{c.final.text}</p>
            <a className="btn btn--accent btn--lg" href={pagePath('signup', lang)} data-guest="">
              {c.final.cta}
            </a>
            <a className="btn btn--accent btn--lg" href={pagePath('app', lang)} data-user="" hidden>
              {c.nav.dashboard}
            </a>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="site-foot__inner">
          <p className="site-foot__brand">
            <Mark />
            {c.meta.siteName}
          </p>
          <p>{c.footer.project}</p>
          <p>
            <a href="https://github.com/Kom1sh/simracing-setups">{c.footer.code}</a>
          </p>
          <p>{c.footer.data}</p>
          <nav className="lang lang--foot" aria-label={c.nav.language}>
            {LOCALES.map((l) => (
              <a key={l} href={`${BASE}${l}/`} hrefLang={l} lang={l} aria-current={l === lang ? 'page' : undefined} className={l === lang ? 'is-selected' : undefined}>
                {l === 'en' ? 'English' : 'Русский'}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  )
}
