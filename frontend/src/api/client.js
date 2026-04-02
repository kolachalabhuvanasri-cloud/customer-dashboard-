const normalizeBaseUrl = (value) => value.replace(/\/+$/, '');

const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
  }

  return 'http://localhost:4000';
};

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const parsePayload = async (response) => {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError('Server returned an invalid response.', { status: response.status, code: 'BAD_RESPONSE' });
  }
};

const parseResponse = async (response) => {
  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new ApiError(payload.message || 'Request failed.', { status: response.status, code: 'HTTP_ERROR' });
  }

  return payload;
};

const buildUnreachableMessage = () =>
  `Backend unreachable. Is API running on ${API_BASE_URL}?`;

const withNetworkErrorHandling = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(buildUnreachableMessage(), { code: 'NETWORK_ERROR' });
    }

    throw new ApiError('Unexpected error while contacting API.', { code: 'UNKNOWN_ERROR' });
  }
};

export const checkApiHealth = async () =>
  withNetworkErrorHandling(async () => {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    const payload = await parseResponse(response);
    return payload.status === 'ok';
  });

export const apiRequest = async (path, { method = 'GET', token, body } = {}) =>
  withNetworkErrorHandling(async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return parseResponse(response);
  });
