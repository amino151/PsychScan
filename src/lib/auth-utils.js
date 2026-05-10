const MIN_PASSWORD_LENGTH = 6;

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateEmail(email) {
  const value = normalizeEmail(email);
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

export function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

export function passwordErrorMessage(password) {
  if (!password) return 'Le mot de passe est requis.';
  if (!validatePassword(password)) return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  return '';
}

function encodeBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function createSalt() {
  const values = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(values)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password, salt) {
  const message = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', message);
  return encodeBase64(new Uint8Array(digest));
}

