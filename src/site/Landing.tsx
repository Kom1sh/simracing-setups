import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'
import { HandlingDiagram } from './HandlingDiagram'
import { Hero, SiteHeader, type SiteImages } from './Hero'

const PHASES = { en: ['Entry', 'Mid-corner', 'Exit'], ru: ['Вход', 'Середина', 'Выход'] }
const CLASSES = { en: ['GT3', 'GT4', 'GT2', 'Cup'], ru: ['GT3', 'GT4', 'GT2', 'Кубковые'] }

/** Маленькие куски интерфейса рядом с шагами — показать, а не описать */
function StepVisual({ step, c, lang }: { step: number; c: LandingContent; lang: Locale }) {
  const ex = c.hero.examples
  if (step === 0)
    return (
      <div className="ui" aria-hidden="true">
        {ex.map((e, i) => (
          <span key={e.id} className={i === 0 ? 'ui__row is-selected' : 'ui__row'}>
            {e.chip}
          </span>
        ))}
        <span className="ui__seg">
          {PHASES[lang].map((x, i) => (
            <span key={x} className={i === 1 ? 'is-selected' : undefined}>
              {x}
            </span>
          ))}
        </span>
      </div>
    )
  if (step === 1)
    return (
      <div className="ui" aria-hidden="true">
        <span className="ui__param">
          {ex[0].param} <b>{c.hero.directions[ex[0].direction]}</b>
        </span>
        <span>{ex[0].action}</span>
        <span className="ui__line">{ex[0].effect}</span>
      </div>
    )
  return (
    <div className="ui" aria-hidden="true">
      <span className="ui__seg">
        {CLASSES[lang].map((x, i) => (
          <span key={x} className={i === 0 ? 'is-selected' : undefined}>
            {x}
          </span>
        ))}
      </span>
      <span className="ui__line">{lang === 'ru' ? 'Спа-Франкоршам, 7,004 км' : 'Spa-Francorchamps, 7.004 km'}</span>
    </div>
  )
}

function SectionHead({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <div className="sec__head">
      <h2 id={id} className="sec__title">
        {title}
      </h2>
      {intro && <p className="sec__intro">{intro}</p>}
    </div>
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

        <section className={img.about ? 'sec about has-photo' : 'sec about'} aria-labelledby="about-title">
          <SectionHead id="about-title" title={c.about.title} />
          <div className="about__body">
            {c.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {img.about && <img className="about__photo" src={img.about} width={1536} height={1024} loading="lazy" decoding="async" alt={c.about.photoAlt} />}
          </div>
        </section>

        <section id="how" className="sec" aria-labelledby="how-title">
          <SectionHead id="how-title" title={c.how.title} intro={c.how.intro} />
          <ol className="steps">
            {c.how.steps.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step__num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__text">{s.text}</p>
                <StepVisual step={i} c={c} lang={lang} />
              </li>
            ))}
          </ol>
        </section>

        <section className="sec" aria-labelledby="handling-title">
          <SectionHead id="handling-title" title={c.handling.title} intro={c.handling.intro} />
          <div className="handling">
            {c.handling.items.map((h) => (
              <figure key={h.id} className="handling__item">
                <HandlingDiagram kind={h.id} title={h.title} />
                <figcaption>
                  <h3 className="handling__title">{h.title}</h3>
                  <p>{h.text}</p>
                </figcaption>
              </figure>
            ))}
            <p className="handling__legend">
              <span className="handling__key handling__key--planned">{c.handling.planned}</span>
              <span className="handling__key handling__key--actual">{c.handling.actual}</span>
            </p>
          </div>
        </section>

        <section id="symptoms" className="sec" aria-labelledby="symptoms-title">
          <SectionHead id="symptoms-title" title={c.symptoms.title} intro={c.symptoms.intro} />
          <div className="symptom-list">
            {c.symptoms.items.map((s) => (
              <article key={s.id} id={s.id} className="sym">
                <h3 className="sym__title">{s.title}</h3>
                <p className="sym__text">{s.text}</p>
                <p className="sym__label">{c.symptoms.paramsLabel}</p>
                <ul className="sym__params">
                  {s.params.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="sec sec--surface" aria-labelledby="rules-title">
          <SectionHead id="rules-title" title={c.rules.title} intro={c.rules.intro} />
          <ul className="rules">
            {c.rules.items.map((r) => (
              <li key={r.title} className="rule">
                <h3 className="rule__title">{r.title}</h3>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="sec" aria-labelledby="numbers-title">
          <SectionHead id="numbers-title" title={c.numbers.title} intro={c.numbers.intro} />
          <div className="numbers">
            <dl>
              {c.numbers.rows.map((r) => (
                <div key={r.value} className="numbers__row">
                  <dt>{r.value}</dt>
                  <dd>{r.text}</dd>
                </div>
              ))}
            </dl>
            <p className="numbers__source">{c.numbers.source}</p>
          </div>
        </section>

        <section className="sec preview" aria-labelledby="preview-title">
          <div className="sec__head">
            <h2 id="preview-title" className="sec__title">
              {c.preview.title}
            </h2>
            <p className="sec__intro">{c.preview.text}</p>
            <ul className="preview__points">
              {c.preview.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <a className="site-button site-button--lg" href={pagePath('app', lang)}>
              {c.preview.cta}
            </a>
          </div>
          <figure className="preview__shot">
            <img src={`${BASE}img/dashboard-${lang}.jpg`} width={1440} height={900} loading="lazy" decoding="async" alt={c.preview.alt} />
          </figure>
        </section>

        <section id="faq" className="sec" aria-labelledby="faq-title">
          <SectionHead id="faq-title" title={c.faq.title} />
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
        </section>

        <section className={img.final ? 'final has-photo' : 'final'} aria-labelledby="final-title">
          {img.final && <img className="final__photo" src={img.final} width={1536} height={1024} loading="lazy" decoding="async" alt={c.final.photoAlt} />}
          <div className="final__inner">
            <h2 id="final-title" className="final__title">
              {c.final.title}
            </h2>
            <p className="final__text">{c.final.text}</p>
            <a className="site-button site-button--lg" href={pagePath('signup', lang)} data-guest="">
              {c.final.cta}
            </a>
            <a className="site-button site-button--lg" href={pagePath('app', lang)} data-user="" hidden>
              {c.nav.dashboard}
            </a>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="site-foot__inner">
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
