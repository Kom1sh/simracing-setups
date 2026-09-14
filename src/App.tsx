import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import tracksData from './data/tracks.json'
import carsData from './data/cars.json'
import { trackMeta, trackAliases } from './data/trackMeta'
import { carSetupGroups } from './data/carSetup'
import { conditionGroups, WIND_NAMES } from './data/conditions'
import { categories, ENGINE_POSITION } from './data/categories'
import type { Car, CategoryId, Param, ParamValue, Track, Values } from './data/types'
import { baseValues, countParams, listChanges, sanitize } from './lib/params'
import { formatNumber, parseLapTime } from './lib/format'
import { planFuel } from './lib/fuel'
import { runChecks } from './lib/checks'
import { readJSON, writeJSON } from './lib/storage'
import { engineText } from './lib/cars'
import { TrackMap, directionText } from './components/TrackMap'
import { TrackPicker } from './components/TrackPicker'
import { CarPicker } from './components/CarPicker'
import { CarGlyph, Segmented } from './components/controls'
import { SettingsPanel } from './components/SettingsPanel'
import { Summary } from './components/Summary'
import { SetupsDialog } from './components/SetupsDialog'

const tracks = (tracksData as Track[]).slice().sort((a, b) => a.name.localeCompare(b.name, 'ru'))
const cars = carsData as Car[]

const DRAFT_KEY = 'simracing-setups:draft:v1'
const SAVED_KEY = 'simracing-setups:saved:v1'
const FILE_FORMAT = 'simracing-setups/v1'
const TANK_MAX = 120

type Tab = 'track' | 'car'

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

function conditionsForTrack(trackId: string, current?: Values): Values {
  const meta = trackMeta[trackId]
  const base = current ?? baseValues(conditionGroups)
  return meta ? { ...base, downforce: meta.downforce, bumps: meta.bumps, kerbs: meta.kerbs } : base
}

function autoName(track: Track, car: Car) {
  return `${track.name}, ${car.brand} ${car.model}`
}

function freshDraft(): Draft {
  const track = trackById('spa') ?? tracks[0]
  const car = carById('ferrari-296-gt3') ?? cars.find((c) => c.category === 'gt3') ?? cars[0]
  return {
    savedId: null,
    name: autoName(track, car),
    nameEdited: false,
    trackId: track.id,
    carId: car.id,
    conditions: conditionsForTrack(track.id),
    setup: baseValues(carSetupGroups),
    symmetric: {},
    lapTime: '',
    perLap: '',
  }
}

/** Всё, что пришло из хранилища или файла, проверяем и чиним */
function repairDraft(raw: Partial<Draft> | null): Draft | null {
  if (!raw || typeof raw !== 'object') return null
  const fresh = freshDraft()
  const track = (raw.trackId && trackById(raw.trackId)) || trackById(fresh.trackId)!
  const car = (raw.carId && carById(raw.carId)) || carById(fresh.carId)!
  return {
    savedId: typeof raw.savedId === 'string' ? raw.savedId : null,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : autoName(track, car),
    nameEdited: raw.nameEdited === true,
    trackId: track.id,
    carId: car.id,
    conditions: sanitize(conditionGroups, raw.conditions),
    setup: sanitize(carSetupGroups, raw.setup),
    symmetric: raw.symmetric && typeof raw.symmetric === 'object' ? raw.symmetric : {},
    lapTime: typeof raw.lapTime === 'string' ? raw.lapTime : '',
    perLap: typeof raw.perLap === 'string' ? raw.perLap : '',
  }
}

function parseLitres(s: string): number | null {
  const t = s.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) && n > 0 && n < 30 ? n : null
}

export default function App() {
  const [draft, setDraft] = useState<Draft>(() => repairDraft(readJSON<Draft>(DRAFT_KEY)) ?? freshDraft())
  const [saved, setSaved] = useState<Saved[]>(() => {
    const list = readJSON<Saved[]>(SAVED_KEY)
    return Array.isArray(list) ? list.filter((s) => s && typeof s.id === 'string') : []
  })
  const [tab, setTab] = useState<Tab>('track')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null)
  const lastCarByCategory = useRef<Partial<Record<CategoryId, string>>>({})
  const tabsRef = useRef<HTMLDivElement>(null)

  const track = trackById(draft.trackId)!
  const car = carById(draft.carId)!
  const category = car.category
  const categoryInfo = categories.find((c) => c.id === category)!

  useEffect(() => {
    writeJSON(DRAFT_KEY, draft)
  }, [draft])

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
      return true
    },
    [car],
  )

  const changes = useMemo(() => listChanges(carSetupGroups, draft.setup, visible), [draft.setup, visible])
  const totalParams = useMemo(() => countParams(carSetupGroups, visible), [visible])

  const lapSeconds = parseLapTime(draft.lapTime)
  const perLap = parseLitres(draft.perLap)
  const plan = lapSeconds && perLap ? planFuel(draft.conditions.duration as number, lapSeconds, perLap, draft.conditions.pitStops as number, TANK_MAX) : null
  const checks = runChecks(draft.conditions, draft.setup, plan, plan !== null)

  const chooseTrack = (id: string) => {
    update((d) => ({ trackId: id, conditions: conditionsForTrack(id, d.conditions) }))
  }

  const chooseCar = (id: string) => {
    const c = carById(id)
    if (!c) return
    lastCarByCategory.current[c.category] = id
    update({ carId: id })
  }

  const chooseCategory = (id: string) => {
    const cat = id as CategoryId
    if (cat === category) return
    lastCarByCategory.current[category] = car.id
    const next = lastCarByCategory.current[cat] ?? cars.find((c) => c.category === cat)?.id
    if (next) update({ carId: next })
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
      switchTab(tab === 'track' ? 'car' : 'track', true)
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

  const persistSaved = (list: Saved[]) => {
    setSaved(list)
    return writeJSON(SAVED_KEY, list)
  }

  const save = () => {
    const id = draft.savedId && saved.some((s) => s.id === draft.savedId) ? draft.savedId : crypto.randomUUID()
    const entry: Saved = { ...draft, savedId: id, id, savedAt: new Date().toISOString() }
    const list = [entry, ...saved.filter((s) => s.id !== id)]
    const ok = persistSaved(list)
    setDraft((d) => ({ ...d, savedId: id }))
    say(ok ? `Сетап «${draft.name}» сохранён` : 'Браузер не дал сохранить сетап. Скачайте его файлом из сводки.')
  }

  const load = (id: string) => {
    const s = saved.find((x) => x.id === id)
    const repaired = repairDraft(s ?? null)
    if (!repaired) return
    setDraft({ ...repaired, savedId: id })
    setDialogOpen(false)
    say(`Открыт сетап «${repaired.name}»`)
  }

  const remove = (id: string) => {
    const s = saved.find((x) => x.id === id)
    persistSaved(saved.filter((x) => x.id !== id))
    if (draft.savedId === id) setDraft((d) => ({ ...d, savedId: null }))
    if (s) say(`Сетап «${s.name}» удалён`)
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
    say('Файл сетапа скачан')
  }

  const importFile = async (file: File) => {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(await file.text())
    } catch {
      say('Файл не читается: внутри не JSON.')
      return
    }
    if (data?.format !== FILE_FORMAT) {
      say('Это не сетап этого кабинета: в файле нет отметки simracing-setups/v1.')
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
    const missing = [trackId && !trackById(trackId) ? 'трассы' : '', carId && !carById(carId) ? 'машины' : ''].filter(Boolean)
    say(missing.length ? `Сетап загружен, но ${missing.join(' и ')} из файла здесь нет — оставили текущие.` : `Загружен сетап «${repaired.name}»`)
  }

  const setValue = (key: 'conditions' | 'setup') => (id: string, v: ParamValue) => update((d) => ({ [key]: { ...d[key], [id]: v } }))

  const electronics =
    car.abs === false && car.tc === false
      ? 'Без ABS и антипробуксовки'
      : car.abs === true && car.tc === true
        ? 'ABS и антипробуксовка'
        : car.abs === false
          ? car.tc === true
            ? 'Антипробуксовка, без ABS'
            : 'Без ABS'
          : car.tc === false
            ? car.abs === true
              ? 'ABS, без антипробуксовки'
              : 'Без антипробуксовки'
            : null

  const windFrom = Number(draft.conditions.windFrom)
  const altitude = track.altitudeM

  return (
    <>
      <a className="skip-link" href="#workspace">
        К настройкам
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <p className="wordmark">
            Сетапы <span>для симрейсинга</span>
          </p>
          <div className="topbar__actions">
            <button type="button" className="button button--ghost" onClick={() => setDialogOpen(true)}>
              Мои сетапы{saved.length > 0 && <span className="count">{saved.length}</span>}
            </button>
            <button type="button" className="button button--primary topbar__save" onClick={save}>
              Сохранить
            </button>
          </div>
        </div>
      </header>

      <section className="band" aria-label="Трасса и машина">
        <div className="band__inner">
          <div className="band__track">
            <TrackPicker tracks={tracks} aliases={trackAliases} value={track} onChange={chooseTrack} />
            <TrackMap track={track} variant="hero" wind={{ from: windFrom, speed: draft.conditions.windSpeed as number, name: WIND_NAMES[String(windFrom)] }} />
            <dl className="facts">
              <div>
                <dt>Длина круга</dt>
                <dd>{formatNumber(track.lengthKm, 3)} км</dd>
              </div>
              {track.turns !== null && (
                <div>
                  <dt>Поворотов</dt>
                  <dd>{track.turns}</dd>
                </div>
              )}
              {directionText(track) && (
                <div>
                  <dt>Направление</dt>
                  <dd>{directionText(track)}</dd>
                </div>
              )}
              <div>
                <dt>Конфигурация</dt>
                <dd>{track.layout}</dd>
              </div>
              {altitude !== undefined && (
                <div>
                  <dt>Над уровнем моря</dt>
                  <dd>{formatNumber(altitude)} м</dd>
                </div>
              )}
            </dl>
            {trackMeta[track.id]?.layoutNote && <p className="band__note">{trackMeta[track.id].layoutNote}</p>}
          </div>

          <div className="band__car">
            <Segmented tone="band" size="lg" label="Категория машины" value={category} options={categories.map((c) => ({ value: c.id, label: c.label }))} onChange={chooseCategory} />
            <CarPicker cars={cars} category={category} value={car} onChange={chooseCar} />
            <div className="car-card">
              <CarGlyph engine={car.enginePosition} className="car-glyph car-glyph--band" />
              <dl className="facts facts--car">
                {engineText(car) && (
                  <div>
                    <dt>Двигатель</dt>
                    <dd>{engineText(car)}</dd>
                  </div>
                )}
                {car.enginePosition && (
                  <div>
                    <dt>Где двигатель</dt>
                    <dd>{ENGINE_POSITION[car.enginePosition]}</dd>
                  </div>
                )}
                {car.year && (
                  <div>
                    <dt>Дебют в классе</dt>
                    <dd>{car.year}</dd>
                  </div>
                )}
                {electronics && (
                  <div>
                    <dt>Электроника</dt>
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
        <div className="tabs__inner" role="tablist" aria-label="Настройки">
          <button id="tab-track" type="button" role="tab" aria-selected={tab === 'track'} aria-controls="panel-track" tabIndex={tab === 'track' ? 0 : -1} className="tab" onClick={() => switchTab('track')} onKeyDown={onTabKey}>
            Трасса и погода
          </button>
          <button id="tab-car" type="button" role="tab" aria-selected={tab === 'car'} aria-controls="panel-car" tabIndex={tab === 'car' ? 0 : -1} className="tab" onClick={() => switchTab('car')} onKeyDown={onTabKey}>
            Машина
            {changes.length > 0 && <span className="tab__count">{changes.length}</span>}
          </button>
        </div>
      </div>

      <main id="workspace" className="workspace">
        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="workspace__panel">
          {tab === 'track' ? (
            <SettingsPanel
              key="track"
              idPrefix="track"
              groups={conditionGroups}
              values={draft.conditions}
              onChange={setValue('conditions')}
              intro={
                <p className="settings__intro">
                  Условия для <strong>{track.name}</strong>. Характер трассы подставляется при её выборе, погоду и сессию задаёте сами.
                </p>
              }
            />
          ) : (
            <SettingsPanel
              key="car"
              idPrefix="car"
              groups={carSetupGroups}
              values={draft.setup}
              onChange={setValue('setup')}
              visible={visible}
              showDelta
              symmetric={draft.symmetric}
              onSymmetricChange={(id, v) => update((d) => ({ symmetric: { ...d.symmetric, [id]: v } }))}
              intro={
                <p className="settings__intro">
                  Регулировки <strong>{car.brand} {car.model}</strong>. Диапазоны и база — общий шаблон класса GT3: у машины в конкретном симуляторе границы свои.
                </p>
              }
            />
          )}
        </div>

        <Summary
          name={draft.name}
          onNameChange={(v) => update({ name: v, nameEdited: v.trim().length > 0 })}
          changes={changes}
          totalParams={totalParams}
          onResetAll={() => update({ setup: baseValues(carSetupGroups) })}
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
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p>
            Схемы трасс: <a href="https://github.com/bacinger/f1-circuits">bacinger/f1-circuits</a> (MIT) и данные{' '}
            <a href="https://www.openstreetmap.org/copyright">© участники OpenStreetMap</a> (ODbL). Длина и число поворотов — по открытым источникам, характер трассы — оценка.
          </p>
          <p>
            Учебный проект. Код — <a href="https://github.com/Kom1sh/simracing-setups">github.com/Kom1sh/simracing-setups</a>.
          </p>
        </div>
      </footer>

      <SetupsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onLoad={load}
        onDelete={remove}
        items={saved.map((s) => {
          const t = trackById(s.trackId)
          const c = carById(s.carId)
          return {
            id: s.id,
            name: s.name,
            trackName: t?.name ?? 'трасса удалена',
            carName: c ? `${c.brand} ${c.model}` : 'машина удалена',
            savedAt: s.savedAt,
            changes: listChanges(carSetupGroups, sanitize(carSetupGroups, s.setup)).length,
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
