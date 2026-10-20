/** Геометрия схемы трассы: точки контура, ориентация рисунка, точки и касательные вдоль пути */

export type Pt = [number, number]

export function parsePath(d: string): Pt[] {
  const out: Pt[] = []
  for (const m of d.matchAll(/[ML]\s*(-?[\d.]+)[ ,](-?[\d.]+)/g)) out.push([Number(m[1]), Number(m[2])])
  return out
}

/** Площадь по формуле шнурков в экранных координатах (y вниз): больше нуля — рисунок идёт по часовой */
export function signedArea(pts: Pt[]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    s += x1 * y2 - x2 * y1
  }
  return s / 2
}

export function centroid(pts: Pt[]): Pt {
  const n = pts.length || 1
  return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n]
}

/** Точки на долях длины замкнутого контура с углом касательной, в градусах */
export function pointsAlong(pts: Pt[], fractions: number[]): { p: Pt; angle: number }[] {
  const n = pts.length
  const seg = pts.map((p, i) => Math.hypot(pts[(i + 1) % n][0] - p[0], pts[(i + 1) % n][1] - p[1]))
  const total = seg.reduce((s, x) => s + x, 0)
  return fractions.map((f) => {
    let left = f * total
    let i = 0
    while (i < n - 1 && left > seg[i]) left -= seg[i++]
    const a = pts[i]
    const b = pts[(i + 1) % n]
    const t = seg[i] ? left / seg[i] : 0
    return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI }
  })
}

/** Точка, отодвинутая от центра схемы — чтобы подпись не легла на линию трассы */
export function outward(p: Pt, center: Pt, by: number): Pt {
  const dx = p[0] - center[0]
  const dy = p[1] - center[1]
  const len = Math.hypot(dx, dy) || 1
  return [p[0] + (dx / len) * by, p[1] + (dy / len) * by]
}
