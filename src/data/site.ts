import { contactEmail } from './contact';

export const site = {
  name: 'Арнур',
  role: 'Junior frontend-разработчик',
  location: 'Алматы, Казахстан',
  email: contactEmail,
  telegram: '[ВАШ TELEGRAM]',
  whatsapp: '+7 747 906 70 52',
  availableForWork: true,
  skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'],
} as const;

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  challenge: string;
  solution: string;
  outcome: string;
  improve: string;
  stack: string[];
  image: string;
  imageAlt: string;
  accent: string;
  preview: {
    brand: string;
    navigation: string[];
    eyebrow: string;
    headline: string;
    summary: string;
    action: string;
    theme: 'coffee' | 'fitness' | 'interior';
  };
};

export const projects: Project[] = [
  {
    slug: 'sary-arqa',
    title: 'Sary Arqa Coffee',
    category: 'Сайт кофейни',
    description: 'Демо-концепт сайта кофейни с меню и атмосферной подачей.',
    challenge: 'Помочь гостю быстро понять характер места и найти нужную информацию.',
    solution: 'Собрал выразительную главную страницу, выделил меню и контакты.',
    outcome: 'Учебный проект: адаптивный интерфейс на React и CSS.',
    improve: 'Подключил бы редактируемое меню и настоящую форму бронирования.',
    stack: ['React', 'CSS', 'Адаптивная вёрстка'],
    image: '/projects/sary-arqa.jpg',
    imageAlt: 'Светлый интерьер кофейни с деревянной мебелью',
    accent: '#e8d6bd',
    preview: {
      brand: 'SARY ARQA',
      navigation: ['Меню', 'О кофейне', 'Контакты'],
      eyebrow: 'Кофе и тишина в центре города',
      headline: 'Найди свой ритм',
      summary: 'Спешелти кофе, свежая выпечка и уютные разговоры.',
      action: 'Наше меню',
      theme: 'coffee',
    },
  },
  {
    slug: 'forma-studio',
    title: 'Forma Studio',
    category: 'Сайт студии тренировок',
    description: 'Демо-концепт сайта фитнес-студии с понятной записью на занятие.',
    challenge: 'Показать направления занятий и сделать запись понятным следующим шагом.',
    solution: 'Разложил предложения по секциям и добавил заметный сценарий записи.',
    outcome: 'Учебный проект: концепт интерфейса для локальной студии.',
    improve: 'Добавил бы расписание и интеграцию с календарём.',
    stack: ['React', 'CSS', 'UI'],
    image: '/projects/forma-studio.jpg',
    imageAlt: 'Зал для тренировок с современным оборудованием',
    accent: '#dfe8cf',
    preview: {
      brand: 'FORMA / TRAINING CLUB',
      navigation: ['Тренировки', 'Команда', 'Расписание'],
      eyebrow: 'Тренируйся в своём темпе',
      headline: 'Сильнее каждый день.',
      summary: 'Персональные и групповые тренировки для реальной жизни.',
      action: 'Записаться',
      theme: 'fitness',
    },
  },
  {
    slug: 'jaryq-interior',
    title: 'Jaryq Interior',
    category: 'Сайт интерьерной студии',
    description: 'Демо-концепт портфолио интерьерной студии.',
    challenge: 'Дать работам пространство и привести посетителя к заявке.',
    solution: 'Построил страницу вокруг изображений и кратко описал услуги.',
    outcome: 'Учебный проект: адаптивная галерея и презентационная страница.',
    improve: 'Добавил бы фильтрацию кейсов и CMS для команды.',
    stack: ['React', 'CSS', 'Галерея'],
    image: '/projects/jaryq-interior.jpg',
    imageAlt: 'Современный интерьер в спокойных натуральных оттенках',
    accent: '#e4e0d6',
    preview: {
      brand: 'JARYQ INTERIORS',
      navigation: ['Проекты', 'Студия', 'Услуги'],
      eyebrow: 'Интерьеры с характером',
      headline: 'Пространство, в котором ты дома.',
      summary: 'Проектируем спокойные и выразительные интерьеры для жизни.',
      action: 'Смотреть проекты',
      theme: 'interior',
    },
  },
];

export const processSteps = [
  {
    number: '01',
    title: 'Разбираемся в задаче',
    description: 'Уточняем, для кого сайт, что он должен объяснить и какие материалы уже есть.',
  },
  {
    number: '02',
    title: 'Договариваемся',
    description:
      'Фиксируем объём, срок и стоимость до начала работы. Без внезапных пунктов в счёте.',
  },
  {
    number: '03',
    title: 'Собираю и проверяю',
    description:
      'Показываю промежуточный результат, проверяю мобильную версию и вношу согласованные правки.',
  },
] as const;

export const faq = [
  {
    question: 'Сколько стоит сайт?',
    answer:
      'Ориентиры и калькулятор есть на странице цен. Итоговую сумму согласуем после обсуждения объёма и материалов.',
  },
  {
    question: 'Вы уже работали с реальными заказчиками?',
    answer:
      'Пока мои работы — учебные концепты, это отмечено в карточках проектов. Я junior-разработчик и не выдаю учебные примеры за клиентские заказы.',
  },
  {
    question: 'Как начинается работа?',
    answer:
      'С короткого разговора о задаче. После него я описываю объём, срок и стоимость, и только после согласования начинаю работу.',
  },
  {
    question: 'Можно ли попросить правки?',
    answer:
      'Да. Мы заранее фиксируем, какие правки входят в работу. Дополнительные изменения обсуждаем отдельно; ориентир — от 5 000 ₸ за час.',
  },
  {
    question: 'Вы работаете только в Алматы?',
    answer: 'Я нахожусь в Алматы, но могу обсуждать и выполнять задачи удалённо.',
  },
] as const;
