export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Enter a valid email address (e.g. name@lab.org)';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export function validateRegisterForm(
  username: string,
  email: string,
  password: string,
): string | null {
  if (!username.trim()) return 'Username is required';
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  const passErr = validatePassword(password);
  if (passErr) return passErr;
  return null;
}

export function validateLoginForm(email: string, password: string): string | null {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  if (!password) return 'Password is required';
  return null;
}
