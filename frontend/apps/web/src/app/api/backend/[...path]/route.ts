const getBackendBaseUrl = () => {
  const normalize = (value: string) => value.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? process.env.BACKEND_API_URL
    : process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (baseUrl) {
    return normalize(baseUrl);
  }

  return isProduction ? 'http://127.0.0.1:3001' : 'http://localhost:3001';
};

const proxy = async (
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) => {
  const { path = [] } = await context.params;
  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`${getBackendBaseUrl()}/${path.join('/')}`);
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
      { message: 'Không kết nối được API backend.' },
      { status: 502 },
    );
  }
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
