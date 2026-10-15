import { contactSchema } from '../../src/lib/contact-schema';

type ContactEnvironment = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

type FunctionContext = {
  request: Request;
  env: ContactEnvironment;
};

const maximumRequestBytes = 10 * 1024;
const rateLimitWindowMs = 60 * 60 * 1000;
const rateLimitMaximumRequests = 5;
const requestsByClient = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(clientKey: string, now: number) {
  for (const [key, entry] of requestsByClient) {
    if (entry.resetAt <= now) requestsByClient.delete(key);
  }

  const previous = requestsByClient.get(clientKey);
  if (previous && previous.resetAt > now && previous.count >= rateLimitMaximumRequests) return true;

  requestsByClient.set(
    clientKey,
    previous && previous.resetAt > now
      ? { ...previous, count: previous.count + 1 }
      : { count: 1, resetAt: now + rateLimitWindowMs },
  );
  return false;
}

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function onRequestPost({ request, env }: FunctionContext) {
  const declaredSize = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > maximumRequestBytes) {
    return jsonError('Размер запроса слишком большой.', 413);
  }

  const clientKey = request.headers.get('cf-connecting-ip') ?? 'unknown-client';
  if (isRateLimited(clientKey, Date.now())) {
    return jsonError('Слишком много заявок с этого адреса. Попробуйте позже.', 429);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maximumRequestBytes) {
      return jsonError('Размер запроса слишком большой.', 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonError('Проверьте формат отправленной формы.', 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return jsonError('Проверьте заполненные поля и попробуйте ещё раз.', 400);

  const data = parsed.data;
  if (data.website) return Response.json({ ok: true });

  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return jsonError('Форма пока не подключена. Напишите напрямую по контактным ссылкам.', 503);
  }

  const budget =
    data.budget === 'custom' ? `${data.customBudget} ₸ (сумма указана посетителем)` : data.budget;
  const message = [
    'Новая заявка с портфолио',
    `Тип сайта: ${data.type}`,
    `Описание: ${data.description}`,
    `Бюджет: ${budget}`,
    `Срок: ${data.deadline}`,
    `Контакт (${data.contactChannel}): ${data.contactValue}`,
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
      signal: AbortSignal.timeout(8_000),
    });
    const result: unknown = await response.json();

    if (
      !response.ok ||
      typeof result !== 'object' ||
      result === null ||
      !('ok' in result) ||
      result.ok !== true
    ) {
      return jsonError('Не получилось отправить заявку. Попробуйте ещё раз или напишите напрямую.', 502);
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return jsonError('Не получилось отправить заявку. Попробуйте ещё раз или напишите напрямую.', 502);
  }
}
