import { BASE, LOCALES, pagePath, type Locale } from '../i18n/locale'
import type { LandingContent } from './content'
import { Hero, SiteHeader } from './Hero'

const PHASES = { en: ['Entry', 'Mid-corner', 'Exit'], ru: ['Вход', 'Середина', 'Выход'] }
const CLASSES = { en: ['GT3', 'GT4', 'GT2', 'Cup'], ru: ['GT3', 'GT4', 'GT2', 'Кубковые'] }

/** Маленькие куски интерфейса кабинета рядом с шагами — показать, а не описать */
function StepVisual({ step, c, lang }: { step: number; c: LandingContent; lang: Locale }) {
  if (step === 0)
    return (
      <div className="ui ui--pick" aria-hidden="true">
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
  if (step === 1)
    return (
      <div className="ui ui--symptom" aria-hidden="true">
        {c.hero.demos.map((d, i) => (
          <span key={d.id} className={i === 0 ? 'ui__row is-selected' : 'ui__row'}>
            {d.chip}
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
  const d = c.hero.demos[0]
  return (
    <div className="ui ui--answer" aria-hidden="true">
      <span className="ui__param">{d.param}</span>
      <span className="ui__change">{d.change}</span>
      <span className="ui__line">
        <s>5</s> 4
      </span>
    </div>
  )
}

export function Landing({ c, lang }: { c: LandingContent; lang: Locale }) {
  return (
    <>
      <a className="skip-link" href="#main">
        {c.nav.skip}
      </a>
      <SiteHeader c={c} lang={lang} />
      <main id="main">
        <Hero c={c} lang={lang} />

        <section id="how" className="sec" aria-labelledby="how-title">
          <div className="sec__head">
            <h2 id="how-title" className="sec__title">
              {c.how.title}
            </h2>
            <p className="sec__intro">{c.how.intro}</p>
          </div>
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

        <section id="symptoms" className="sec" aria-labelledby="symptoms-title">
          <div className="sec__head">
            <h2 id="symptoms-title" className="sec__title">
              {c.symptoms.title}
            </h2>
            <p className="sec__intro">{c.symptoms.intro}</p>
          </div>
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
          <div className="sec__head">
            <h2 id="rules-title" className="sec__title">
              {c.rules.title}
            </h2>
            <p className="sec__intro">{c.rules.intro}</p>
          </div>
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
          <div className="sec__head">
            <h2 id="numbers-title" className="sec__title">
              {c.numbers.title}
            </h2>
            <p className="sec__intro">{c.numbers.intro}</p>
          </div>
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
          <div className="sec__head">
            <h2 id="faq-title" className="sec__title">
              {c.faq.title}
            </h2>
          </div>
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

        <section className="final" aria-labelledby="final-title">
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
