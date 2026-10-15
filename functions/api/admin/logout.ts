import {
  jsonError,
  readCookieToken,
  requestHasSameOrigin,
  sessionCookie,
  type AdminEnvironment,
} from '../../../src/lib/admin-server';

type FunctionContext = {
  request: Request;
  env: AdminEnvironment;
};

export async function onRequestPost({ request, env }: FunctionContext) {
  if (!requestHasSameOrigin(request)) return jsonError('Запрос отклонён.', 403);
  if (!env.ADMIN_DB) return jsonError('Хранилище админки ещё не подключено.', 503);

  try {
    const tokenHash = await readCookieToken(request);
    if (tokenHash) {
      await env.ADMIN_DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?')
        .bind(tokenHash)
        .run();
    }

    return Response.json(
      { ok: true },
      {
        headers: {
          'Set-Cookie': sessionCookie('', 0, new URL(request.url).protocol === 'https:'),
        },
      },
    );
  } catch {
    return jsonError('Не удалось завершить сессию.', 500);
  }
}
