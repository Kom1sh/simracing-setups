import '../styles/font.css'
import '../styles/tokens.css'
import './site-base.css'
import './site-hero.css'
import './site-sections.css'
import { parsePolyline, pointAt } from './trackGeometry'

/** Шапка для вошедших: вместо «Войти» и «Создать аккаунт» — «Открыть кабинет» */
function applySession() {
  const signedIn = document.cookie.split('; ').some((c) => c.startsWith('srs_session='))
  if (!signedIn) return
  document.querySelectorAll<HTMLElement>('[data-guest]').forEach((el) => (el.hidden = true))
  document.querySelectorAll<HTMLElement>('[data-user]').forEach((el) => (el.hidden = false))
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function setupDemo(root: HTMLElement) {
  const svg = root.querySelector<SVGSVGElement>('[data-demo-svg]')
  const track = root.querySelector<SVGPathElement>('.demo__track')
  const car = root.querySelector<SVGRectElement>('[data-demo-car]')
  const corner = root.querySelector<SVGRectElement>('[data-demo-corner]')
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-demo-id]')]
  if (!svg || !track || !car || !corner || chips.length === 0) return

  const line = parsePolyline(track.getAttribute('d') ?? '')
  const carSize = Number(car.getAttribute('width'))
  const cornerSize = Number(corner.getAttribute('width'))
  let at = Number(chips[0].dataset.at)
  let frame = 0

  const placeCar = (f: number) => {
    const p = pointAt(line, f)
    car.setAttribute('x', String(p.x - carSize / 2))
    car.setAttribute('y', String(p.y - carSize / 2))
  }

  /** Машина едет вперёд по трассе от текущей точки до нужной */
  const drive = (to: number, done: () => void, fixed?: number) => {
    cancelAnimationFrame(frame)
    if (reduceMotion) {
      at = to
      placeCar(to)
      done()
      return
    }
    const from = at
    const target = to >= from ? to : to + 1
    const duration = fixed ?? 700 + (target - from) * 2600
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      placeCar(from + (target - from) * ease(t))
      if (t < 1) frame = requestAnimationFrame(step)
      else {
        at = to % 1
        done()
      }
    }
    frame = requestAnimationFrame(step)
  }

  const select = (chip: HTMLButtonElement, focus = false) => {
    const id = chip.dataset.demoId
    chips.forEach((c) => {
      const on = c === chip
      c.setAttribute('aria-checked', String(on))
      c.tabIndex = on ? 0 : -1
    })
    if (focus) chip.focus()
    root.querySelectorAll<HTMLElement>('[data-demo-panel]').forEach((p) => (p.hidden = p.dataset.demoPanel !== id))
    const panel = root.querySelector<HTMLElement>(`[data-demo-panel="${id}"]`)
    svg.setAttribute('aria-label', panel?.querySelector('.radio__corner')?.textContent ?? '')
    corner.setAttribute('x', String(Number(chip.dataset.x) - cornerSize / 2))
    corner.setAttribute('y', String(Number(chip.dataset.y) - cornerSize / 2))
    root.classList.add('is-driving')
    drive(Number(chip.dataset.at), () => root.classList.remove('is-driving'))
  }

  chips.forEach((chip, i) => {
    chip.addEventListener('click', () => chip.getAttribute('aria-checked') !== 'true' && select(chip))
    chip.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (d === undefined) return
      e.preventDefault()
      select(chips[(i + d + chips.length) % chips.length], true)
    })
  })

  // Один заход при загрузке. Прорисовку схемы и появление ответа задаёт CSS (site-hero.css):
  // машина видна с 0,9 с, ответ — с 2,4 с. Скрипт за это время довозит её от старта до первого поворота.
  if (reduceMotion) return
  at = 0
  placeCar(0)
  window.setTimeout(() => drive(Number(chips[0].dataset.at), () => {}, 1500), 900)
}

applySession()
document.querySelectorAll<HTMLElement>('[data-demo]').forEach(setupDemo)
