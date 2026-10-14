import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import express from 'express';
import { validateContact } from '../shared/contact.js';
import { projects } from '../shared/projects.js';

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

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/projects', (_request, response) => {
  response.json(projects);
});

app.post('/api/contact', (request, response, next) => {
  const { contact, error } = validateContact(request.body);
  if (error) {
    return response.status(400).json({ error });
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
