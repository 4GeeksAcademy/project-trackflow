export function trimFields<T extends Record<string, unknown>>(obj: T): T {
  const trimmed: Record<string, unknown> = {};
  for (const key in obj) {
    const value = obj[key];
    trimmed[key] = typeof value === 'string' ? value.trim() : value;
  }
  return trimmed as T;
}
