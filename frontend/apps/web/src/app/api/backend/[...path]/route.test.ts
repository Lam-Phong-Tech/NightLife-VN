import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('backend proxy route', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('removes hop-by-hop request and response headers', async () => {
    vi.stubEnv('BACKEND_API_URL', 'http://127.0.0.1:3012');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          connection: 'keep-alive',
          'content-type': 'application/json',
          'keep-alive': 'timeout=5',
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('https://demonightlight.test9.io.vn/api/backend/areas', {
      headers: {
        connection: 'upgrade, x-remove-me',
        'keep-alive': 'timeout=5',
        'proxy-connection': 'keep-alive',
        te: 'trailers',
        trailer: 'x-checksum',
        'transfer-encoding': 'chunked',
        upgrade: 'websocket',
        'x-remove-me': 'connection-specific',
        'x-request-id': 'request-123',
      },
    });

    const response = await GET(request, {
      params: Promise.resolve({ path: ['areas'] }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();

    const forwardedHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(forwardedHeaders.get('connection')).toBeNull();
    expect(forwardedHeaders.get('keep-alive')).toBeNull();
    expect(forwardedHeaders.get('proxy-connection')).toBeNull();
    expect(forwardedHeaders.get('te')).toBeNull();
    expect(forwardedHeaders.get('trailer')).toBeNull();
    expect(forwardedHeaders.get('transfer-encoding')).toBeNull();
    expect(forwardedHeaders.get('upgrade')).toBeNull();
    expect(forwardedHeaders.get('x-remove-me')).toBeNull();
    expect(forwardedHeaders.get('x-request-id')).toBe('request-123');
    expect(response.headers.get('connection')).toBeNull();
    expect(response.headers.get('keep-alive')).toBeNull();
    expect(response.headers.get('content-type')).toBe('application/json');
  });
});
