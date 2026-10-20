import { useId } from 'react'
import { a } from '../i18n/dashboard'
import { Segmented } from '../components/controls'
import { PHASES, SYMPTOMS, TEXT_MAX, WHENS, type Phase, type Symptom, type When } from './types'

export interface AdviceDraft {
  text: string
  symptom: Symptom | null
  phase: Phase | null
  when: When
}

interface Props {
  carName: string
  trackName: string
  draft: AdviceDraft
  error: string | null
  loading: boolean
  onChange: (patch: Partial<AdviceDraft>) => void
  onSubmit: () => void
}

/** Описание проблемы своими словами + необязательные подсказки. Машина, трасса, погода и правки — из кабинета */
export function AdviceForm({ carName, trackName, draft, error, loading, onChange, onSubmit }: Props) {
  const ids = { text: useId(), count: useId(), err: useId() }
  return (
    <form
      className="ask"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <p className="ask__intro">{a.intro}</p>

      <div className="ask__context">
        <p className="ask__legend">{a.contextLabel}</p>
        <p className="ask__context-value">
          <strong>{carName}</strong> · {trackName}
        </p>
        <p className="ask__note">{a.contextNote}</p>
      </div>

      <div className="ask__field">
        <label className="ask__legend" htmlFor={ids.text}>
          {a.textLabel}
        </label>
        <textarea
          id={ids.text}
          className={error ? 'text-input ask__comment is-invalid' : 'text-input ask__comment'}
          rows={4}
          maxLength={TEXT_MAX}
          placeholder={a.textPlaceholder}
          value={draft.text}
          aria-invalid={!!error}
          aria-describedby={`${ids.count}${error ? ` ${ids.err}` : ''}`}
          onChange={(e) => onChange({ text: e.target.value })}
        />
        <p id={ids.count} className="ask__count">
          {a.counter(draft.text.length, TEXT_MAX)}
        </p>
        {error && (
          <p id={ids.err} className="field-error">
            {error}
          </p>
        )}
      </div>

      <fieldset className="ask__hints">
        <legend className="ask__legend">{a.hintsLabel}</legend>
        <p className="ask__sublabel">{a.symptomLabel}</p>
        <Segmented value={draft.symptom ?? ''} label={a.symptomLabel} options={SYMPTOMS.map((s) => ({ value: s, label: a.symptoms[s] }))} onChange={(v) => onChange({ symptom: draft.symptom === v ? null : (v as Symptom) })} />
        <p className="ask__sublabel">{a.phaseLabel}</p>
        <Segmented value={draft.phase ?? ''} label={a.phaseLabel} options={PHASES.map((p) => ({ value: p, label: a.phases[p] }))} onChange={(v) => onChange({ phase: draft.phase === v ? null : (v as Phase) })} />
        <p className="ask__sublabel">{a.whenLabel}</p>
        <Segmented value={draft.when} label={a.whenLabel} options={WHENS.map((w) => ({ value: w, label: a.whens[w] }))} onChange={(v) => onChange({ when: v as When })} />
      </fieldset>

      <button type="submit" className="button button--primary ask__submit" disabled={loading}>
        {loading ? a.submitting : a.submit}
      </button>
    </form>
  )
}
