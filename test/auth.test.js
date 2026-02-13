import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient, resolveToken } from '../src/lib/auth.js';

test('resolveToken prefers explicit token over env', () => {
  const original = process.env.STREAK_API_KEY;
  process.env.STREAK_API_KEY = 'env-token';
  assert.equal(resolveToken({ token: 'flag-token' }), 'flag-token');
  process.env.STREAK_API_KEY = original;
});

test('createClient throws when token missing', () => {
  const original = process.env.STREAK_API_KEY;
  delete process.env.STREAK_API_KEY;

  assert.throws(() => createClient({ token: undefined }), /Missing Streak API token/);

  process.env.STREAK_API_KEY = original;
});
