import { validateContact } from '../../shared/contact.js';

export async function onRequestPost({ request, env }) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > 10 * 1024) {
    return Response.json(
      { error: 'Размер запроса не должен превышать 10 КБ.' },
      { status: 413 },
    );
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json(
      { error: 'Проверьте формат JSON-запроса.' },
      { status: 400 },
    );
  }

  const { contact, error } = validateContact(input);
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  try {
    await env.DB.prepare(`
      INSERT INTO contact_messages (name, email, message)
      VALUES (?, ?, ?)
    `).bind(contact.name, contact.email, contact.message).run();
  } catch (databaseError) {
    console.error('Не удалось сохранить сообщение:', databaseError);
    return Response.json(
      { error: 'Не удалось сохранить сообщение. Попробуйте позже.' },
      { status: 500 },
    );
  }

  return Response.json(
    { message: 'Спасибо! Сообщение сохранено на сервере.' },
    { status: 201 },
  );
}
