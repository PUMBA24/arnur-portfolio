import { getAdminIdentity, jsonError, type AdminEnvironment } from '../../../src/lib/admin-server';

type FunctionContext = {
  request: Request;
  env: AdminEnvironment;
};

export async function onRequestGet({ request, env }: FunctionContext) {
  if (!env.ADMIN_DB) return jsonError('Хранилище админки ещё не подключено.', 503);

  try {
    const user = await getAdminIdentity(request, env.ADMIN_DB);
    return Response.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return jsonError('Не удалось проверить сессию администратора.', 500);
  }
}
