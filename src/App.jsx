import { useEffect, useState } from 'react';
import './App.css';

const skills = ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'];

function BrandLogo() {
  return (
    <a className="brand-logo" href="#home" aria-label="Арнур — на главную">
      <svg className="brand-logo-mark" viewBox="0 0 44 44" aria-hidden="true">
        <rect width="44" height="44" rx="13" fill="#26392d" />
        <path d="M11 31.5 20.2 12h4.2l9.1 19.5h-5.1l-2-4.5H18l-2 4.5H11Zm8.8-8.4h4.8l-2.4-5.5-2.4 5.5Z" fill="#fbfaf7" />
        <path d="m27.7 12 5.8 5.8-3.1 3.1-5.8-5.8z" fill="#d7fa63" />
      </svg>
      <span className="brand-logo-name">arnur<span>.</span></span>
    </a>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [isProjectCarouselPaused, setIsProjectCarouselPaused] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    fetch('/api/projects')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Не получилось загрузить проекты.');
        }

        return response.json();
      })
      .then((items) => {
        if (isCurrent) {
          setProjects(items);
          setIsLoadingProjects(false);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setProjectsError(error.message);
          setIsLoadingProjects(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (projects.length < 2 || isProjectCarouselPaused || prefersReducedMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveProjectIndex((currentIndex) => (currentIndex + 1) % projects.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [isProjectCarouselPaused, projects.length]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    setFormMessage(null);

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    try {
      const emailResponse = await fetch('https://formsubmit.co/ajax/arnurmedetuly777@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          ...values,
          _subject: `Новое сообщение с портфолио от ${values.name}`,
          _replyto: values.email,
          _template: 'table',
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Не удалось отправить письмо. Попробуйте позже.');
      }

      const emailResult = await emailResponse.json();
      if (emailResult.success !== 'true' && emailResult.success !== true) {
        throw new Error(emailResult.message || 'Сервис не подтвердил отправку письма.');
      }

      let archiveFailed = false;
      try {
        const archiveResponse = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        archiveFailed = !archiveResponse.ok;
      } catch (error) {
        console.error('Не удалось сохранить резервную копию сообщения:', error);
        archiveFailed = true;
      }

      if (archiveFailed) {
        console.error('Сообщение отправлено по почте, но резервная копия не сохранена.');
      }
      form.reset();
      setFormMessage({
        type: 'success',
        text: archiveFailed
          ? 'Сообщение отправлено на почту, но резервную копию сохранить не удалось.'
          : 'Спасибо! Сообщение отправлено на почту.',
      });
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error.message || 'Не удалось подключиться к сервису отправки почты.',
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <BrandLogo />
        <nav className="navigation" aria-label="Основная навигация">
          <a href="#about">Обо мне</a>
          <a href="#projects">Проекты</a>
          <a className="nav-contact" href="#contact">Связаться <span>↗</span></a>
        </nav>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span className="availability-dot" /> Открыт к предложениям</p>
            <h1>Привет, я <span>Арнур.</span><br />Создаю сайты,<br />которыми приятно<br className="mobile-break" /> пользоваться.</h1>
            <p className="hero-description">
              Начинающий frontend-разработчик. Превращаю идеи в быстрые,
              удобные и аккуратные интерфейсы.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">Смотреть проекты <span>↓</span></a>
              <a className="text-link" href="#contact">Давайте знакомиться <span>↗</span></a>
            </div>
          </div>
          <div className="hero-art" aria-label="Декоративная иллюстрация: код и дизайн">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-sticker">DESIGN<br />&amp; CODE</div>
            <div className="art-card">
              <div className="art-window"><span /><span /><span /></div>
              <div className="art-line art-line-long" />
              <div className="art-line art-line-short" />
              <div className="art-code"><span>&lt;</span> build<span> /&gt;</span></div>
              <div className="art-badge">✳</div>
            </div>
            <span className="art-sparkle sparkle-one">✳</span>
            <span className="art-sparkle sparkle-two">✦</span>
            <span className="art-caption">С вниманием<br />к каждой детали</span>
          </div>
          <a className="scroll-hint" href="#about"><span /> Листай ниже</a>
        </section>

        <section className="about section-wrap" id="about">
          <div className="section-heading">
            <p className="eyebrow">01 / Немного обо мне</p>
            <h2>Хороший сайт —<br />это <span>удобство</span> в деталях.</h2>
          </div>
          <div className="about-copy">
            <p>
              Мне нравится разбираться в том, как устроен веб, и создавать
              интерфейсы, которые делают сложное простым. Сейчас я развиваюсь
              во frontend-разработке, изучаю современные инструменты и создаю
              собственные проекты.
            </p>
            <p>
              Ищу команду, где смогу расти, быть полезным и каждый день
              создавать что-то настоящее.
            </p>
            <div className="skill-list" aria-label="Технологии">
              {skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}
            </div>
          </div>
        </section>

        <section className="projects section-wrap" id="projects">
          <div className="projects-heading">
            <div className="section-heading">
              <p className="eyebrow">02 / Избранное</p>
              <h2>Проекты<span>.</span></h2>
            </div>
            <p className="section-note">Концепты сайтов для локального бизнеса<br />и сферы услуг.</p>
          </div>

          {projectsError ? (
            <p className="projects-message" role="alert">{projectsError} Запустите backend командой <code>npm run dev:api</code>.</p>
          ) : isLoadingProjects ? (
            <p className="projects-message" role="status">Загружаю проекты…</p>
          ) : projects.length === 0 ? (
            <p className="projects-message" role="status">Добавьте проекты в <code>shared/projects.js</code>, чтобы показать их здесь.</p>
          ) : (
            <div
              className="project-carousel"
              onMouseEnter={() => setIsProjectCarouselPaused(true)}
              onMouseLeave={() => setIsProjectCarouselPaused(false)}
              onFocus={() => setIsProjectCarouselPaused(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsProjectCarouselPaused(false);
                }
              }}
            >
              {(() => {
                const project = projects[activeProjectIndex] ?? projects[0];
                const index = projects.indexOf(project);

                return (
                  <article className="project-slide" key={project.id} aria-live="off">
                    <div className={`project-shot-wrap project-shot-wrap--${project.visual}`}>
                      <div className={`project-website project-website--${project.visual}`}>
                        <header className="project-site-nav">
                          <span className="project-site-logo">{project.logo}</span>
                          <nav aria-label={`Навигация сайта ${project.title}`}>
                            {project.navigation.map((item) => <span key={item}>{item}</span>)}
                          </nav>
                          <span className="project-site-action">{project.action}</span>
                        </header>
                        <div className="project-site-hero">
                          <img className="project-photo" src={project.photo} alt={project.photoAlt} />
                          <div className="project-site-copy">
                            <p className="project-site-eyebrow">{project.siteEyebrow}</p>
                            <h4>{project.heroTitle}</h4>
                            <p>{project.heroCopy}</p>
                            <span className="project-site-button">{project.action} <span>↗</span></span>
                          </div>
                          <span className="project-photo-index">0{index + 1} — 03</span>
                        </div>
                        <span className="project-concept-label">Дизайн-концепт</span>
                      </div>
                    </div>
                    <div className="project-info">
                      <p className="project-category">{project.category}</p>
                      <div className="project-title-row">
                        <h3>{project.title}</h3>
                        <span className="project-number">{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                      </div>
                      <p className="project-description">{project.description}</p>
                      <p className="project-explanation">{project.explanation}</p>
                      <div className="project-tags">
                        {project.stack.map((item) => <span key={item}>{item}</span>)}
                      </div>
                      <div className="project-carousel-controls" aria-label="Управление проектами">
                        <button
                          className="project-arrow"
                          type="button"
                          aria-label="Предыдущий проект"
                          onClick={() => setActiveProjectIndex((index - 1 + projects.length) % projects.length)}
                        >
                          ←
                        </button>
                        <div className="project-dots" role="group" aria-label="Выбрать проект">
                          {projects.map((item, itemIndex) => (
                            <button
                              className={`project-dot${itemIndex === index ? ' active' : ''}`}
                              key={item.id}
                              type="button"
                              aria-label={`Проект ${itemIndex + 1}: ${item.title}`}
                              aria-current={itemIndex === index ? 'true' : undefined}
                              onClick={() => setActiveProjectIndex(itemIndex)}
                            />
                          ))}
                        </div>
                        <button
                          className="project-arrow"
                          type="button"
                          aria-label="Следующий проект"
                          onClick={() => setActiveProjectIndex((index + 1) % projects.length)}
                        >
                          →
                        </button>
                      </div>
                      <p className="project-carousel-hint">Смена автоматически каждые 3 секунды · наведите курсор, чтобы остановить</p>
                    </div>
                  </article>
                );
              })()}
            </div>
          )}
          <p className="portfolio-note">Это демонстрационные концепты, созданные для портфолио, а не заказы реальных клиентов.</p>
        </section>

        <section className="contact section-wrap" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">03 / Контакт</p>
            <h2>Есть интересный<br />проект? <span>Напишите.</span></h2>
            <p>Открыт к предложениям о работе, стажировке и совместных проектах.</p>
            <a className="contact-mail" href="mailto:arnurmedetuly777@gmail.com">arnurmedetuly777@gmail.com <span>↗</span></a>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Как к вам обращаться?
              <input name="name" type="text" placeholder="Ваше имя" maxLength="80" autoComplete="name" required />
            </label>
            <label>
              Электронная почта
              <input name="email" type="email" placeholder="name@example.com" maxLength="254" autoComplete="email" required />
            </label>
            <label>
              Расскажите о задаче
              <textarea name="message" placeholder="Чем я могу быть полезен?" rows="4" maxLength="3000" required />
            </label>
            <button className="button button-primary submit-button" type="submit" disabled={isSending}>
              {isSending ? 'Отправляю…' : 'Отправить сообщение'} <span>↗</span>
            </button>
            {formMessage && (
              <p className={`form-message ${formMessage.type}`} role="status">{formMessage.text}</p>
            )}
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <BrandLogo />
        <span>Сделано с интересом к каждой детали.</span>
        <a className="back-to-top" href="#home">Наверх ↑</a>
      </footer>
    </>
  );
}

export default App;
