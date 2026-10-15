export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  readingTimeMinutes: number;
};

export const posts: BlogPost[] = [
  {
    slug: 'first-responsive-page',
    title: 'Что я проверяю в мобильной версии сайта',
    description:
      'Мой короткий список проверок: от ширины экрана до размера кнопок и длинных заголовков.',
    tags: ['Адаптивность', 'Практика'],
    readingTimeMinutes: 3,
  },
  {
    slug: 'accessible-forms',
    title: 'Формы, которыми удобно пользоваться с клавиатуры',
    description:
      'Почему подпись поля, видимый фокус и понятная ошибка важнее красивого плейсхолдера.',
    tags: ['Доступность', 'Формы'],
    readingTimeMinutes: 4,
  },
  {
    slug: 'learning-react',
    title: 'Как я учусь React: от маленького компонента к странице',
    description: 'Как разбиваю интерфейс на части, чтобы легче понимать и менять собственный код.',
    tags: ['React', 'Обучение'],
    readingTimeMinutes: 3,
  },
];
