import {
  getAdminIdentity,
  hashAdminPassword,
  isValidAdminUsername,
  jsonError,
  minimumAdminPasswordLength,
  normalizeAdminUsername,
  readJsonBody,
  requestHasSameOrigin,
  type AdminEnvironment,
} from '../../../src/lib/admin-server';
import type { AdminUser } from '../../../src/types/admin';

type FunctionContext = {
  request: Request;
  env: AdminEnvironment;
};

type AdminUserRow = {
  id: string;
  username: string;
  created_at: number;
  is_owner: number;
};

function toAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
    isOwner: row.is_owner === 1,
  };
}

async function authorize(request: Request, env: AdminEnvironment) {
  if (!env.ADMIN_DB) return { error: jsonError('Хранилище админки ещё не подключено.', 503) };
  try {
    const admin = await getAdminIdentity(request, env.ADMIN_DB);
    if (!admin) return { error: jsonError('Войдите в админку.', 401) };
    return { admin, database: env.ADMIN_DB };
  } catch {
    return { error: jsonError('Не удалось проверить доступ.', 500) };
  }
}

export async function onRequestGet({ request, env }: FunctionContext) {
  const access = await authorize(request, env);
  if ('error' in access) return access.error;

  if (!access.admin.isOwner) return Response.json({ users: [] });

  try {
    const result = await access.database
      .prepare('SELECT id, username, created_at, is_owner FROM admins ORDER BY created_at ASC')
      .all<AdminUserRow>();
    return Response.json(
      { users: result.results.map(toAdminUser) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return jsonError('Не удалось загрузить список администраторов.', 500);
  }
}

export async function onRequestPost({ request, env }: FunctionContext) {
  if (!requestHasSameOrigin(request)) return jsonError('Запрос отклонён.', 403);

  const access = await authorize(request, env);
  if ('error' in access) return access.error;
  if (!access.admin.isOwner) return jsonError('Управлять доступом может только владелец.', 403);

  const parsedBody = await readJsonBody(request, 4 * 1024);
  if (!parsedBody.ok) {
    return parsedBody.tooLarge
      ? jsonError('Слишком большой запрос.', 413)
      : jsonError('Проверьте данные нового администратора.', 400);
  }
  const body = parsedBody.value;

  if (
    typeof body !== 'object' ||
    body === null ||
    !('username' in body) ||
    typeof body.username !== 'string' ||
    !('password' in body) ||
    typeof body.password !== 'string'
  ) {
    return jsonError('Укажите логин и пароль.', 400);
  }

  const username = normalizeAdminUsername(body.username);
  if (!isValidAdminUsername(username)) {
    return jsonError(
      'Логин: 3–40 символов, латинские буквы, цифры, точка, дефис или подчёркивание.',
      400,
    );
  }
  if (body.password.length < minimumAdminPasswordLength || body.password.length > 128) {
    return jsonError(
      `Пароль должен содержать от ${minimumAdminPasswordLength} до 128 символов.`,
      400,
    );
  }

  try {
    const existing = await access.database
      .prepare('SELECT id FROM admins WHERE username = ?')
      .bind(username)
      .first<{ id: string }>();
    if (existing) return jsonError('Такой администратор уже существует.', 409);

    const passwordRecord = await hashAdminPassword(body.password);
    const id = crypto.randomUUID();
    const result = await access.database
      .prepare(
        'INSERT INTO admins (id, username, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(id, username, passwordRecord.salt, passwordRecord.hash, Date.now())
      .run();

    if (!result.success) return jsonError('Не удалось добавить администратора.', 500);
    return Response.json({ user: { id, username } }, { status: 201 });
  } catch {
    return jsonError('Не удалось добавить администратора.', 500);
  }
}

export async function onRequestDelete({ request, env }: FunctionContext) {
  if (!requestHasSameOrigin(request)) return jsonError('Запрос отклонён.', 403);

  const access = await authorize(request, env);
  if ('error' in access) return access.error;
  if (!access.admin.isOwner) return jsonError('Управлять доступом может только владелец.', 403);

  const parsedBody = await readJsonBody(request, 4 * 1024);
  if (!parsedBody.ok) {
    return parsedBody.tooLarge
      ? jsonError('Слишком большой запрос.', 413)
      : jsonError('Укажите логин администратора.', 400);
  }
  const body = parsedBody.value;

  if (
    typeof body !== 'object' ||
    body === null ||
    !('username' in body) ||
    typeof body.username !== 'string'
  ) {
    return jsonError('Укажите логин администратора.', 400);
  }

  const username = normalizeAdminUsername(body.username);
  if (username === access.admin.username) {
    return jsonError('Нельзя удалить собственный аккаунт из текущей сессии.', 400);
  }

  try {
    const result = await access.database
      .prepare(
        'DELETE FROM admins WHERE username = ? AND is_owner = 0 AND (SELECT COUNT(*) FROM admins) > 1',
      )
      .bind(username)
      .run();
    if (!result.success) return jsonError('Не удалось удалить администратора.', 500);
    if (!result.meta?.changes) {
      const target = await access.database
        .prepare('SELECT id, is_owner FROM admins WHERE username = ?')
        .bind(username)
        .first<{ id: string; is_owner: number }>();
      return target
        ? target.is_owner === 1
          ? jsonError('Аккаунт владельца удалить нельзя.', 403)
          : jsonError('В системе должен остаться хотя бы один администратор.', 409)
        : jsonError('Администратор не найден.', 404);
    }

    return Response.json({ ok: true });
  } catch {
    return jsonError('Не удалось удалить администратора.', 500);
  }
}
