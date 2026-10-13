/**
 * Поворот направо, вид сверху. Пунктир — куда пилот рулит, сплошная — куда на самом деле едет машина.
 * Недостаточная: траектория уходит наружу поворота. Избыточная: машину заворачивает внутрь, корпус развёрнут к траектории.
 */

const ROAD = 'M80 250 L80 140 A80 80 0 0 1 160 60 L330 60'

const PATHS = {
  understeer: { line: 'M80 250 L80 150 C79 104 96 62 150 36 L190 24', car: { x: 196, y: 22, angle: 74 } },
  oversteer: { line: 'M80 250 L80 150 C82 126 98 108 126 98 L144 93', car: { x: 152, y: 91, angle: 118 } },
}

export function HandlingDiagram({ kind, title }: { kind: 'understeer' | 'oversteer'; title: string }) {
  const p = PATHS[kind]
  return (
    <svg className="handling__svg" viewBox="0 0 320 250" role="img" aria-label={title}>
      <path className="handling__road" d={ROAD} />
      <path className="handling__edge" d={ROAD} />
      <path className="handling__planned" d={ROAD} />
      <path className="handling__actual" d={p.line} />
      <g transform={`translate(${p.car.x} ${p.car.y}) rotate(${p.car.angle})`}>
        <rect className="handling__car" x={-8} y={-14} width={16} height={28} />
        <rect className="handling__nose" x={-8} y={-14} width={16} height={7} />
      </g>
    </svg>
  )
}
