const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trackflow_token');
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let body = null;

  try {
    body = await res.clone().json();
  } catch {
    body = null;
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('trackflow_token');

    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const message =
      body?.detail ||
      body?.message ||
      `HTTP ${res.status} ${res.statusText}`;

    const error = new Error(message);
    // @ts-expect-error custom status
    error.status = res.status;
    // @ts-expect-error custom body
    error.body = body;
    throw error;
  }

  return body;
}