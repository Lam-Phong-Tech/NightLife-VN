'use client';

/**
 * Utility to resolve the correct Socket.io connection config.
 * 
 * Problem: NEXT_PUBLIC_API_URL is baked at build time. If the production
 * build was created without setting it, the value will be empty or localhost,
 * causing WebSocket connections to fail on the live site.
 * 
 * Solution: At runtime, detect if we're on a production domain but have a
 * localhost API URL, and auto-derive the correct URL from window.location.
 */

export interface SocketConfig {
  host: string;
  path?: string;
}

export function getSupportSocketConfig(): SocketConfig {
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Runtime detection: if API URL is empty or localhost but we're on a production domain
  if (typeof window !== 'undefined') {
    const isLocalApi = !apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
    const isProductionBrowser =
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1');

    if (isLocalApi && isProductionBrowser) {
      // Derive API URL from current origin + known backend subpath
      apiUrl = window.location.origin + '/api/backend';
    }
  }

  let socketHost = apiUrl;
  let socketPath: string | undefined = undefined;

  try {
    const parsedUrl = new URL(apiUrl);
    if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
      // API has a subpath (e.g. /api/backend)
      socketHost = parsedUrl.origin;
      socketPath = `${parsedUrl.pathname.replace(/\/$/, '')}/socket.io`;
    }
  } catch {
    // If URL parsing fails, use apiUrl as-is (best effort)
  }

  return { host: socketHost, path: socketPath };
}
