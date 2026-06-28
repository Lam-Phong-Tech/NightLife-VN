const normalizeApiBaseUrl = (value: string) => value.replace(/\/api\/?$/, '').replace(/\/$/, '');

const toHttpUrl = (value: string) => {
  try {
    const url = new URL(normalizeApiBaseUrl(value));
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

const isLoopbackUrl = (value: string) => {
  const url = toHttpUrl(value);
  return Boolean(url && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1'));
};

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

const HTTP_TOKEN_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

const stripHopByHopHeaders = (source: Headers) => {
  const headers = new Headers(source);
  const connectionHeaders = (headers.get('connection') || '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => HTTP_TOKEN_PATTERN.test(value));

  for (const header of [...HOP_BY_HOP_HEADERS, ...connectionHeaders]) {
    headers.delete(header);
  }

  return headers;
};

const addUniqueBaseUrl = (urls: string[], value?: string) => {
  if (!value || !toHttpUrl(value)) {
    return;
  }

  const normalized = normalizeApiBaseUrl(value);
  if (!urls.includes(normalized)) {
    urls.push(normalized);
  }
};

const getBackendBaseUrls = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const internalBaseUrl = process.env.BACKEND_API_URL;
  const publicBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fallbackBaseUrls = (process.env.BACKEND_API_FALLBACK_URLS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const urls: string[] = [];

  if (internalBaseUrl) {
    addUniqueBaseUrl(urls, internalBaseUrl);
  }

  if (!isProduction) {
    addUniqueBaseUrl(urls, publicBaseUrl || 'http://localhost:3001');
    return urls;
  }

  if (publicBaseUrl && toHttpUrl(publicBaseUrl) && !isLoopbackUrl(publicBaseUrl)) {
    addUniqueBaseUrl(urls, publicBaseUrl);
  }

  for (const fallbackBaseUrl of fallbackBaseUrls) {
    addUniqueBaseUrl(urls, fallbackBaseUrl);
  }

  addUniqueBaseUrl(urls, 'http://127.0.0.1:3001');
  addUniqueBaseUrl(urls, 'http://localhost:3001');
  addUniqueBaseUrl(urls, 'http://127.0.0.1:3000');
  addUniqueBaseUrl(urls, 'http://localhost:3000');

  return urls;
};

const proxy = async (
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) => {
  const { path = [] } = await context.params;
  const requestUrl = new URL(request.url);
  const backendBaseUrls = getBackendBaseUrls();

  if (!backendBaseUrls.length) {
    return Response.json(
      { message: 'Thiếu BACKEND_API_URL cho server frontend production.' },
      { status: 503 },
    );
  }

  const headers = stripHopByHopHeaders(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  let lastError: unknown;

  for (const backendBaseUrl of backendBaseUrls) {
    const targetUrl = new URL(`${backendBaseUrl}/${path.join('/')}`);
    targetUrl.search = requestUrl.search;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: body?.slice(0),
        redirect: 'manual',
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: stripHopByHopHeaders(response.headers),
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.error('Backend proxy connection failed', {
    path: path.join('/'),
    backendBaseUrls,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  });

  return Response.json(
    { message: 'Không kết nối được API backend sau khi thử các cổng local. Kiểm tra PM2 backend.' },
    { status: 502 },
  );
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
