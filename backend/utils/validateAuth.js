const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address (e.g. name@lab.org)';
  }
  return null;
}

function validatePassword(password, { minLength = MIN_PASSWORD_LENGTH } = {}) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return null;
}

function validateRegisterBody({ username, email, password }) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return 'Username is required';
  }
  const emailError = validateEmail(email);
  if (emailError) return emailError;
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  return null;
}

function validateLoginBody({ email, password }) {
  const emailError = validateEmail(email);
  if (emailError) return emailError;
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  return null;
}

module.exports = {
  validateEmail,
  validatePassword,
  validateRegisterBody,
  validateLoginBody,
  MIN_PASSWORD_LENGTH,
};
