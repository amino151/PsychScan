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

