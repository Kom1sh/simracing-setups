/**
 * Мини-схемы симптомов. Поворот направо, вид сверху: жёлтая подложка — фаза поворота,
 * пунктир — куда пилот рулит, жёлтая линия — куда едет машина, машинка с жёлтым носом.
 * Торможение, блокировка и удары днищем — своими схемами. Точнее, чем фото: генератор
 * не умеет правильно показать недостаточную и избыточную поворачиваемость.
 */

const ROAD = 'M40 104 L40 62 A30 30 0 0 1 70 32 L170 32'

/** Подсветка фазы: вход — конец прямой и начало дуги, середина — дуга, выход — после дуги */
const ZONES = {
  entry: 'M40 84 L40 62 A30 30 0 0 1 44.3 46.6',
  mid: 'M42 52 A30 30 0 0 1 60 34',
  exit: 'M64 32.6 A30 30 0 0 1 70 32 L104 32',
}

interface Spec {
  zone?: keyof typeof ZONES
  path: string
  car: { x: number; y: number; a: number }
}

const CORNER: Record<string, Spec> = {
  'understeer-entry': { zone: 'entry', path: 'M40 104 L40 70 C40 56 41 44 43 30', car: { x: 43, y: 24, a: 6 } },
  'understeer-mid': { zone: 'mid', path: 'M40 104 L40 62 C40 44 50 26 78 16', car: { x: 84, y: 14, a: 74 } },
  'understeer-exit': { zone: 'exit', path: 'M40 104 L40 62 A30 30 0 0 1 70 32 C88 32 104 26 128 16', car: { x: 134, y: 14, a: 70 } },
  'oversteer-entry': { zone: 'entry', path: 'M40 104 L40 66', car: { x: 41, y: 56, a: 48 } },
  'oversteer-exit': { zone: 'exit', path: 'M40 104 L40 62 A30 30 0 0 1 70 32 L84 32', car: { x: 92, y: 34, a: 130 } },
}

function Car({ x, y, a }: { x: number; y: number; a: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <rect className="sd__car" x={-5} y={-9} width={10} height={18} rx={2} />
      <rect className="sd__nose" x={-5} y={-9} width={10} height={5} rx={2} />
    </g>
  )
}

export function SymptomDiagram({ id }: { id: string }) {
  const spec = CORNER[id]
  if (spec) {
    return (
      <svg className="sd" viewBox="26 6 150 104" aria-hidden="true">
        <path className="sd__road" d={ROAD} />
        {spec.zone && <path className="sd__zone" d={ZONES[spec.zone]} />}
        <path className="sd__planned" d={ROAD} />
        <path className="sd__actual" d={spec.path} />
        <Car {...spec.car} />
      </svg>
    )
  }
  if (id === 'braking') {
    return (
      <svg className="sd" viewBox="26 6 150 104" aria-hidden="true">
        <path className="sd__road" d={ROAD} />
        <path className="sd__zone" d="M40 100 L40 66" />
        <path className="sd__planned" d={ROAD} />
        <path className="sd__actual" d="M40 104 C34 96 46 90 40 82 C34 74 46 70 40 64" />
        <Car x={40} y={60} a={-14} />
      </svg>
    )
  }
  if (id === 'lockups') {
    return (
      <svg className="sd" viewBox="26 6 150 104" aria-hidden="true">
        <path className="sd__road" d={ROAD} />
        <path className="sd__zone" d="M40 96 L40 62" />
        <path className="sd__planned" d={ROAD} />
        <path className="sd__skid" d="M36 92 L36 44 M44 92 L44 44" />
        <Car x={40} y={30} a={0} />
      </svg>
    )
  }
  // Удары днищем: вид сбоку, машина в компрессии, искры из-под днища
  return (
    <svg className="sd" viewBox="40 44 100 62" aria-hidden="true">
      <path className="sd__ground" d="M0 80 L56 80 Q86 96 116 80 L180 80" />
      <g transform="translate(58 58)">
        <path className="sd__body" d="M0 20 L3 13 L18 10 L28 3 L44 3 L54 10 L66 12 L68 20 Z" />
        <rect className="sd__nose" x={62} y={13} width={7} height={6} rx={1} />
        <circle className="sd__wheel" cx={14} cy={21} r={5.5} />
        <circle className="sd__wheel" cx={54} cy={21} r={5.5} />
      </g>
      <path className="sd__sparks" d="M84 88 L76 96 M90 89 L88 100 M96 88 L102 98 M80 86 L70 90" />
    </svg>
  )
}
