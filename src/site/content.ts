import type { Locale } from '../i18n/locale'
import { en } from './content.en'
import { ru } from './content.ru'

/** Пример в шапке: машина доезжает до поворота, пилот жалуется, ассистент отвечает */
export interface HeroDemo {
  id: string
  chip: string
  corner: string
  /** Доля длины схемы Спа, где стоит поворот (0 — линия старта) */
  at: number
  quote: string
  param: string
  change: string
  effect: string
  watch: string
}

export interface LandingContent {
  meta: { title: string; description: string; ogAlt: string; siteName: string }
  nav: { skip: string; how: string; symptoms: string; faq: string; login: string; signup: string; dashboard: string; language: string }
  hero: { title: string; lead: string; cta: string; login: string; note: string; demoLabel: string; chipsLabel: string; you: string; assistant: string; effect: string; watch: string; demos: HeroDemo[] }
  how: { title: string; intro: string; steps: { title: string; text: string }[] }
  symptoms: { title: string; intro: string; paramsLabel: string; items: { id: string; title: string; text: string; params: string[] }[] }
  rules: { title: string; intro: string; items: { title: string; text: string }[] }
  numbers: { title: string; intro: string; rows: { value: string; text: string }[]; source: string }
  preview: { title: string; text: string; points: string[]; alt: string; cta: string }
  faq: { title: string; items: { q: string; a: string }[] }
  final: { title: string; text: string; cta: string }
  footer: { project: string; code: string; data: string }
}

export const content: Record<Locale, LandingContent> = { en, ru }
