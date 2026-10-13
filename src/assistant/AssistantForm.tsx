import { useId } from 'react'
import { a } from '../i18n/dashboard'
import { Segmented } from '../components/controls'
import { CORNER_PHASES, CORNER_SPEEDS, PHASED_SYMPTOMS, SYMPTOM_MAX, SYMPTOMS, type CornerPhase, type CornerSpeed, type Symptom } from './types'

export interface AskDraft {
  symptom: Symptom | null
  phase: CornerPhase | null
  speed: CornerSpeed
  comment: string
}

interface Props {
  draft: AskDraft
  onChange: (patch: Partial<AskDraft>) => void
  /** Текст, который уйдёт в поле symptom */
  composed: string
  error: string | null
  loading: boolean
  onSubmit: () => void
}

/** EGO-01: подсказки и свой текст → одна жалоба в поле symptom (контракт KIR-02) */
export function AssistantForm({ draft, onChange, composed, error, loading, onSubmit }: Props) {
  const ids = { comment: useId(), preview: useId(), error: useId() }
  const phased = draft.symptom !== null && PHASED_SYMPTOMS.includes(draft.symptom)
  const over = composed.length > SYMPTOM_MAX

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

      <fieldset className="ask__field">
        <legend className="ask__legend">
          {a.symptomLabel} <span className="ask__optional">{a.symptomNote}</span>
        </legend>
        <div className="symptoms">
          {SYMPTOMS.map((s) => (
            <label key={s} className={draft.symptom === s ? 'symptom is-selected' : 'symptom'}>
              <input type="radio" name="symptom" value={s} checked={draft.symptom === s} onChange={() => onChange({ symptom: s })} />
              <span className="symptom__name">{a.symptoms[s][0]}</span>
              <span className="symptom__hint">{a.symptoms[s][1]}</span>
            </label>
          ))}
        </div>
        {draft.symptom && (
          <button type="button" className="text-button ask__clear" onClick={() => onChange({ symptom: null, phase: null })}>
            {a.clearSymptom}
          </button>
        )}
      </fieldset>

      {phased && (
        <div className="ask__field">
          <p className="ask__legend">{a.phaseLabel}</p>
          <Segmented value={draft.phase ?? ''} label={a.phaseLabel} options={CORNER_PHASES.map((p) => ({ value: p, label: a.phases[p] }))} onChange={(v) => onChange({ phase: v as CornerPhase })} />
        </div>
      )}

      {draft.symptom && (
        <div className="ask__field">
          <p className="ask__legend">{a.speedLabel}</p>
          <Segmented value={draft.speed} label={a.speedLabel} options={CORNER_SPEEDS.map((s) => ({ value: s, label: a.speeds[s] }))} onChange={(v) => onChange({ speed: v as CornerSpeed })} />
        </div>
      )}

      <div className="ask__field">
        <label className="ask__legend" htmlFor={ids.comment}>
          {a.commentLabel}
        </label>
        <textarea
          id={ids.comment}
          className={error ? 'text-input ask__comment is-invalid' : 'text-input ask__comment'}
          rows={3}
          maxLength={SYMPTOM_MAX}
          placeholder={a.commentPlaceholder}
          value={draft.comment}
          aria-invalid={!!error}
          aria-describedby={`${ids.preview}${error ? ` ${ids.error}` : ''}`}
          onChange={(e) => onChange({ comment: e.target.value })}
        />
      </div>

      <div className="ask__preview" id={ids.preview}>
        <p className="ask__preview-label">
          {a.preview}
          <span className={over ? 'ask__count is-over' : 'ask__count'}>{a.counter(composed.length, SYMPTOM_MAX)}</span>
        </p>
        <p className={composed ? 'ask__preview-text' : 'ask__preview-text is-empty'}>{composed ? `«${composed}»` : a.previewEmpty}</p>
        {a.languageNote && <p className="ask__note">{a.languageNote}</p>}
      </div>

      {error && (
        <p id={ids.error} className="field-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button button--primary ask__submit" disabled={loading}>
        {loading ? a.submitting : a.submit}
      </button>
    </form>
  )
}
