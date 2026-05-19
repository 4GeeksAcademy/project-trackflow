const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  // Debug output for candidate loading
  if (typeof window !== 'undefined') {
    // Only log in browser/client
    console.debug('[apiFetch] GET URL:', url);
    console.debug('[apiFetch] Response status:', res.status);
  }
  let body;
  try {
    body = await res.clone().json();
    if (typeof window !== 'undefined') {
      console.debug('[apiFetch] Response body:', body);
      if (Array.isArray(body)) {
        console.debug('[apiFetch] API returned array directly');
      } else {
        console.debug('[apiFetch] API returned wrapped data');
      }
    }
  } catch {
    if (typeof window !== 'undefined') {
      console.debug('[apiFetch] Response body is not JSON');
    }
    body = null;
  }
  if (!res.ok) {
    let message = 'Unknown error';
    if (body && body.message) message = body.message;
    throw new Error(message);
  }
  return body;
}
