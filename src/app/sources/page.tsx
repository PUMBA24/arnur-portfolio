import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Лицензии и источники',
  description: 'Список открытых технологий, шрифтов и источников изображений.',
};

const sources = [
  {
    label: 'Системный шрифт устройства',
    href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font-family',
    licence: 'Предустановлен в операционной системе',
  },
  {
    label: 'Unsplash — лицензия на фотографии',
    href: 'https://unsplash.com/license',
    licence: 'Условия использования Unsplash',
  },
];

export default function SourcesPage() {
  return (
    <div className="page reading">
      <p className="eyebrow">Прозрачность</p>
      <h1>Лицензии и источники</h1>
      <p>
        Тексты, интерфейсные элементы и дизайн-концепты проектов подготовлены для этого учебного
        портфолио. Изображения проектов находятся в `public/projects/`. Перед публикацией проверьте
        их исходный источник и право на повторное использование.
      </p>
      <ul>
        {sources.map((source) => (
          <li key={source.href}>
            <a href={source.href} rel="noreferrer" target="_blank">
              {source.label} ↗
            </a>{' '}
            — {source.licence}
          </li>
        ))}
        <li>Иконки и иллюстративные элементы интерфейса нарисованы средствами HTML и CSS.</li>
      </ul>
    </div>
  );
}
