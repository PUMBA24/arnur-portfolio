import type { Metadata } from 'next';
import { Link } from '@/components/Link';
import { AlmatyGreeting } from '@/components/AlmatyGreeting';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
import { faq, processSteps, projects, site } from '@/data/site';
import { posts } from '@/data/posts';

export const metadata: Metadata = {
  title: 'Сайты и интерфейсы для небольших проектов',
  description:
    'Портфолио Арнура, junior frontend-разработчика из Казахстана. Учебные проекты, ориентиры по цене и простой способ обсудить сайт.',
};

export default function HomePage() {
  return (
    <div className="home-page page">
      <section aria-labelledby="home-title" className="hero-slab" id="home">
        <div className="hero-copy">
          <p className="eyebrow">
            <AlmatyGreeting />
          </p>
          <p className={`availability${site.availableForWork ? '' : ' is-busy'}`}>
            <i aria-hidden="true" />
            {site.availableForWork ? 'Сейчас свободен для заказов' : 'Сейчас занят проектом'}
          </p>
          <h1 id="home-title">
            Привет, я <span>{site.name}.</span>
            <br />
            Делаю сайты,
            <br />
            которыми приятно пользоваться.
          </h1>
          <p className="lead">
            Я junior frontend-разработчик. Собираю аккуратные и понятные интерфейсы для небольших
            проектов и бизнеса.
          </p>
          <div className="button-row">
            <a className="button button-primary" href="#projects">
              Смотреть проекты <span aria-hidden="true">↓</span>
            </a>
            <a className="text-link" href="#contact">
              Давайте знакомиться <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div aria-label="Иллюстрация кода и дизайна" className="hero-art" role="img">
          <div aria-hidden="true" className="hero-art-orbit hero-art-orbit-one" />
          <div aria-hidden="true" className="hero-art-orbit hero-art-orbit-two" />
          <div aria-hidden="true" className="hero-art-window">
            <div className="hero-art-window-bar">
              <i />
              <i />
              <i />
            </div>
            <div className="hero-art-code">
              <span>&lt;</span> build <span>/&gt;</span>
            </div>
            <div className="hero-art-rule hero-art-rule-long" />
            <div className="hero-art-rule hero-art-rule-short" />
            <div className="hero-art-sticker">✳</div>
          </div>
          <span className="hero-art-note">Сначала понять задачу</span>
        </div>
        <a aria-label="Листать к разделу обо мне" className="scroll-hint" href="#about">
          <span aria-hidden="true" />
          Листай ниже
        </a>
      </section>

      <Reveal>
        <section aria-labelledby="about-title" className="home-section home-about" id="about">
          <div className="home-section-heading">
            <p className="eyebrow">01 / Немного обо мне</p>
            <h2 id="about-title">
              Хороший сайт — это <span>удобство</span> в деталях.
            </h2>
          </div>
          <div className="home-about-copy">
            <p>
              Мне нравится разбираться в том, как устроен веб, и создавать интерфейсы, которые
              помогают человеку быстро найти нужное. Сейчас я развиваюсь во frontend-разработке и
              делаю учебные проекты, чтобы закреплять знания на практике.
            </p>
            <p>
              Я в начале пути и не называю себя опытным специалистом. Беру небольшие задачи, честно
              обсуждаю объём работы и учусь на каждом этапе.
            </p>
            <Link className="text-link" href="/about">
              Моя история и чему учусь <span aria-hidden="true">↗</span>
            </Link>
            <div aria-label="Технологии, с которыми я работаю" className="skill-list">
              {site.skills.map((skill) => (
                <span className="skill-chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section aria-labelledby="projects-title" className="home-section" id="projects">
          <div className="home-section-title-row">
            <div className="home-section-heading">
              <p className="eyebrow">02 / Практика без выдуманных кейсов</p>
              <h2 id="projects-title">
                Проекты<span>.</span>
              </h2>
            </div>
            <p className="section-note">Учебные концепты для локального бизнеса и сферы услуг.</p>
          </div>
          <div className="grid">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          <p className="portfolio-note">
            Это учебные работы — я не выдаю их за заказы реальных клиентов.
          </p>
          <Link className="text-link" href="/projects">
            Посмотреть проекты и фильтры <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </Reveal>

      <Reveal>
        <section aria-labelledby="services-title" className="home-section" id="services">
          <div className="home-section-heading">
            <p className="eyebrow">03 / С чем могу помочь</p>
            <h2 id="services-title">Небольшие сайты с ясной задачей.</h2>
          </div>
          <div className="service-list">
            <article className="service-item">
              <span className="service-number">01</span>
              <div>
                <h3>Страница для запуска</h3>
                <p>Одна адаптивная страница о продукте, услуге или небольшом мероприятии.</p>
              </div>
              <span className="service-price">от 40 000 ₸</span>
            </article>
            <article className="service-item">
              <span className="service-number">02</span>
              <div>
                <h3>Сайт из нескольких страниц</h3>
                <p>Структурированное представление услуг, команды, работ и контактов.</p>
              </div>
              <span className="service-price">от 80 000 ₸</span>
            </article>
            <article className="service-item">
              <span className="service-number">03</span>
              <div>
                <h3>Правки и доработка</h3>
                <p>Небольшие изменения в существующем интерфейсе после обсуждения кода и объёма.</p>
              </div>
              <span className="service-price">от 5 000 ₸/ч</span>
            </article>
          </div>
          <p className="price-footnote">
            Это ориентиры, а не публичная оферта. Бюджет и фиксированную сумму можно обсудить.
          </p>
          <Link className="text-link" href="/pricing">
            Рассчитать примерную стоимость <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </Reveal>

      <Reveal>
        <section aria-labelledby="process-title" className="home-section" id="process">
          <div className="home-section-heading">
            <p className="eyebrow">04 / Работа без сюрпризов</p>
            <h2 id="process-title">Понятно от первого сообщения до готовой страницы.</h2>
          </div>
          <div className="process-list">
            {processSteps.map((step) => (
              <article className="process-item" key={step.number}>
                <span className="process-number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section aria-labelledby="notes-title" className="home-section" id="notes">
          <div className="home-section-title-row">
            <div className="home-section-heading">
              <p className="eyebrow">05 / Заметки по ходу учёбы</p>
              <h2 id="notes-title">Что я понял на практике.</h2>
            </div>
            <Link className="text-link" href="/blog">
              Все заметки <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="notes-list">
            {posts.slice(0, 2).map((post) => (
              <Link className="note-row" href={'/blog/' + post.slug} key={post.slug}>
                <span>{post.tags[0]}</span>
                <h3>{post.title}</h3>
                <span>{post.readingTimeMinutes} мин. ↗</span>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section aria-labelledby="faq-title" className="home-section home-faq" id="faq">
          <div className="home-section-title-row">
            <div className="home-section-heading">
              <p className="eyebrow">06 / До начала работы</p>
              <h2 id="faq-title">Частые вопросы.</h2>
            </div>
            <Link className="text-link" href="/faq">
              Все ответы <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="home-faq-list">
            {faq.slice(0, 3).map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p className="faq-answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      <section aria-labelledby="contact-title" className="home-contact" id="contact">
        <div>
          <p className="eyebrow">07 / Контакт</p>
          <h2 id="contact-title">
            Есть интересный проект? <span>Напишите.</span>
          </h2>
          <p className="lead">
            Расскажите, что хотите сделать. Вместе оценим объём и поймём, подхожу ли я для этой
            задачи.
          </p>
        </div>
        <div className="home-contact-actions">
          <a className="button button-primary" href="mailto:arnurmedetuly777@gmail.com">
            Написать на email <span aria-hidden="true">↗</span>
          </a>
          <Link className="text-link" href="/contact">
            Заполнить форму заявки
          </Link>
          <p>arnurmedetuly777@gmail.com</p>
        </div>
      </section>
    </div>
  );
}
