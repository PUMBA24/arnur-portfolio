export const messages = {
  ru: { home: 'Главная', projects: 'Проекты', contact: 'Обсудим ваш сайт' },
  kz: { home: 'Басты бет', projects: 'Жобалар', contact: 'Сайтыңызды талқылайық' },
  en: { home: 'Home', projects: 'Projects', contact: 'Let’s discuss your website' },
} as const;
export type Locale = keyof typeof messages;
