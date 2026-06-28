export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  data?: unknown;
  params?: Record<string, string>;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (configuredBaseUrl) {
      const normalizedBaseUrl = configuredBaseUrl
        .replace(/\/api\/?$/, '')
        .replace(/\/$/, '');

      try {
        const configuredHostname = new URL(normalizedBaseUrl).hostname;
        const pointsToLocalApi =
          configuredHostname === 'localhost' ||
          configuredHostname === '127.0.0.1';

        if (!isLocalHost && pointsToLocalApi) {
          return '/api/backend';
        }
      } catch {
        return normalizedBaseUrl;
      }

      return normalizedBaseUrl;
    }

    return isLocalHost ? 'http://localhost:3001' : '/api/backend';
  }

  const serverBaseUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return serverBaseUrl
    ? serverBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')
    : 'http://localhost:3001';
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
    const searchParams = new URLSearchParams(params);
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
