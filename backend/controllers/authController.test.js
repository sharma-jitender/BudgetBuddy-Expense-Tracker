const { describe, it } = require('node:test');
const assert = require('node:assert');
const { normalizeEmail } = require('./authController');

describe('authController', () => {
  describe('normalizeEmail', () => {
    it('trims surrounding whitespace and lowercases the email', () => {
      assert.strictEqual(normalizeEmail('  Test@Example.COM  '), 'test@example.com');
    });

    it('returns an empty string for undefined input', () => {
      assert.strictEqual(normalizeEmail(undefined), '');
    });
  });
});
