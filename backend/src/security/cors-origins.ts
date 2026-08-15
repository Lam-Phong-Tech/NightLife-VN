import type { IncomingMessage } from 'http';

const localOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const productionOrigins = [
  'https://vietyoru.com',
  'https://www.vietyoru.com',
  'https://admin.vietyoru.com',
  'https://auth.vietyoru.com',
  'https://partner.vietyoru.com',
];

function configuredOrigins() {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAllowedOrigins() {
  return [
    ...(process.env.NODE_ENV === 'production' ? [] : localOrigins),
    ...productionOrigins,
    ...configuredOrigins(),
  ];
}

export function isAllowedOrigin(origin: string | undefined) {
  return Boolean(origin && getAllowedOrigins().includes(origin));
}

/**
 * CORS only governs Socket.IO long-polling. This also checks the Origin
 * header on WebSocket upgrade requests, while authentication still controls
 * access to rooms and events.
 */
export function allowSocketRequest(
  request: IncomingMessage,
  callback: (error: string | null, success: boolean) => void,
) {
  callback(null, isAllowedOrigin(request.headers.origin));
}

export function socketCorsOptions() {
  return {
    origin: getAllowedOrigins(),
    credentials: true,
  };
}
