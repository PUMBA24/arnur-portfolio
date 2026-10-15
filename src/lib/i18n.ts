import { messages, type Locale } from '@/data/messages';

export type MessageKey = keyof (typeof messages)['ru'];

export const defaultLocale: Locale = 'ru';

export function translate(locale: Locale, key: MessageKey) {
  return messages[locale][key] || messages[defaultLocale][key];
}
