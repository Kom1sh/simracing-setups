import type { ReactNode } from 'react'
import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'
import { HandlingDiagram } from './HandlingDiagram'
import { SymptomDiagram } from './SymptomDiagram'
import { Demo, Hero, Mark, SiteHeader, type SiteImages } from './Hero'

/** Блок страницы: тон фона, заголовок и пояснение под ним */
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
                <div className="step__media">
                  {img[`step-${i + 1}`] && <img src={img[`step-${i + 1}`]} width={1200} height={660} loading="lazy" decoding="async" alt="" />}
                  <span className="step__num" aria-hidden="true">
                    {i + 1}
                  </span>
                </div>
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
              <article key={s.id} id={s.id} className="sym">
                <div className="sym__diagram">
                  <SymptomDiagram id={s.id} />
                </div>
                <h3 className="sym__title">{s.title}</h3>
                <p className="sym__text">{s.text}</p>
                <p className="sym__params">
                  <span>{c.symptoms.paramsLabel}:</span> {s.params.join(', ')}
                </p>
              </article>
            ))}
          </div>
        </Band>

        <section className={img.rules ? 'rules has-photo' : 'rules'} aria-labelledby="rules-title">
          {img.rules && <img className="rules__photo" src={img.rules} width={1516} height={458} loading="lazy" decoding="async" alt="" />}
          <div className="rules__inner">
            <div className="rules__head">
              <h2 id="rules-title" className="title-2">
                {c.rules.title}
              </h2>
              <p className="rules__intro">{c.rules.intro}</p>
            </div>
            <ul className="rules__list">
              {c.rules.items.map((r) => (
                <li key={r.title} className="rules__item">
                  <svg className="rules__check" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="24" height="24" rx="7" />
                    <path d="M7 12.5l3.2 3.2L17 9" />
                  </svg>
                  <h3 className="title-3">{r.title}</h3>
                  <p>{r.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

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

        <section id="faq" className="band band--light" aria-labelledby="faq-title">
          <div className="band__inner faq-layout">
            <h2 id="faq-title" className="title-2 faq-layout__title">
              {c.faq.title}
            </h2>
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
          </div>
        </section>

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
          <div className="site-foot__about">
            <a className="site-foot__brand" href={pagePath('home', lang)}>
              <Mark />
              {c.meta.siteName}
            </a>
            <p>{c.footer.tagline}</p>
            <a className="btn btn--accent" href={pagePath('signup', lang)}>
              {c.hero.cta}
            </a>
          </div>
          <nav className="site-foot__col" aria-label={c.footer.product}>
            <p className="site-foot__title">{c.footer.product}</p>
            <a href="#example">{c.footer.example}</a>
            <a href="#how">{c.nav.how}</a>
            <a href="#symptoms">{c.nav.symptoms}</a>
            <a href="#faq">{c.nav.faq}</a>
          </nav>
          <nav className="site-foot__col" aria-label={c.footer.account}>
            <p className="site-foot__title">{c.footer.account}</p>
            <a href={pagePath('login', lang)}>{c.nav.login}</a>
            <a href={pagePath('signup', lang)}>{c.nav.signup}</a>
            <a href={pagePath('app', lang)}>{c.footer.cabinet}</a>
          </nav>
          <nav className="site-foot__col" aria-label={c.footer.language}>
            <p className="site-foot__title">{c.footer.language}</p>
            {LOCALES.map((l) => (
              <a key={l} href={`${BASE}${l}/`} hrefLang={l} lang={l} aria-current={l === lang ? 'page' : undefined}>
                {l === 'en' ? 'English' : 'Русский'}
              </a>
            ))}
          </nav>
        </div>
        <div className="site-foot__bottom">
          <p>{c.footer.copyright}</p>
          <p>
            {c.footer.maps} <a href="https://www.openstreetmap.org/copyright">{c.footer.mapsOsm}</a>, <a href="https://github.com/bacinger/f1-circuits">bacinger/f1-circuits</a>
          </p>
        </div>
      </footer>
    </>
  )
}
