export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidNumber(value: unknown): boolean {
  return !isNaN(Number(value)) && value !== '' && value !== null;
}
