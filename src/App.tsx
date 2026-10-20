import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import carsData from './data/cars.json'
import { trackMeta } from './data/trackMeta'
import { categories, conditionGroups, ENGINE_POSITION, setupGroupsFor, trackSearchTerms, tracks, WIND_NAMES } from './data/localized'
import type { Car, CategoryId, Param, ParamValue, Track, TrackKind, Values } from './data/types'
import { baseValues, countParams, listChanges, sanitize } from './lib/params'
import { formatNumber, parseLapTime } from './lib/format'
import { planFuel } from './lib/fuel'
import { runChecks } from './lib/checks'
import { readJSON, writeJSON } from './lib/storage'
import { api } from './lib/api'
import { engineText } from './lib/cars'
import { TrackMap, directionText } from './components/TrackMap'
import { TrackPicker } from './components/TrackPicker'
import { CarPicker } from './components/CarPicker'
import { CarGlyph, Segmented } from './components/controls'
import { SettingsPanel } from './components/SettingsPanel'
import { Summary } from './components/Summary'
import { SetupsDialog } from './components/SetupsDialog'
import { UserMenu } from './components/UserMenu'
import { AssistantPanel } from './assistant/AssistantPanel'
import type { AdviceChange } from './assistant/types'
import { a as at } from './i18n/dashboard'
import { t } from './i18n/dashboard'
import { pagePath } from './i18n/locale'
import type { Session } from './lib/session'

const cars = carsData as Car[]

const LEGACY_DRAFT_KEY = 'simracing-setups:draft:v1'
const LEGACY_SAVED_KEY = 'simracing-setups:saved:v1'
const FILE_FORMAT = 'simracing-setups/v1'

type Tab = 'track' | 'car' | 'assistant'
const TABS: Tab[] = ['track', 'car', 'assistant']

interface Draft {
  savedId: string | null
  name: string
  nameEdited: boolean
  trackId: string
  carId: string
  conditions: Values
  setup: Values
  symmetric: Record<string, boolean>
  lapTime: string
  perLap: string
}

interface Saved extends Draft {
  id: string
  savedAt: string
}

const trackById = (id: string) => tracks.find((t) => t.id === id)
const carById = (id: string) => cars.find((c) => c.id === id)
const categoryOf = (id: CategoryId) => categories.find((c) => c.id === id)!

/** Трасса подходит классу: NASCAR — овалы и дорожные, GT и кубковые — только дорожные */
function trackFits(track: Track | undefined, category: CategoryId): track is Track {
  return !!track && categoryOf(category).tracks.includes(track.kind)
}

function conditionsForTrack(trackId: string, current?: Values): Values {
  const meta = trackMeta[trackId]
  const base = current ?? baseValues(conditionGroups)
  return meta ? { ...base, downforce: meta.downforce, bumps: meta.bumps, kerbs: meta.kerbs } : base
}

function autoName(track: { name: string }, car: Car) {
  return `${track.name}, ${car.brand} ${car.model}`
}

/** По умолчанию — NASCAR Next Gen в Дайтоне: под эту пару сделаны правила ассистента */
function freshDraft(): Draft {
  const car = carById('nascar-next-gen-chevrolet-camaro') ?? cars[0]
  const track = trackById(categoryOf(car.category).defaultTrack) ?? tracks[0]
  return {
    savedId: null,
    name: autoName(track, car),
    nameEdited: false,
    trackId: track.id,
    carId: car.id,
    conditions: conditionsForTrack(track.id),
    setup: baseValues(setupGroupsFor(car.category)),
    symmetric: {},
    lapTime: '',
    perLap: '',
  }
}

/** Всё, что пришло из хранилища или файла, проверяем и чиним */
function repairDraft(raw: Partial<Draft> | null): Draft | null {
  if (!raw || typeof raw !== 'object') return null
  const fresh = freshDraft()
  const car = (raw.carId && carById(raw.carId)) || carById(fresh.carId)!
  const saved = raw.trackId ? trackById(raw.trackId) : undefined
  const track = trackFits(saved, car.category) ? saved : trackById(categoryOf(car.category).defaultTrack)!
  return {
    savedId: typeof raw.savedId === 'string' ? raw.savedId : null,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : autoName(track, car),
    nameEdited: raw.nameEdited === true,
    trackId: track.id,
    carId: car.id,
    conditions: sanitize(conditionGroups, raw.conditions),
    setup: sanitize(setupGroupsFor(car.category), raw.setup),
    symmetric: raw.symmetric && typeof raw.symmetric === 'object' ? raw.symmetric : {},
    lapTime: typeof raw.lapTime === 'string' ? raw.lapTime : '',
    perLap: typeof raw.perLap === 'string' ? raw.perLap : '',
  }
}

/** Сетап на сервере: имя, машина, трасса и всё остальное из черновика в data */
interface ServerSetup {
  id: string
  name: string
  car_id: string
  track_id: string
  data: Partial<Draft>
  updated_at: string
}

function toServer(d: Draft) {
  return { name: d.name, car_id: d.carId, track_id: d.trackId, data: { nameEdited: d.nameEdited, conditions: d.conditions, setup: d.setup, symmetric: d.symmetric, lapTime: d.lapTime, perLap: d.perLap } }
}

function fromServer(s: ServerSetup): Saved | null {
  const d = repairDraft({ ...s.data, name: s.name, carId: s.car_id, trackId: s.track_id, savedId: s.id })
  return d ? { ...d, id: s.id, savedAt: s.updated_at } : null
}

function parseLitres(s: string): number | null {
  const t = s.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) && n > 0 && n < 30 ? n : null
}

export default function App({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  // Сетапы у каждого аккаунта свои; старые, сохранённые до входа, достаются первому, кто войдёт
  const DRAFT_KEY = `${LEGACY_DRAFT_KEY}:${session.email}`
  const SAVED_KEY = `${LEGACY_SAVED_KEY}:${session.email}`
  const [draft, setDraft] = useState<Draft>(() => repairDraft(readJSON<Draft>(DRAFT_KEY) ?? readJSON<Draft>(LEGACY_DRAFT_KEY)) ?? freshDraft())
  const [saved, setSaved] = useState<Saved[]>([])
  const [tab, setTab] = useState<Tab>('track')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null)
  const lastCarByCategory = useRef<Partial<Record<CategoryId, string>>>({})
  const lastTrackByKind = useRef<Partial<Record<TrackKind, string>>>({})
  const tabsRef = useRef<HTMLDivElement>(null)

  const track = trackById(draft.trackId)!
  const car = carById(draft.carId)!
  const category = car.category
  const categoryInfo = categoryOf(category)
  const groups = useMemo(() => setupGroupsFor(category), [category])
  const classTracks = useMemo(() => tracks.filter((x) => categoryInfo.tracks.includes(x.kind)), [categoryInfo])
  const rainPossible = car.rain && track.rain

  useEffect(() => {
    writeJSON(DRAFT_KEY, draft)
  }, [draft, DRAFT_KEY])

  // Сетапы — в аккаунте на сервере. Старые из этого браузера один раз переносим туда же
  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        let list = (await api<{ setups: ServerSetup[] }>('/api/v2/setups')).setups
        const local = readJSON<Saved[]>(SAVED_KEY) ?? readJSON<Saved[]>(LEGACY_SAVED_KEY)
        if (Array.isArray(local) && local.length) {
          for (const old of local) {
            const fixed = repairDraft(old)
            if (fixed) await api('/api/v2/setups', { method: 'POST', body: toServer(fixed) })
          }
          writeJSON(SAVED_KEY, [])
          writeJSON(LEGACY_SAVED_KEY, [])
          list = (await api<{ setups: ServerSetup[] }>('/api/v2/setups')).setups
        }
        if (alive) setSaved(list.map(fromServer).filter((x): x is Saved => x !== null))
      } catch {
        if (alive) say(t.toast.listFailed)
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  const say = (text: string) => setToast({ text, key: Date.now() })

  const update = useCallback((patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => {
    setDraft((d) => {
      const p = typeof patch === 'function' ? patch(d) : patch
      const next = { ...d, ...p }
      if (!next.nameEdited) {
        const t = trackById(next.trackId)
        const c = carById(next.carId)
        if (t && c) next.name = autoName(t, c)
      }
      return next
    })
  }, [])

  const visible = useCallback(
    (p: Param) => {
      if (p.requires === 'abs') return car.abs !== false
      if (p.requires === 'tc') return car.tc !== false
      if (p.requires === 'rain') return rainPossible
      return true
    },
    [car, rainPossible],
  )

  const changes = useMemo(() => listChanges(groups, draft.setup, visible), [groups, draft.setup, visible])
  const totalParams = useMemo(() => countParams(groups, visible), [groups, visible])

  const lapSeconds = parseLapTime(draft.lapTime)
  const perLap = parseLitres(draft.perLap)
  const plan = lapSeconds && perLap ? planFuel(draft.conditions.duration as number, lapSeconds, perLap, draft.conditions.pitStops as number, categoryInfo.tankL) : null
  const checks = runChecks(draft.conditions, draft.setup, plan, plan !== null, rainPossible)

  const chooseTrack = (id: string) => {
    const next = trackById(id)
    if (next) lastTrackByKind.current[next.kind] = id
    update((d) => ({ trackId: id, conditions: conditionsForTrack(id, d.conditions) }))
  }

  const chooseCar = (id: string) => {
    const c = carById(id)
    if (!c) return
    lastCarByCategory.current[c.category] = id
    update({ carId: id })
  }

  /** У класса свой гараж: правки начинаются с базы. NASCAR уходит на овал, GT и кубковые — на дорожную трассу */
  const chooseCategory = (id: string) => {
    const cat = id as CategoryId
    if (cat === category) return
    lastCarByCategory.current[category] = car.id
    lastTrackByKind.current[track.kind] = track.id
    const next = lastCarByCategory.current[cat] ?? cars.find((c) => c.category === cat)?.id
    if (!next) return
    const info = categoryOf(cat)
    const preferred: TrackKind = info.tracks[0]
    const keep = track.kind === preferred
    const nextTrack = keep ? track : (trackById(lastTrackByKind.current[preferred] ?? info.defaultTrack) ?? track)
    update((d) => ({
      carId: next,
      trackId: nextTrack.id,
      conditions: keep ? d.conditions : conditionsForTrack(nextTrack.id, d.conditions),
      setup: baseValues(setupGroupsFor(cat)),
      symmetric: {},
    }))
    say(t.toast.category(info.label, keep ? null : nextTrack.name))
  }

  const switchTab = (next: Tab, focus = false) => {
    setTab(next)
    const bar = tabsRef.current
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ block: 'start' })
    if (focus) document.getElementById(`tab-${next}`)?.focus()
  }

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const i = TABS.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1)
      switchTab(TABS[(i + TABS.length) % TABS.length], true)
    }
  }

  const openGroup = (groupId: string) => {
    setTab('car')
    requestAnimationFrame(() => {
      const el = document.getElementById(`car-${groupId}`)
      el?.scrollIntoView({ block: 'start' })
      el?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
    })
  }

  const save = async () => {
    const existing = draft.savedId && saved.some((s) => s.id === draft.savedId) ? draft.savedId : null
    try {
      const r = await api<{ setup: ServerSetup }>(existing ? `/api/v2/setups/${existing}` : '/api/v2/setups', { method: 'POST', body: toServer(draft) })
      const entry = fromServer(r.setup)
      if (!entry) return
      setSaved((list) => [entry, ...list.filter((s) => s.id !== entry.id)])
      setDraft((d) => ({ ...d, savedId: entry.id }))
      say(t.toast.saved(draft.name))
    } catch {
      say(t.toast.saveFailed)
    }
  }

  const load = (id: string) => {
    const s = saved.find((x) => x.id === id)
    const repaired = repairDraft(s ?? null)
    if (!repaired) return
    setDraft({ ...repaired, savedId: id })
    setDialogOpen(false)
    say(t.toast.opened(repaired.name))
  }

  const remove = async (id: string) => {
    const s = saved.find((x) => x.id === id)
    try {
      await api(`/api/v2/setups/${id}/delete`, { method: 'POST' })
    } catch {
      say(t.toast.saveFailed)
      return
    }
    setSaved((list) => list.filter((x) => x.id !== id))
    if (draft.savedId === id) setDraft((d) => ({ ...d, savedId: null }))
    if (s) say(t.toast.removed(s.name))
  }

  const exportFile = () => {
    const payload = {
      format: FILE_FORMAT,
      exportedAt: new Date().toISOString(),
      name: draft.name,
      track: { id: track.id, name: track.name },
      car: { id: car.id, name: `${car.brand} ${car.model}`, category },
      conditions: draft.conditions,
      setup: draft.setup,
      symmetric: draft.symmetric,
      fuel: { lapTime: draft.lapTime, perLap: draft.perLap },
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `setup-${track.id}-${car.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    say(t.toast.downloaded)
  }

  const importFile = async (file: File) => {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(await file.text())
    } catch {
      say(t.toast.notJson)
      return
    }
    if (data?.format !== FILE_FORMAT) {
      say(t.toast.notOurs)
      return
    }
    const trackId = (data.track as { id?: string } | undefined)?.id
    const carId = (data.car as { id?: string } | undefined)?.id
    const fuel = (data.fuel ?? {}) as { lapTime?: string; perLap?: string }
    const repaired = repairDraft({
      name: data.name as string,
      nameEdited: true,
      trackId,
      carId,
      conditions: data.conditions as Values,
      setup: data.setup as Values,
      symmetric: data.symmetric as Record<string, boolean>,
      lapTime: fuel.lapTime,
      perLap: fuel.perLap,
    })
    if (!repaired) return
    setDraft(repaired)
    const noTrack = !!trackId && !trackById(trackId)
    const noCar = !!carId && !carById(carId)
    say(noTrack || noCar ? t.toast.partly(noTrack, noCar) : t.toast.loaded(repaired.name))
  }

  const labels = useMemo(() => Object.fromEntries(groups.flatMap((g) => g.params.map((p) => [p.id, p.label]))), [groups])

  /** Правка ассистента → черновик гаража: шаг от текущего значения, в пределах диапазона */
  const applyAdvice = (c: AdviceChange) => {
    const p = groups.flatMap((g) => g.params).find((x) => x.id === c.param)
    if (!p) return
    update((d) => {
      const cur = d.setup[p.id]
      let next: ParamValue = cur
      if (p.kind === 'choice' && c.to) next = c.to
      else if (p.kind === 'scalar' && typeof cur === 'number' && c.delta !== undefined) next = Number(Math.min(p.range.max, Math.max(p.range.min, cur + c.delta)).toFixed(p.decimals))
      else if ((p.kind === 'axle' || p.kind === 'corners') && Array.isArray(cur) && c.delta !== undefined) {
        next = cur.map((v, i) => {
          if (!(c.indexes ?? []).includes(i)) return v
          const r = p.kind === 'axle' ? (i === 0 ? p.front : p.rear) : i < 2 ? p.front : p.rear
          return Number(Math.min(r.max, Math.max(r.min, v + c.delta!)).toFixed(p.decimals))
        })
      }
      // Правка одного колеса: левое и правое больше не меняются вместе
      const single = p.kind === 'corners' && (c.indexes ?? []).length === 1
      return { setup: { ...d.setup, [p.id]: next }, symmetric: single ? { ...d.symmetric, [p.id]: false } : d.symmetric }
    })
    say(at.appliedToast(`${labels[c.param] ?? c.label} ${c.text}`))
  }

  const setValue = (key: 'conditions' | 'setup') => (id: string, v: ParamValue) => update((d) => ({ [key]: { ...d[key], [id]: v } }))

  const electronics =
    car.abs === false && car.tc === false
      ? t.elec.none
      : car.abs === true && car.tc === true
        ? t.elec.both
        : car.abs === false
          ? car.tc === true
            ? t.elec.tcOnly
            : t.elec.noAbs
          : car.tc === false
            ? car.abs === true
              ? t.elec.absOnly
              : t.elec.noTc
            : null

  const windFrom = Number(draft.conditions.windFrom)
  const altitude = track.altitudeM

  return (
    <>
      <a className="skip-link" href="#workspace">
        {t.skip}
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <a className="wordmark" href={pagePath('home')}>
            {t.wordmark[0]} <span>{t.wordmark[1]}</span>
          </a>
          <div className="topbar__actions">
            <button type="button" className="button button--ghost" onClick={() => setDialogOpen(true)}>
              {t.mySetups}
              {saved.length > 0 && <span className="count">{saved.length}</span>}
            </button>
            <button type="button" className="button button--primary topbar__save" onClick={save}>
              {t.save}
            </button>
            <UserMenu session={session} onSignOut={onSignOut} />
          </div>
        </div>
      </header>

      <section className="band" aria-label={t.bandLabel}>
        <div className="band__inner">
          <div className="band__track">
            <TrackPicker tracks={classTracks} aliases={trackSearchTerms} value={track} onChange={chooseTrack} />
            <TrackMap track={track} variant="hero" wind={{ from: windFrom, speed: draft.conditions.windSpeed as number, name: WIND_NAMES[String(windFrom)] }} />
            <dl className="facts">
              <div>
                <dt>{t.lapLength}</dt>
                <dd>
                  {formatNumber(track.lengthKm, 3)} {t.km}
                </dd>
              </div>
              {track.turns !== null && (
                <div>
                  <dt>{t.turns}</dt>
                  <dd>{track.turns}</dd>
                </div>
              )}
              {directionText(track) && (
                <div>
                  <dt>{t.direction}</dt>
                  <dd>{directionText(track)}</dd>
                </div>
              )}
              <div>
                <dt>{t.layout}</dt>
                <dd>{track.layout}</dd>
              </div>
              {altitude !== undefined && (
                <div>
                  <dt>{t.altitude}</dt>
                  <dd>
                    {formatNumber(altitude)} {t.m}
                  </dd>
                </div>
              )}
            </dl>
            {trackMeta[track.id]?.layoutNote && <p className="band__note">{trackMeta[track.id].layoutNote}</p>}
          </div>

          <div className="band__car">
            <Segmented tone="band" size="lg" label={t.carCategory} value={category} options={categories.map((c) => ({ value: c.id, label: c.label }))} onChange={chooseCategory} />
            <CarPicker cars={cars} category={category} value={car} onChange={chooseCar} />
            <div className="car-card">
              <CarGlyph engine={car.enginePosition} className="car-glyph car-glyph--band" />
              <dl className="facts facts--car">
                {engineText(car) && (
                  <div>
                    <dt>{t.engine}</dt>
                    <dd>{engineText(car)}</dd>
                  </div>
                )}
                {car.enginePosition && (
                  <div>
                    <dt>{t.enginePos}</dt>
                    <dd>{ENGINE_POSITION[car.enginePosition]}</dd>
                  </div>
                )}
                {car.year && (
                  <div>
                    <dt>{t.debut}</dt>
                    <dd>{car.year}</dd>
                  </div>
                )}
                {electronics && (
                  <div>
                    <dt>{t.electronics}</dt>
                    <dd>{electronics}</dd>
                  </div>
                )}
              </dl>
            </div>
            {categoryInfo.note && <p className="band__note">{categoryInfo.note}</p>}
          </div>
        </div>
      </section>

      <div className="tabs" ref={tabsRef}>
        <div className="tabs__inner" role="tablist" aria-label={t.settingsTabs}>
          {TABS.map((id) => (
            <button
              key={id}
              id={`tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              className="tab"
              onClick={() => switchTab(id)}
              onKeyDown={onTabKey}
            >
              {id === 'track' ? t.tabTrack : id === 'car' ? t.tabCar : t.tabAssistant}
              {id === 'car' && changes.length > 0 && <span className="tab__count">{changes.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <main id="workspace" className={tab === 'assistant' ? 'workspace workspace--wide' : 'workspace'}>
        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="workspace__panel">
          {tab === 'track' && (
            <SettingsPanel
              key="track"
              idPrefix="track"
              groups={conditionGroups}
              values={draft.conditions}
              onChange={setValue('conditions')}
              visible={visible}
              intro={
                <p className="settings__intro">
                  {t.trackIntro(track.name)}
                </p>
              }
            />
          )}
          {tab === 'car' && (
            <SettingsPanel
              key="car"
              idPrefix="car"
              groups={groups}
              values={draft.setup}
              onChange={setValue('setup')}
              visible={visible}
              showDelta
              symmetric={draft.symmetric}
              onSymmetricChange={(id, v) => update((d) => ({ symmetric: { ...d.symmetric, [id]: v } }))}
              intro={
                <p className="settings__intro">
                  {t.carIntro(`${car.brand} ${car.model}`)}
                </p>
              }
            />
          )}
          {tab === 'assistant' && <AssistantPanel car={car} track={track} conditions={draft.conditions} setup={draft.setup} setupId={draft.savedId} labels={labels} onApply={applyAdvice} />}
        </div>

        {tab !== 'assistant' && (
        <Summary
          name={draft.name}
          onNameChange={(v) => update({ name: v, nameEdited: v.trim().length > 0 })}
          changes={changes}
          totalParams={totalParams}
          onResetAll={() => update({ setup: baseValues(groups) })}
          onOpenChange={openGroup}
          lapTime={draft.lapTime}
          perLap={draft.perLap}
          onLapTime={(v) => update({ lapTime: v })}
          onPerLap={(v) => update({ perLap: v })}
          lapValid={!draft.lapTime.trim() || lapSeconds !== null}
          perLapValid={!draft.perLap.trim() || perLap !== null}
          plan={plan}
          durationMin={draft.conditions.duration as number}
          pitStops={draft.conditions.pitStops as number}
          isRace={draft.conditions.sessionType === 'race'}
          fuelLoaded={draft.setup.fuel as number}
          onFill={(l) => update((d) => ({ setup: { ...d.setup, fuel: l } }))}
          checks={checks}
          onSave={save}
          onExport={exportFile}
          onImport={importFile}
        />
        )}
      </main>

      <SetupsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onLoad={load}
        onDelete={remove}
        items={saved.map((s) => {
          const tr = trackById(s.trackId)
          const c = carById(s.carId)
          const g = setupGroupsFor(c?.category ?? category)
          return {
            id: s.id,
            name: s.name,
            trackName: tr?.name ?? t.trackGone,
            carName: c ? `${c.brand} ${c.model}` : t.carGone,
            savedAt: s.savedAt,
            changes: listChanges(g, sanitize(g, s.setup)).length,
          }
        })}
      />

      <div className="toast-region" aria-live="polite">
        {toast && (
          <p key={toast.key} className="toast">
            {toast.text}
          </p>
        )}
      </div>
    </>
  )
}
