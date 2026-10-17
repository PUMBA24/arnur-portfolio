import {
  applicationStatuses,
  type AdminApplication,
  type ApplicationStatus,
} from '../../../src/types/admin';
import {
  getAdminIdentity,
  jsonError,
  readJsonBody,
  requestHasSameOrigin,
  type AdminEnvironment,
} from '../../../src/lib/admin-server';

type FunctionContext = {
  request: Request;
  env: AdminEnvironment;
};

type LeadRow = {
  id: string;
  project_type: string;
  description: string;
  budget: string;
  deadline: string;
  contact_method: string;
  contact: string;
  status: ApplicationStatus;
  notes: string;
  submitted_at: number;
};

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && applicationStatuses.some((status) => status === value);
}

function toApplication(row: LeadRow): AdminApplication {
  return {
    id: row.id,
    projectType: row.project_type,
    description: row.description,
    budget: row.budget,
    deadline: row.deadline,
    contactMethod: row.contact_method,
    contact: row.contact,
    status: row.status,
    notes: row.notes,
    submittedAt: row.submitted_at,
  };
}

export async function onRequestGet({ request, env }: FunctionContext) {
  if (!env.ADMIN_DB) return jsonError('Хранилище админки ещё не подключено.', 503);

  try {
    const admin = await getAdminIdentity(request, env.ADMIN_DB);
    if (!admin) return jsonError('Войдите в админку.', 401);

    const result = await env.ADMIN_DB.prepare(
      `SELECT id, project_type, description, budget, deadline, contact_method, contact,
              status, notes, submitted_at
       FROM applications ORDER BY submitted_at DESC LIMIT 200`,
    ).all<LeadRow>();

    return Response.json(
      { applications: result.results.map(toApplication) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return jsonError('Не удалось загрузить заявки.', 500);
  }
}

export async function onRequestPatch({ request, env }: FunctionContext) {
  if (!requestHasSameOrigin(request)) return jsonError('Запрос отклонён.', 403);
  if (!env.ADMIN_DB) return jsonError('Хранилище админки ещё не подключено.', 503);

  try {
    const admin = await getAdminIdentity(request, env.ADMIN_DB);
    if (!admin) return jsonError('Войдите в админку.', 401);
  } catch {
    return jsonError('Не удалось проверить доступ.', 500);
  }

  const parsedBody = await readJsonBody(request, 8 * 1024);
  if (!parsedBody.ok) {
    return parsedBody.tooLarge
      ? jsonError('Слишком большой запрос.', 413)
      : jsonError('Проверьте данные заявки.', 400);
  }
  const body = parsedBody.value;

  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    typeof body.id !== 'string' ||
    body.id.length > 64 ||
    !('status' in body) ||
    !isApplicationStatus(body.status) ||
    !('notes' in body) ||
    typeof body.notes !== 'string' ||
    body.notes.length > 2_000
  ) {
    return jsonError('Проверьте статус и заметку.', 400);
  }

  try {
    const update = await env.ADMIN_DB.prepare(
      'UPDATE applications SET status = ?, notes = ? WHERE id = ?',
    )
      .bind(body.status, body.notes.trim(), body.id)
      .run();

    if (!update.success) return jsonError('Не удалось сохранить заявку.', 500);

    const row = await env.ADMIN_DB.prepare(
      `SELECT id, project_type, description, budget, deadline, contact_method, contact,
              status, notes, submitted_at
       FROM applications WHERE id = ?`,
    )
      .bind(body.id)
      .first<LeadRow>();

    return row
      ? Response.json({ application: toApplication(row) })
      : jsonError('Заявка не найдена.', 404);
  } catch {
    return jsonError('Не удалось сохранить заявку.', 500);
  }
}

export async function onRequestDelete({ request, env }: FunctionContext) {
  if (!requestHasSameOrigin(request)) return jsonError('Запрос отклонён.', 403);
  if (!env.ADMIN_DB) return jsonError('Хранилище админки ещё не подключено.', 503);

  try {
    const admin = await getAdminIdentity(request, env.ADMIN_DB);
    if (!admin) return jsonError('Войдите в админку.', 401);
  } catch {
    return jsonError('Не удалось проверить доступ.', 500);
  }

  const parsedBody = await readJsonBody(request, 1024);
  if (!parsedBody.ok) {
    return parsedBody.tooLarge
      ? jsonError('Слишком большой запрос.', 413)
      : jsonError('Укажите корректный ID заявки.', 400);
  }

  const body = parsedBody.value;
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    typeof body.id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)
  ) {
    return jsonError('Укажите корректный ID заявки.', 400);
  }

  try {
    const result = await env.ADMIN_DB.prepare('DELETE FROM applications WHERE id = ?')
      .bind(body.id)
      .run();

    if (!result.success) return jsonError('Не удалось удалить заявку.', 500);
    if (result.meta?.changes === 0) return jsonError('Заявка не найдена.', 404);

    return Response.json({ deleted: true, id: body.id });
  } catch {
    return jsonError('Не удалось удалить заявку.', 500);
  }
}
