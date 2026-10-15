import type { Metadata } from 'next';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Обо мне',
  description: 'Кто я, с какими задачами могу помочь и чему учусь как junior-разработчик.',
};

export default function AboutPage() {
  return (
    <article className="page reading">
      <p className="eyebrow">Знакомство</p>
      <h1>Я {site.name} — начинающий веб-разработчик.</h1>
      <p className="lead">
        Живу в Казахстане и развиваюсь во frontend-разработке. Мне нравится превращать идею в ясный
        интерфейс, где человеку легко найти нужное.
      </p>

      <section className="section">
        <h2>Честно о моём уровне</h2>
        <p>
          Я junior. Работы в портфолио — учебные концепты, а не коммерческие запуски. Берусь за
          задачи, объём которых могу оценить, и заранее обсуждаю риски и сроки. Если потребуется
          опыт, которого у меня пока нет, скажу об этом прямо.
        </p>
      </section>

      <section className="section">
        <h2>Что умею</h2>
        <p>
          Верстаю адаптивные интерфейсы, работаю с React и JavaScript, изучаю TypeScript,
          доступность и основы серверной разработки.
        </p>
        <div aria-label="Мои технологии" className="project-tags">
          {site.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Чему учусь сейчас</h2>
        <p>
          Углубляю TypeScript, Next.js App Router, валидацию форм и проектирование небольших API.
          Учусь оценивать задачу до начала работы и проверять интерфейс с клавиатуры и на разных
          экранах.
        </p>
      </section>
    </article>
  );
}
