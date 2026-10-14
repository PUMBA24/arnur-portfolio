import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import express from 'express';

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(serverDirectory, '..');
const databasePath = process.env.DATABASE_PATH
  ? resolve(process.env.DATABASE_PATH)
  : join(serverDirectory, 'data', 'portfolio.sqlite');

mkdirSync(dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.exec(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const saveMessage = database.prepare(`
  INSERT INTO contact_messages (name, email, message)
  VALUES (@name, @email, @message)
`);

const projects = [
  {
    id: 'task-flow',
    title: 'Task Flow',
    category: 'Продуктивность',
    description: 'Минималистичный список задач для повседневного планирования.',
    stack: ['React', 'CSS'],
    visual: 'tasks',
    demoUrl: '',
    sourceUrl: '',
  },
  {
    id: 'fin-dash',
    title: 'FinDash',
    category: 'Финансы',
    description: 'Учебный дашборд для наглядного отображения личных расходов.',
    stack: ['JavaScript', 'Charts'],
    visual: 'finance',
    demoUrl: '',
    sourceUrl: '',
  },
  {
    id: 'aroma-coffee',
    title: 'Aroma Coffee',
    category: 'Веб-дизайн',
    description: 'Концепция аккуратной страницы для локальной кофейни.',
    stack: ['React', 'Responsive'],
    visual: 'coffee',
    demoUrl: '',
    sourceUrl: '',
  },
];

const app = express();
const port = Number(process.env.PORT) || 3000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/projects', (_request, response) => {
  response.json(projects);
});

app.post('/api/contact', (request, response, next) => {
  const { name, email, message } = request.body ?? {};

  if (
    typeof name !== 'string'
    || typeof email !== 'string'
    || typeof message !== 'string'
  ) {
    return response.status(400).json({ error: 'Заполните все поля формы.' });
  }

  const contact = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };

  if (!contact.name || contact.name.length > 80) {
    return response.status(400).json({ error: 'Имя должно содержать от 1 до 80 символов.' });
  }

  if (contact.email.length > 254 || !emailPattern.test(contact.email)) {
    return response.status(400).json({ error: 'Укажите корректный адрес электронной почты.' });
  }

  if (!contact.message || contact.message.length > 3000) {
    return response.status(400).json({ error: 'Сообщение должно содержать от 1 до 3000 символов.' });
  }

  try {
    saveMessage.run(contact);
    return response.status(201).json({
      message: 'Спасибо! Сообщение сохранено на сервере.',
    });
  } catch (error) {
    return next(error);
  }
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API-маршрут не найден.' });
});

app.use(express.static(join(projectDirectory, 'dist')));

app.get(/.*/, (_request, response) => {
  response.sendFile(join(projectDirectory, 'dist', 'index.html'));
});

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Размер запроса не должен превышать 10 КБ.' });
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ error: 'Проверьте формат JSON-запроса.' });
  }

  console.error('Ошибка API:', error);
  return response.status(500).json({ error: 'На сервере произошла ошибка. Попробуйте позже.' });
});

app.listen(port, () => {
  console.log(`Портфолио доступно на http://localhost:${port}`);
});
