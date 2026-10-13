import { locale } from './locale'
import { ru } from './dashboard.ru'
import { en } from './dashboard.en'
import { widgetsRu } from './widgets.ru'
import { widgetsEn } from './widgets.en'
import { assistantRu } from './assistant.ru'
import { assistantEn } from './assistant.en'

/** Строки кабинета на языке страницы: t — экран целиком, w — компоненты */
export const t = locale === 'ru' ? ru : en
export const w = locale === 'ru' ? widgetsRu : widgetsEn

/** a — ассистент */
export const a = locale === 'ru' ? assistantRu : assistantEn
