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

const getBackendBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const internalBaseUrl = process.env.BACKEND_API_URL;
  const publicBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (internalBaseUrl) {
    return normalizeApiBaseUrl(internalBaseUrl);
  }

  if (!isProduction) {
    return normalizeApiBaseUrl(publicBaseUrl || 'http://localhost:3001');
  }

  if (publicBaseUrl && toHttpUrl(publicBaseUrl) && !isLoopbackUrl(publicBaseUrl)) {
    return normalizeApiBaseUrl(publicBaseUrl);
  }

  return null;
};

const proxy = async (
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) => {
  const { path = [] } = await context.params;
  const requestUrl = new URL(request.url);
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    return Response.json(
      { message: 'Thiếu BACKEND_API_URL cho server frontend production.' },
      { status: 503 },
    );
  }

  const targetUrl = new URL(`${backendBaseUrl}/${path.join('/')}`);
  targetUrl.search = requestUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      redirect: 'manual',
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return Response.json(
      { message: 'Không kết nối được API backend. Kiểm tra BACKEND_API_URL và service backend.' },
      { status: 502 },
    );
  }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
