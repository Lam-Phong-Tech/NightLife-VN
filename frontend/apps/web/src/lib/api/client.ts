export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  data?: any;
  params?: Record<string, string | undefined | null | number | boolean>;
}

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

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (configuredBaseUrl) {
      const normalizedBaseUrl = normalizeApiBaseUrl(configuredBaseUrl);

      if (!isLocalHost && isLoopbackUrl(normalizedBaseUrl)) {
        return '/api/backend';
      }

      return normalizedBaseUrl;
    }

    return isLocalHost ? 'http://localhost:3001' : '/api/backend';
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const serverBaseUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (
    serverBaseUrl &&
    toHttpUrl(serverBaseUrl) &&
    !(isProduction && !process.env.BACKEND_API_URL && isLoopbackUrl(serverBaseUrl))
  ) {
    return normalizeApiBaseUrl(serverBaseUrl);
  }

  if (isProduction) {
    throw new ApiError(503, 'Thiếu BACKEND_API_URL cho server frontend production.');
  }

  return 'http://localhost:3001';
};

const getAuthToken = () => {
  // Can be implemented to extract token from cookie in SSR, or localStorage/cookie in CSR
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    if (match) return match[2];
  }
  return null;
};

export const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { data, params, headers: customHeaders, ...customConfig } = options;

  let url = `${getBaseUrl()}/${endpoint.replace(/^\//, '')}`;

  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const searchParams = new URLSearchParams(cleanParams as Record<string, string>);
    url += `?${searchParams.toString()}`;
  }

  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching the data.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignored
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
};
