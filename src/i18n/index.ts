import ko from './locales/ko.json'
import en from './locales/en.json'
import zh from './locales/zh.json'
import ja from './locales/ja.json'
import { usePreferencesStore } from '../features/ui/preferences-store'
import type { Locale } from './types'

export const localeOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
] satisfies Array<{ value: Locale; label: string }>

const resources = {
  ko,
  en,
  zh,
  ja,
} as const

type TranslationValues = Record<string, string | number>

function readPath(source: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment]
    }

    return undefined
  }, source)

  return typeof value === 'string' ? value : undefined
}

function interpolate(message: string, values?: TranslationValues) {
  if (!values) {
    return message
  }

  return Object.entries(values).reduce(
    (current, [key, value]) => current.replaceAll(`{{${key}}}`, String(value)),
    message,
  )
}

export function translate(locale: Locale, key: string, values?: TranslationValues) {
  const message = readPath(resources[locale], key) ?? readPath(resources.ko, key) ?? key
  return interpolate(message, values)
}

export function useI18n() {
  const locale = usePreferencesStore((state) => state.locale)
  const setLocale = usePreferencesStore((state) => state.setLocale)

  return {
    locale,
    setLocale,
    t: (key: string, values?: TranslationValues) => translate(locale, key, values),
  }
}
