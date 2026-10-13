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
}

export type CategoryId = 'gt3' | 'gt4' | 'gt2' | 'cup'

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
  /** Что нужно машине, чтобы регулировка была: например, ABS */
  requires?: 'abs' | 'tc'
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
