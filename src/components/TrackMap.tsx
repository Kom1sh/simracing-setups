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

/** Схема трассы с названием поверх. В полосе — крупно, со стрелками движения, стартом/финишем и номерами поворотов */
export function TrackMap({
  track,
  variant,
  wind,
}: {
  track: Track
  variant: 'hero' | 'tile'
  wind?: { from: number; speed: number; name: string }
}) {
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
      <svg className="track-map__svg" viewBox={track.viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={w.trackMapLabel(track.name)}>
        {hero && <path className="track-map__under" d={track.path} />}
        <path key={hero ? track.id : undefined} className="track-map__line" d={track.path} pathLength={1} />
      </svg>
      <figcaption className="track-map__caption">
        <span className="track-map__name">{track.name}</span>
        {variant === 'tile' && <span className="track-map__country">{track.country}</span>}
      </figcaption>
      {geo && (
        <svg className="track-map__svg track-map__overlay" viewBox={track.viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            {geo.arrows.map((a, i) => (
              <path key={i} className="track-map__arrow" d="M-12 -10 L6 0 L-12 10" transform={`translate(${a.p[0]} ${a.p[1]}) rotate(${a.angle})`} />
            ))}
            {geo.sf && (
              <g transform={`translate(${geo.sf[0]} ${geo.sf[1]}) rotate(${geo.sfAngle})`}>
                <rect className="track-map__sf" x={-4} y={-22} width={8} height={44} />
              </g>
            )}
            {geo.sf && (
              <text className="track-map__sf-label" {...textAt(outward(geo.sf, geo.c, 62))}>
                {w.startFinish}
              </text>
            )}
            {geo.turns.map((t, i) => {
              const [x, y] = outward(t, geo.c, 52)
              return (
                <g key={i} className="track-map__turn" transform={`translate(${x} ${y})`}>
                  <circle r={22} />
                  <text dy="0.35em">{i + 1}</text>
                </g>
              )
            })}
        </svg>
      )}
      {hero && wind && wind.speed > 0 && (
        <div className="wind" aria-label={w.windLabel(wind.speed, wind.name)}>
          {/* Стрелка нарисована вниз (на юг); ветер «откуда» X дует в сторону X + 180°, поэтому поворот ровно на X */}
          <svg viewBox="0 0 40 40" aria-hidden="true" style={{ transform: `rotate(${wind.from}deg)` }}>
            <path d="M20 6v26M12 24l8 8 8-8" />
          </svg>
          <span>
            {wind.speed} {w.kmh}
            <br />
            {wind.name}
          </span>
        </div>
      )}
      {hero && <span className="track-map__north" aria-hidden="true">{w.north}</span>}
    </figure>
  )
}

function textAt(p: Pt) {
  return { x: p[0], y: p[1], textAnchor: 'middle' as const, dominantBaseline: 'middle' as const }
}
