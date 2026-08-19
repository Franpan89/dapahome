const BASE_URL = 'https://api.sendifico.com/api/public';
const API_VERSION = process.env.SENDIFICO_API_VERSION ?? '2026-01-01';
const COUNTRY = process.env.SENDIFICO_COUNTRY ?? 'EC';

export class SendificoError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'SendificoError';
  }
}

export async function sendificoFetch<T>(
  path: string,
  init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {},
): Promise<T> {
  const apiKey = process.env.SENDIFICO_API_KEY;
  if (!apiKey) throw new SendificoError(500, 'sendificoApiKeyMissing');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-sendifico-api-version': API_VERSION,
      'x-sendifico-country': COUNTRY,
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new SendificoError(res.status, body?.message ?? `sendificoHttp${res.status}`);
  }
  return body as T;
}
