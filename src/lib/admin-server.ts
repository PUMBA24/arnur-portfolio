const encoder = new TextEncoder();
const sessionCookieName = 'portfolio_admin';
export const adminSessionDurationMs = 7 * 24 * 60 * 60 * 1000;
export const minimumAdminPasswordLength = 14;
const passwordIterations = 600_000;

export type D1PreparedStatement = {
  bind(...values: Array<string | number | null>): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
};

export type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

export type AdminEnvironment = {
  ADMIN_DB?: D1Database;
  ADMIN_BOOTSTRAP_USERNAME?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
};

export type AdminIdentity = {
  id: string;
  username: string;
  isOwner: boolean;
};

function encodeBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return difference === 0;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(length)));
}

async function derivePasswordHash(password: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: passwordIterations },
    key,
    256,
  );

  return new Uint8Array(hash);
}

export function normalizeAdminUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidAdminUsername(value: string) {
  return /^[a-z0-9][a-z0-9._-]{2,39}$/.test(value);
}

export function safeEqualStrings(left: string, right: string) {
  return equalBytes(encoder.encode(left), encoder.encode(right));
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await derivePasswordHash(password, salt);
  return { salt: encodeBase64Url(salt), hash: encodeBase64Url(hash) };
}

export async function verifyAdminPassword(password: string, salt: string, hash: string) {
  try {
    const actual = await derivePasswordHash(password, decodeBase64Url(salt));
    return equalBytes(actual, decodeBase64Url(hash));
  } catch {
    return false;
  }
}

export async function hashSecret(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return encodeBase64Url(new Uint8Array(digest));
}

export function getAdminSessionToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const prefix = `${sessionCookieName}=`;
  const cookie = cookieHeader
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));
  return cookie?.slice(prefix.length) ?? null;
}

export async function getAdminIdentity(request: Request, database: D1Database) {
  const token = getAdminSessionToken(request);
  if (!token) return null;

  const tokenHash = await hashSecret(token);
  const now = Date.now();
  const row = await database
    .prepare(
      `SELECT admins.id, admins.username, admins.is_owner AS isOwner
       FROM admin_sessions
       INNER JOIN admins ON admins.id = admin_sessions.admin_id
       WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > ?`,
    )
    .bind(tokenHash, now)
    .first<Omit<AdminIdentity, 'isOwner'> & { isOwner: number }>();

  return row ? { ...row, isOwner: row.isOwner === 1 } : null;
}

export async function createAdminSession(database: D1Database, adminId: string) {
  const token = encodeBase64Url(randomBytes(32));
  const now = Date.now();
  await database
    .prepare(
      'INSERT INTO admin_sessions (token_hash, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
    )
    .bind(await hashSecret(token), adminId, now + adminSessionDurationMs, now)
    .run();

  return token;
}

export function sessionCookie(token: string, maxAgeSeconds: number, secure = true) {
  const secureFlag = secure ? '; Secure' : '';
  return `${sessionCookieName}=${token}; Path=/api/admin; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${maxAgeSeconds}`;
}

export function requestHasSameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}

export function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function readJsonBody(request: Request, maximumBytes: number) {
  const declaredSize = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > maximumBytes) {
    return { ok: false as const, tooLarge: true as const };
  }

  try {
    const rawBody = await request.text();
    if (encoder.encode(rawBody).byteLength > maximumBytes) {
      return { ok: false as const, tooLarge: true as const };
    }
    return { ok: true as const, value: JSON.parse(rawBody) as unknown };
  } catch {
    return { ok: false as const, tooLarge: false as const };
  }
}

export function readCookieToken(request: Request) {
  const token = getAdminSessionToken(request);
  return token ? hashSecret(token) : null;
}

export function randomId() {
  return crypto.randomUUID();
}
