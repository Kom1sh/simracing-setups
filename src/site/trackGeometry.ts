/**
 * Точка на схеме трассы по доле длины. Схемы — ломаные из команд M и L,
 * поэтому считаем сами: так работает и при пререндере, где нет SVG-геометрии браузера.
 */

export interface Point {
  x: number
  y: number
}

export interface Polyline {
  points: Point[]
  /** Накопленная длина до каждой вершины */
  lengths: number[]
  total: number
}

export function parsePolyline(d: string): Polyline {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
  const points: Point[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) points.push({ x: nums[i], y: nums[i + 1] })
  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  }
  return { points, lengths, total: lengths[lengths.length - 1] ?? 0 }
}

export function pointAt(line: Polyline, fraction: number): Point {
  const f = ((fraction % 1) + 1) % 1
  const target = f * line.total
  let i = 1
  while (i < line.lengths.length - 1 && line.lengths[i] < target) i++
  const a = line.points[i - 1]
  const b = line.points[i]
  const seg = line.lengths[i] - line.lengths[i - 1] || 1
  const t = (target - line.lengths[i - 1]) / seg
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}
