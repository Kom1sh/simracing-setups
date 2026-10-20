import type { CategoryId, EnginePosition, TrackKind } from './types'

export interface Category {
  id: CategoryId
  label: string
  /** На каких трассах класс ездит в iRacing */
  tracks: TrackKind[]
  /** Трасса, на которую переключаемся, если текущая классу не подходит */
  defaultTrack: string
  /** Бак для плана топлива, л */
  tankL: number
  note?: string
}

/** Классы iRacing. NASCAR Next Gen — первым: под него сделаны правила ассистента */
export const categories: Category[] = [
  { id: 'nascar', label: 'NASCAR', tracks: ['oval', 'road'], defaultTrack: 'daytona', tankL: 76, note: 'Next Gen Cup. Бак — 20 галлонов (76 л).' },
  { id: 'gt3', label: 'GT3', tracks: ['road'], defaultTrack: 'spa', tankL: 120 },
  { id: 'gt4', label: 'GT4', tracks: ['road'], defaultTrack: 'spa', tankL: 120 },
  { id: 'cup', label: 'Cup', tracks: ['road'], defaultTrack: 'spa', tankL: 100, note: 'Porsche 911 Cup (992.2) и Ferrari 296 Challenge.' },
]

export const ENGINE_POSITION: Record<EnginePosition, string> = {
  front: 'спереди',
  'front-mid': 'спереди, за передней осью',
  mid: 'за кабиной',
  rear: 'сзади, за задней осью',
}

export const ASPIRATION: Record<string, string> = {
  na: 'атмосферный',
  turbo: 'турбо',
  'twin-turbo': 'битурбо',
}
