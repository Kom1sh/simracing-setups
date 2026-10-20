import { useMemo } from 'react'
import { w } from '../i18n/dashboard'
import type { Track } from '../data/types'
import { centroid, outward, parsePath, pointsAlong, signedArea, type Pt } from '../lib/trackGeometry'

export function directionText(track: Track) {
  return track.direction ? w.dir[track.direction] : null
}

/** Стрелки направления движения: ориентация рисунка — по площади контура, направление — из данных трассы */
function arrows(track: Track, pts: Pt[]) {
  if (track.direction !== 'cw' && track.direction !== 'ccw') return []
  const drawnCw = signedArea(pts) > 0
  const flip = drawnCw !== (track.direction === 'cw')
  return pointsAlong(pts, [0.12, 0.37, 0.62, 0.87]).map((a) => ({ ...a, angle: a.angle + (flip ? 180 : 0) }))
}

/** Схема трассы с названием под ней. В полосе — крупно, со стрелками движения, стартом/финишем и номерами поворотов */
export function TrackMap({ track, variant }: { track: Track; variant: 'hero' | 'tile' }) {
  const hero = variant === 'hero'
  const geo = useMemo(() => {
    if (!hero) return null
    const pts = parsePath(track.path)
    const c = centroid(pts)
    const sf = track.labels?.sf
    const next = track.labels?.sfNext
    const sfAngle = sf && next ? (Math.atan2(next[1] - sf[1], next[0] - sf[0]) * 180) / Math.PI : 0
    return { arrows: arrows(track, pts), c, sf, sfAngle, turns: track.labels?.turns ?? [] }
  }, [hero, track])

  return (
    <figure className={`track-map track-map--${variant}`}>
      <div className="track-map__stage">
      <svg className="track-map__svg" viewBox={track.viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={w.trackMapLabel(track.name)}>
        {hero && <path className="track-map__under" d={track.path} />}
        <path key={hero ? track.id : undefined} className="track-map__line" d={track.path} pathLength={1} />
      </svg>
      {geo && (
        <svg className="track-map__svg track-map__overlay" viewBox={track.viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {/* .track-map__k увеличивает отметку и её отступ от трассы на узких экранах, где схема мельче */}
          {geo.arrows.map((a, i) => (
            <g key={i} transform={`translate(${a.p[0]} ${a.p[1]}) rotate(${a.angle})`}>
              <path className="track-map__arrow track-map__k" d="M-12 -10 L6 0 L-12 10" />
            </g>
          ))}
          {geo.sf && (
            <g transform={`translate(${geo.sf[0]} ${geo.sf[1]}) rotate(${geo.sfAngle})`}>
              <rect className="track-map__sf track-map__k" x={-4} y={-22} width={8} height={44} />
            </g>
          )}
          {geo.sf && (
            <g transform={`translate(${geo.sf[0]} ${geo.sf[1]})`}>
              <g className="track-map__k">
                <text className="track-map__sf-label" {...textAt(offset(geo.sf, geo.c, 62))}>
                  {w.startFinish}
                </text>
              </g>
            </g>
          )}
          {geo.turns.map((t, i) => {
            const [dx, dy] = offset(t, geo.c, 52)
            return (
              <g key={i} transform={`translate(${t[0]} ${t[1]})`}>
                <g className="track-map__k">
                  <g className="track-map__turn" transform={`translate(${dx} ${dy})`}>
                    <circle r={22} />
                    <text dy="0.35em">{i + 1}</text>
                  </g>
                </g>
              </g>
            )
          })}
        </svg>
      )}
      </div>
      <figcaption className="track-map__caption">
        <span className="track-map__name">{track.name}</span>
        {variant === 'tile' && <span className="track-map__country">{track.country}</span>}
      </figcaption>
      {hero && <span className="track-map__north" aria-hidden="true">{w.north}</span>}
    </figure>
  )
}

function textAt(p: Pt) {
  return { x: p[0], y: p[1], textAnchor: 'middle' as const, dominantBaseline: 'middle' as const }
}

/** Сдвиг от точки трассы наружу от центра схемы — как вектор, чтобы масштаб увеличивал и отступ */
function offset(p: Pt, center: Pt, by: number): Pt {
  const q = outward(p, center, by)
  return [q[0] - p[0], q[1] - p[1]]
}
