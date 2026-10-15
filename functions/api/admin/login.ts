import {
  createAdminSession,
  hashAdminPassword,
  hashSecret,
  isValidAdminUsername,
  jsonError,
  minimumAdminPasswordLength,
  normalizeAdminUsername,
  readJsonBody,
  requestHasSameOrigin,
  safeEqualStrings,
  sessionCookie,
  verifyAdminPassword,
  type AdminEnvironment,
  type AdminIdentity,
} from '../../../src/lib/admin-server';

type FunctionContext = {
  request: Request;
  env: AdminEnvironment;
};

type LoginBody = {
  username: string;
  password: string;
};

type AdminRecord = Omit<AdminIdentity, 'isOwner'> & {
  password_salt: string;
  password_hash: string;
  is_owner: number;
};

const maximumRequestBytes = 4 * 1024;
const maximumLoginAttempts = 5;
const loginWindowMs = 15 * 60 * 1000;
const sessionDurationSeconds = 7 * 24 * 60 * 60;

function isLoginBody(value: unknown): value is LoginBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'username' in value &&
    typeof value.username === 'string' &&
    'password' in value &&
    typeof value.password === 'string'
  );
}

async function recordFailedAttempt(
  ipHash: string,
  now: number,
  database: NonNullable<AdminEnvironment['ADMIN_DB']>,
) {
  await database
    .prepare(
      `INSERT INTO admin_login_attempts (ip_hash, attempts, expires_at) VALUES (?, 1, ?)
       ON CONFLICT(ip_hash) DO UPDATE SET
         attempts = CASE WHEN admin_login_attempts.expires_at <= ? THEN 1 ELSE admin_login_attempts.attempts + 1 END,
         expires_at = CASE WHEN admin_login_attempts.expires_at <= ? THEN ? ELSE admin_login_attempts.expires_at END`,
    )
    .bind(ipHash, now + loginWindowMs, now, now, now + loginWindowMs)
    .run();
}

export async function onRequestPost({ request, env }: FunctionContext) {
  if (!requestHasSameOrigin(request)) return jsonError('Запрос отклонён.', 403);
  if (!env.ADMIN_DB) return jsonError('Хранилище админки ещё не подключено.', 503);

  const parsedBody = await readJsonBody(request, maximumRequestBytes);
  if (!parsedBody.ok) {
    return parsedBody.tooLarge
      ? jsonError('Слишком большой запрос.', 413)
      : jsonError('Проверьте данные для входа.', 400);
  }
  const body = parsedBody.value;

  if (!isLoginBody(body)) return jsonError('Проверьте данные для входа.', 400);

  const username = normalizeAdminUsername(body.username);
  const password = body.password;
  if (
    !isValidAdminUsername(username) ||
    password.length < minimumAdminPasswordLength ||
    password.length > 128
  ) {
    return jsonError('Неверный логин или пароль.', 401);
  }

  try {
    const now = Date.now();
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
    const ipHash = await hashSecret(ip);
    const recentAttempts = await env.ADMIN_DB.prepare(
      'SELECT attempts, expires_at FROM admin_login_attempts WHERE ip_hash = ?',
    )
      .bind(ipHash)
      .first<{ attempts: number; expires_at: number }>();

    if (
      recentAttempts &&
      recentAttempts.expires_at > now &&
      recentAttempts.attempts >= maximumLoginAttempts
    ) {
      return jsonError('Слишком много попыток. Подождите 15 минут и попробуйте снова.', 429);
    }

    let admin = await env.ADMIN_DB.prepare(
      'SELECT id, username, password_salt, password_hash, is_owner FROM admins WHERE username = ?',
    )
      .bind(username)
      .first<AdminRecord>();
    let authenticated = false;

    if (admin) {
      authenticated = await verifyAdminPassword(password, admin.password_salt, admin.password_hash);
    } else {
      const adminCount = await env.ADMIN_DB.prepare('SELECT COUNT(*) AS count FROM admins').first<{
        count: number;
      }>();
      const bootstrapUsername = env.ADMIN_BOOTSTRAP_USERNAME
        ? normalizeAdminUsername(env.ADMIN_BOOTSTRAP_USERNAME)
        : '';
      const bootstrapPassword = env.ADMIN_BOOTSTRAP_PASSWORD ?? '';
      const canBootstrap =
        adminCount?.count === 0 &&
        username === bootstrapUsername &&
        bootstrapPassword.length >= minimumAdminPasswordLength &&
        safeEqualStrings(password, bootstrapPassword);

      if (canBootstrap) {
        const passwordRecord = await hashAdminPassword(password);
        await env.ADMIN_DB.prepare(
          'INSERT OR IGNORE INTO admins (id, username, password_salt, password_hash, is_owner, created_at) VALUES (?, ?, ?, ?, 1, ?)',
        )
          .bind(crypto.randomUUID(), username, passwordRecord.salt, passwordRecord.hash, now)
          .run();
        admin = await env.ADMIN_DB.prepare(
          'SELECT id, username, password_salt, password_hash, is_owner FROM admins WHERE username = ?',
        )
          .bind(username)
          .first<AdminRecord>();
        authenticated = Boolean(admin);
      } else {
        await hashAdminPassword(password);
      }
    }

    if (!admin || !authenticated) {
      await recordFailedAttempt(ipHash, now, env.ADMIN_DB);
      return jsonError('Неверный логин или пароль.', 401);
    }

    await env.ADMIN_DB.prepare('DELETE FROM admin_login_attempts WHERE ip_hash = ?')
      .bind(ipHash)
      .run();
    const token = await createAdminSession(env.ADMIN_DB, admin.id);
    return Response.json(
      { user: { id: admin.id, username: admin.username, isOwner: admin.is_owner === 1 } },
      {
        headers: {
          'Set-Cookie': sessionCookie(
            token,
            sessionDurationSeconds,
            new URL(request.url).protocol === 'https:',
          ),
        },
      },
    );
  } catch (error) {
    console.error(
      'Admin login failed:',
      error instanceof Error ? error.message : 'Unknown login error',
    );
    return jsonError('Не удалось выполнить вход. Проверьте настройки админки.', 500);
  }
}
