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
    let message = `HTTP ${res.status} ${res.statusText}`;
    let responseText = '';
    try {
      responseText = await res.clone().text();
    } catch {
      responseText = '[Could not read response text]';
    }
    if (body && body.message) message += `: ${body.message}`;
    else if (responseText) message += `: ${responseText}`;
    const errorObj = {
      status: res.status,
      statusText: res.statusText,
      url,
      responseText,
      body,
    };
    if (typeof window !== 'undefined') {
      console.error('[apiFetch] ERROR', errorObj);
    }
    const error = new Error(message);
    // @ts-expect-error Assigning custom property to Error object for status
    error.status = res.status;
    // @ts-expect-error Assigning custom property to Error object for statusText
    error.statusText = res.statusText;
    // @ts-expect-error Assigning custom property to Error object for responseText
    error.responseText = responseText;
    // @ts-expect-error Assigning custom property to Error object for body
    error.body = body;
    throw error;
  }
  return body;
}
