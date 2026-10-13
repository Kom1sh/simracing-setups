import { useId } from 'react'
import { a } from '../i18n/dashboard'
import { Segmented, Toggle } from '../components/controls'
import { COMMENT_MAX, CORNER_PHASES, CORNER_SPEEDS, PHASED_SYMPTOMS, SYMPTOMS, type CornerPhase, type CornerSpeed, type Symptom } from './types'

export interface AskDraft {
  symptom: Symptom | null
  phase: CornerPhase | null
  speed: CornerSpeed
  comment: string
  sendSetup: boolean
}

interface Props {
  draft: AskDraft
  onChange: (patch: Partial<AskDraft>) => void
  errors: { symptom?: string; phase?: string }
  context: string
  onEditConditions: () => void
  loading: boolean
  onSubmit: () => void
}

export function AssistantForm({ draft, onChange, errors, context, onEditConditions, loading, onSubmit }: Props) {
  const ids = { symptom: useId(), phase: useId(), comment: useId(), count: useId() }
  const phased = draft.symptom !== null && PHASED_SYMPTOMS.includes(draft.symptom)

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
        <p>
          <span className="ask__context-label">{a.context}:</span> {context}
        </p>
        <button type="button" className="text-button" onClick={onEditConditions}>
          {a.editConditions}
        </button>
      </div>

      <fieldset className="ask__field" aria-describedby={errors.symptom ? ids.symptom : undefined}>
        <legend className="ask__legend">{a.symptomLabel}</legend>
        <div className="symptoms">
          {SYMPTOMS.map((s, i) => (
            <label key={s} className={draft.symptom === s ? 'symptom is-selected' : 'symptom'}>
              <input
                type="radio"
                name="symptom"
                value={s}
                checked={draft.symptom === s}
                data-first={i === 0 ? '' : undefined}
                onChange={() => onChange({ symptom: s })}
              />
              <span className="symptom__name">{a.symptoms[s][0]}</span>
              <span className="symptom__hint">{a.symptoms[s][1]}</span>
            </label>
          ))}
        </div>
        {errors.symptom && (
          <p id={ids.symptom} className="field-error">
            {errors.symptom}
          </p>
        )}
      </fieldset>

      {phased && (
        <div className="ask__field">
          <p className="ask__legend">{a.phaseLabel}</p>
          <Segmented value={draft.phase ?? ''} label={a.phaseLabel} options={CORNER_PHASES.map((p) => ({ value: p, label: a.phases[p] }))} onChange={(v) => onChange({ phase: v as CornerPhase })} />
          {errors.phase && (
            <p id={ids.phase} className="field-error">
              {errors.phase}
            </p>
          )}
        </div>
      )}

      <div className="ask__field">
        <p className="ask__legend">{a.speedLabel}</p>
        <Segmented value={draft.speed} label={a.speedLabel} options={CORNER_SPEEDS.map((s) => ({ value: s, label: a.speeds[s] }))} onChange={(v) => onChange({ speed: v as CornerSpeed })} />
      </div>

      <div className="ask__field">
        <label className="ask__legend" htmlFor={ids.comment}>
          {a.commentLabel} <span className="ask__optional">{a.commentOptional}</span>
        </label>
        <textarea
          id={ids.comment}
          className="text-input ask__comment"
          rows={3}
          maxLength={COMMENT_MAX}
          placeholder={a.commentPlaceholder}
          value={draft.comment}
          aria-describedby={ids.count}
          onChange={(e) => onChange({ comment: e.target.value })}
        />
        <p id={ids.count} className="ask__count">
          {a.commentLeft(COMMENT_MAX - draft.comment.length)}
        </p>
      </div>

      <div className="ask__field">
        <Toggle checked={draft.sendSetup} label={a.sendSetup} onChange={(v) => onChange({ sendSetup: v })} />
      </div>

      <button type="submit" className="button button--primary ask__submit" disabled={loading} aria-disabled={loading}>
        {loading ? a.submitting : a.submit}
      </button>
    </form>
  )
}
