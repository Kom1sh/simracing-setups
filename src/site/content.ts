import type { Locale } from '../i18n/locale'
import { en } from './content.en'
import { ru } from './content.ru'

/** Пример в шапке: жалоба пилота и ответ ассистента в том же виде, что в кабинете */
export interface HeroExample {
  id: string
  chip: string
  complaint: string
  param: string
  direction: 'increase' | 'decrease'
  action: string
  effect: string
  watch: string
  rule: string
}

export interface LandingContent {
  meta: { title: string; description: string; ogAlt: string; siteName: string }
  nav: { skip: string; how: string; symptoms: string; faq: string; login: string; signup: string; dashboard: string; language: string }
  hero: {
    title: string
    sub: string
    lead: string
    cta: string
    secondary: string
    login: string
    note: string
    examplesLabel: string
    complaintLabel: string
    answerLabel: string
    effect: string
    watch: string
    checked: string
    directions: { increase: string; decrease: string }
    photoAlt: string
    examples: HeroExample[]
  }
  demo: { title: string; intro: string }
  about: { title: string; paragraphs: string[]; photoAlt: string; card: { label: string; text: string } }
  how: { title: string; intro: string; steps: { title: string; text: string }[] }
  handling: {
    title: string
    intro: string
    planned: string
    actual: string
    items: { id: 'understeer' | 'oversteer'; title: string; text: string }[]
  }
  symptoms: { title: string; intro: string; paramsLabel: string; items: { id: string; title: string; text: string; params: string[] }[] }
  rules: { title: string; intro: string; items: { title: string; text: string }[] }
  numbers: { title: string; intro: string; rows: { value: string; text: string }[]; source: string }
  preview: { title: string; text: string; points: string[]; alt: string; cta: string }
  faq: { title: string; items: { q: string; a: string }[] }
  final: { title: string; text: string; cta: string; photoAlt: string }
  footer: { project: string; code: string; data: string }
}

export const content: Record<Locale, LandingContent> = { en, ru }
