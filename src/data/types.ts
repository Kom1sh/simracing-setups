export type Direction = 'cw' | 'ccw' | 'fig8'

export interface Track {
  id: string
  name: string
  nameOriginal: string
  country: string
  layout: string
  lengthKm: number
  turns: number | null
  direction: Direction | null
  altitudeM?: number
  viewBox: string
  path: string
  geometrySource: { name: string; url: string; license: string }
  factSources: string[]
  notes?: string
  /** Дорожная трасса или овал: от этого зависит, какие классы на ней ездят */
  kind: TrackKind
  /** Дождь в iRacing разрешён на этой конфигурации */
  rain: boolean
  iracing: { name: string; url: string }
  /** Подписи на схеме (пока у овалов): линия старта, точка сразу после неё — направление, повороты по порядку */
  labels?: { sf: [number, number]; sfNext: [number, number]; turns: [number, number][] }
}

export type TrackKind = 'road' | 'oval'

export type CategoryId = 'nascar' | 'gt3' | 'gt4' | 'cup'

export type EnginePosition = 'front' | 'front-mid' | 'mid' | 'rear'

export interface Car {
  id: string
  category: CategoryId
  brand: string
  model: string
  year: number | null
  engine: { litres: number | null; layout: string | null; aspiration: 'na' | 'turbo' | 'twin-turbo' | null }
  enginePosition: EnginePosition | null
  abs: boolean | null
  tc: boolean | null
  /** У машины в iRacing есть дождевые шины */
  rain: boolean
  iracing: { name: string; url: string }
  sources: string[]
  notes?: string
}

/** Значение регулировки: число, пара перед/зад, четыре колеса ПЛ ПП ЗЛ ЗП или вариант из списка */
export type ParamValue = number | number[] | string

export interface Range {
  min: number
  max: number
  base: number
}

interface ParamBase {
  id: string
  label: string
  hint?: string
  unit?: string
  /** Что нужно, чтобы регулировка была: ABS или антипробуксовка у машины, дождь у машины и трассы */
  requires?: 'abs' | 'tc' | 'rain'
  /** Значение — разница с базовым сетапом iRacing: показывается со знаком, база — 0 */
  relative?: boolean
  /** Обратная шкала этой машины: больше число — меньше эффекта (мягче амортизатор, меньше помощи ABS) */
  inverted?: boolean
}

export interface ScalarParam extends ParamBase {
  kind: 'scalar'
  range: Range
  step: number
  decimals: number
  /** Своё отображение значения, например время суток */
  format?: 'time' | 'percent-rain'
  presets?: { label: string; value: number }[]
}

export interface AxleParam extends ParamBase {
  kind: 'axle'
  front: Range
  rear: Range
  step: number
  decimals: number
}

export interface CornersParam extends ParamBase {
  kind: 'corners'
  front: Range
  rear: Range
  step: number
  decimals: number
}

export interface ChoiceParam extends ParamBase {
  kind: 'choice'
  options: { value: string; label: string }[]
  base: string
}

export type Param = ScalarParam | AxleParam | CornersParam | ChoiceParam

export interface ParamGroup {
  id: string
  title: string
  description?: string
  params: Param[]
}

export type Values = Record<string, ParamValue>
