import { apiFetch } from './api';

export const TOKEN_KEY = 'trackflow_token';

export type AuthUser = {
  id: number;
  email: string;
  is_active?: boolean;
};

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set('username', email);
  body.set('password', password);

  const response = await apiFetch<{ access_token: string; token_type: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  setToken(response.access_token);
  return response;
}

export async function register(email: string, password: string) {
  return apiFetch<AuthUser>(
    `/auth/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { method: 'POST' }
  );
}

export async function getCurrentUser() {
  return apiFetch<AuthUser>('/auth/me');
}

export async function changePassword(userId: number, password: string) {
  return apiFetch<AuthUser>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  clearToken();
  window.location.href = '/login';
}
