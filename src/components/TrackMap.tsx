import { w } from '../i18n/dashboard'
import type { Track } from '../data/types'

export function directionText(track: Track) {
  return track.direction ? w.dir[track.direction] : null
}

/** Схема трассы с названием поверх. В полосе рисуется крупно и прорисовывается при смене трассы. */
export function TrackMap({
  track,
  variant,
  wind,
}: {
  track: Track
  variant: 'hero' | 'tile'
  wind?: { from: number; speed: number; name: string }
}) {
  return (
    <figure className={`track-map track-map--${variant}`}>
      <svg className="track-map__svg" viewBox={track.viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={w.trackMapLabel(track.name)}>
        {variant === 'hero' && <path className="track-map__under" d={track.path} />}
        <path key={variant === 'hero' ? track.id : undefined} className="track-map__line" d={track.path} pathLength={1} />
      </svg>
      <figcaption className="track-map__caption">
        <span className="track-map__name">{track.name}</span>
        {variant === 'tile' && <span className="track-map__country">{track.country}</span>}
      </figcaption>
      {variant === 'hero' && wind && wind.speed > 0 && (
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
      {variant === 'hero' && <span className="track-map__north" aria-hidden="true">{w.north}</span>}
    </figure>
  )
}
