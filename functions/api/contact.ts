import { contactEmail } from '../../src/data/contact';
import type { AdminEnvironment } from '../../src/lib/admin-server';
import { contactSchema, type ContactRequest } from '../../src/lib/contact-schema';

type FunctionContext = {
  request: Request;
  env: AdminEnvironment;
};

const maximumRequestBytes = 10 * 1024;
const rateLimitWindowMs = 60 * 60 * 1000;
const rateLimitMaximumRequests = 5;
const requestsByClient = new Map<string, { count: number; resetAt: number }>();

const projectTypeLabels: Record<ContactRequest['type'], string> = {
  landing: 'Лендинг',
  'multi-page': 'Многостраничный сайт',
  store: 'Магазин или каталог',
  changes: 'Доработки',
  unsure: 'Пока не определён',
};

const budgetLabels: Record<Exclude<ContactRequest['budget'], 'custom'>, string> = {
  'under-50': 'До 50 000 ₸',
  '50-100': '50 000–100 000 ₸',
  '100-200': '100 000–200 000 ₸',
  'over-200': 'Больше 200 000 ₸',
  discuss: 'Обсудим',
};

const deadlineLabels: Record<ContactRequest['deadline'], string> = {
  'two-weeks': 'В течение двух недель',
  month: 'В течение месяца',
  flexible: 'Срок гибкий',
  date: 'Есть конкретная дата',
};

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

function createFormSubmitPayload(data: ContactRequest, contactPageUrl: string) {
  const budget =
    data.budget === 'custom'
      ? `${data.customBudget} ₸ (сумма указана посетителем)`
      : budgetLabels[data.budget];

  const payload: Record<string, string> = {
    name: 'Заявка с портфолио Арнура',
    _subject: 'Новая заявка с портфолио',
    _template: 'table',
    _url: contactPageUrl,
    project_type: projectTypeLabels[data.type],
    description: data.description,
    budget,
    deadline: deadlineLabels[data.deadline],
    contact_method: data.contactChannel,
    contact: data.contactValue,
  };

  if (data.contactChannel === 'email') payload.email = data.contactValue;

  return payload;
}

function formSubmitAccepted(result: unknown) {
  if (typeof result !== 'object' || result === null || !('success' in result)) return false;
  return result.success === true || result.success === 'true';
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
  const requestUrl = new URL(request.url);
  const contactPageUrl = new URL('/contact', requestUrl).toString();

  const budget =
    data.budget === 'custom'
      ? `${data.customBudget} ₸ (сумма указана посетителем)`
      : budgetLabels[data.budget];
  let stored = false;

  if (env.ADMIN_DB) {
    try {
      const result = await env.ADMIN_DB.prepare(
        `INSERT INTO applications
         (id, project_type, description, budget, deadline, contact_method, contact, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          crypto.randomUUID(),
          projectTypeLabels[data.type],
          data.description,
          budget,
          deadlineLabels[data.deadline],
          data.contactChannel,
          data.contactValue,
          Date.now(),
        )
        .run();
      stored = result.success;
    } catch {
      stored = false;
    }
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${contactEmail}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // FormSubmit rejects server-side AJAX without the page origin and referrer.
        Origin: requestUrl.origin,
        Referer: contactPageUrl,
      },
      body: JSON.stringify(createFormSubmitPayload(data, contactPageUrl)),
      signal: AbortSignal.timeout(10_000),
    });
    const result: unknown = await response.json();

    if (!response.ok || !formSubmitAccepted(result)) {
      if (stored)
        return Response.json({ ok: true, stored: true, emailAccepted: false }, { status: 201 });
      return jsonError(
        'FormSubmit не принял заявку. Попробуйте ещё раз или напишите напрямую.',
        502,
      );
    }

    return Response.json({ ok: true, stored, emailAccepted: true }, { status: 201 });
  } catch {
    if (stored)
      return Response.json({ ok: true, stored: true, emailAccepted: false }, { status: 201 });
    return jsonError(
      'Не удалось связаться с FormSubmit. Попробуйте ещё раз или напишите напрямую.',
      502,
    );
  }
}
