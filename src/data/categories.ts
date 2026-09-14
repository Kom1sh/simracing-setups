import type { CategoryId, EnginePosition } from './types'

export const categories: { id: CategoryId; label: string; note?: string }[] = [
  { id: 'gt3', label: 'GT3' },
  { id: 'gt4', label: 'GT4', note: 'Для GT4 пока используется шаблон регулировок GT3.' },
  { id: 'gt2', label: 'GT2', note: 'Для GT2 пока используется шаблон регулировок GT3.' },
  { id: 'cup', label: 'Кубковые', note: 'Для кубковых машин пока используется шаблон регулировок GT3.' },
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
