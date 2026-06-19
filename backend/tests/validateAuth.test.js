const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateEmail,
  validatePassword,
  validateRegisterBody,
  validateLoginBody,
} = require('../utils/validateAuth');

describe('validateAuth', () => {
  it('rejects invalid email formats', () => {
    assert.equal(validateEmail('not-an-email'), 'Enter a valid email address (e.g. name@lab.org)');
    assert.equal(validateEmail('a@b'), 'Enter a valid email address (e.g. name@lab.org)');
    assert.equal(validateEmail(''), 'Email is required');
  });

  it('accepts valid email', () => {
    assert.equal(validateEmail('researcher@lab.org'), null);
  });

  it('requires password of at least 8 characters on register', () => {
    assert.equal(validatePassword('short'), 'Password must be at least 8 characters');
    assert.equal(validatePassword('12345678'), null);
  });

  it('validates register body', () => {
    assert.equal(
      validateRegisterBody({ username: 'jdoe', email: 'bad', password: '12345678' }),
      'Enter a valid email address (e.g. name@lab.org)',
    );
    assert.equal(
      validateRegisterBody({ username: '', email: 'a@b.com', password: '12345678' }),
      'Username is required',
    );
    assert.equal(validateRegisterBody({ username: 'jdoe', email: 'a@b.com', password: '12345678' }), null);
  });

  it('validates login body email format', () => {
    assert.equal(validateLoginBody({ email: 'invalid', password: 'x' }), 'Enter a valid email address (e.g. name@lab.org)');
    assert.equal(validateLoginBody({ email: 'a@b.com', password: 'any' }), null);
  });
});
