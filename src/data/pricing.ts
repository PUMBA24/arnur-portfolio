export type WebsiteType = 'landing' | 'multi-page' | 'store' | 'updates';
export type ExtraFeature = 'form' | 'cms' | 'store' | 'multilingual' | 'animations';

export const websiteTypes: {
  value: WebsiteType;
  label: string;
  startingPrice: number;
  startingDays: number;
  description: string;
}[] = [
  {
    value: 'landing',
    label: 'Лендинг',
    startingPrice: 40_000,
    startingDays: 7,
    description: 'Одна страница с понятным предложением и контактами.',
  },
  {
    value: 'multi-page',
    label: 'Многостраничный сайт',
    startingPrice: 80_000,
    startingDays: 14,
    description: 'Несколько страниц для услуг, команды или каталога.',
  },
  {
    value: 'store',
    label: 'Магазин или каталог',
    startingPrice: 150_000,
    startingDays: 21,
    description: 'Каталог товаров или демо-витрина с согласованным объёмом.',
  },
  {
    value: 'updates',
    label: 'Правки и доработка',
    startingPrice: 5_000,
    startingDays: 1,
    description: 'Почасовая оценка небольших изменений — от 5 000 ₸/час.',
  },
];

export const extraFeatures: {
  value: ExtraFeature;
  label: string;
  price: number;
  days: number;
}[] = [
  { value: 'form', label: 'Форма обратной связи', price: 10_000, days: 2 },
  { value: 'cms', label: 'Подключение CMS', price: 35_000, days: 5 },
  { value: 'store', label: 'Функции интернет-магазина', price: 80_000, days: 12 },
  { value: 'multilingual', label: 'Ещё один язык', price: 20_000, days: 4 },
  { value: 'animations', label: 'Анимации интерфейса', price: 15_000, days: 3 },
];

export const formatTenge = (amount: number) =>
  new Intl.NumberFormat('ru-KZ', {
    maximumFractionDigits: 0,
  }).format(amount) + ' ₸';
