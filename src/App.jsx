import { useEffect, useState } from 'react';
import './App.css';

const skills = ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'];

function App() {
  const [projects, setProjects] = useState([]);
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
        <a className="wordmark" href="#home" aria-label="Арнур — на главную">
          arnur<span>.</span>
        </a>
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
            <p className="section-note">Небольшие учебные проекты,<br />в которых я применяю знания на практике.</p>
          </div>

          {projectsError ? (
            <p className="projects-message" role="alert">{projectsError} Запустите backend командой <code>npm run dev:api</code>.</p>
          ) : isLoadingProjects ? (
            <p className="projects-message" role="status">Загружаю проекты…</p>
          ) : projects.length === 0 ? (
            <p className="projects-message" role="status">Добавьте проекты в <code>server/index.js</code>, чтобы показать их здесь.</p>
          ) : (
            <div className="project-grid">
              {projects.map((project, index) => (
                <article className="project-card" key={project.id}>
                  <div className={`project-preview preview-${project.visual}`} aria-hidden="true">
                    {project.visual === 'tasks' && (
                      <div className="task-preview">
                        <span className="preview-label">ПЛАН НА ДЕНЬ</span>
                        <div className="task-row"><i className="task-check">✓</i><span>Разобрать макет</span><b>09:30</b></div>
                        <div className="task-row"><i /><span>Собрать страницу</span><b>11:00</b></div>
                        <div className="task-row"><i /><span>Проверить детали</span><b>14:20</b></div>
                      </div>
                    )}
                    {project.visual === 'finance' && (
                      <div className="finance-preview">
                        <span className="preview-label">ОБЩИЙ БАЛАНС</span>
                        <strong>₸ 248 500</strong>
                        <div className="chart-bars">
                          {[32, 52, 39, 72, 45, 88, 61, 100, 70, 84, 58, 95].map((height, barIndex) => (
                            <i key={barIndex} style={{ '--bar-height': `${height}%` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {project.visual === 'coffee' && (
                      <div className="coffee-preview">
                        <span className="coffee-bean bean-one" />
                        <span className="coffee-bean bean-two" />
                        <span className="coffee-bean bean-three" />
                        <span className="coffee-cup">A.</span>
                        <span className="coffee-stamp">FRESH<br />COFFEE</span>
                      </div>
                    )}
                  </div>
                  <div className="project-info">
                    <div className="project-title-row">
                      <div>
                        <p className="project-category">{project.category}</p>
                        <h3>{project.title}</h3>
                      </div>
                      <span className="project-number">0{index + 1}</span>
                    </div>
                    <p className="project-description">{project.description}</p>
                    <div className="project-tags">
                      {project.stack.map((item) => <span key={item}>{item}</span>)}
                    </div>
                    {(project.demoUrl || project.sourceUrl) && (
                      <div className="project-links">
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noreferrer">
                            Демо <span>↗</span>
                          </a>
                        )}
                        {project.sourceUrl && (
                          <a href={project.sourceUrl} target="_blank" rel="noreferrer">
                            Код <span>↗</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="portfolio-note">Проекты в портфолио — учебные примеры. Замените их своими реальными работами.</p>
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
        <a className="wordmark" href="#home">arnur<span>.</span></a>
        <span>Сделано с интересом к каждой детали.</span>
        <a className="back-to-top" href="#home">Наверх ↑</a>
      </footer>
    </>
  );
}

export default App;
