import { useId } from 'react'
import { a } from '../i18n/dashboard'
import { Segmented } from '../components/controls'
import { CARS, COMMENT_MAX, CORNER_PHASES, STINT_MOMENTS, SYMPTOM_TYPES, TRACKS, type CornerPhase, type StintMoment, type SymptomType } from './types'

export interface AskDraft {
  car: string
  track: string
  symptom: SymptomType | null
  phase: CornerPhase | null
  stint: StintMoment | 'any'
  comment: string
}

export type AskErrors = { symptom?: string; phase?: string; comment?: string }

interface Props {
  draft: AskDraft
  onChange: (patch: Partial<AskDraft>) => void
  errors: AskErrors
  loading: boolean
  onSubmit: () => void
}

/** EGO-01: поля формы → тело POST /api/v1/recommendations по контракту ALE-03 */
export function AssistantForm({ draft, onChange, errors, loading, onSubmit }: Props) {
  const ids = { car: useId(), track: useId(), symptom: useId(), phase: useId(), comment: useId(), count: useId(), commentError: useId() }

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

      <div className="ask__pair">
        <div className="ask__field">
          <label className="ask__legend" htmlFor={ids.car}>
            {a.car}
          </label>
          <select id={ids.car} className="text-input ask__select" value={draft.car} onChange={(e) => onChange({ car: e.target.value })}>
            {CARS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="ask__field">
          <label className="ask__legend" htmlFor={ids.track}>
            {a.track}
          </label>
          <select id={ids.track} className="text-input ask__select" value={draft.track} onChange={(e) => onChange({ track: e.target.value })}>
            {TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="ask__note">{a.scope}</p>

      <fieldset className="ask__field" aria-describedby={errors.symptom ? ids.symptom : undefined}>
        <legend className="ask__legend">{a.symptomLabel}</legend>
        <div className="symptoms">
          {SYMPTOM_TYPES.map((s) => (
            <label key={s} className={draft.symptom === s ? 'symptom is-selected' : 'symptom'}>
              <input type="radio" name="symptom" value={s} checked={draft.symptom === s} onChange={() => onChange({ symptom: s })} />
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

      <div className="ask__field" data-field="phase">
        <p className="ask__legend">{a.phaseLabel}</p>
        <Segmented value={draft.phase ?? ''} label={a.phaseLabel} options={CORNER_PHASES.map((p) => ({ value: p, label: a.phases[p] }))} onChange={(v) => onChange({ phase: v as CornerPhase })} />
        {errors.phase && (
          <p id={ids.phase} className="field-error">
            {errors.phase}
          </p>
        )}
      </div>

      <div className="ask__field">
        <p className="ask__legend">{a.stintLabel}</p>
        <Segmented
          value={draft.stint}
          label={a.stintLabel}
          options={(['any', ...STINT_MOMENTS] as const).map((s) => ({ value: s, label: a.stints[s] }))}
          onChange={(v) => onChange({ stint: v as StintMoment | 'any' })}
        />
      </div>

      <div className="ask__field">
        <label className="ask__legend" htmlFor={ids.comment}>
          {a.commentLabel}
        </label>
        <textarea
          id={ids.comment}
          className={errors.comment ? 'text-input ask__comment is-invalid' : 'text-input ask__comment'}
          rows={3}
          maxLength={COMMENT_MAX}
          placeholder={a.commentPlaceholder}
          value={draft.comment}
          aria-invalid={!!errors.comment}
          aria-describedby={`${ids.count}${errors.comment ? ` ${ids.commentError}` : ''}`}
          onChange={(e) => onChange({ comment: e.target.value })}
        />
        <p id={ids.count} className="ask__count">
          {a.counter(draft.comment.length, COMMENT_MAX)}
        </p>
        {errors.comment && (
          <p id={ids.commentError} className="field-error">
            {errors.comment}
          </p>
        )}
      </div>

      <button type="submit" className="button button--primary ask__submit" disabled={loading}>
        {loading ? a.submitting : a.submit}
      </button>
    </form>
  )
}
