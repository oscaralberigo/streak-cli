import streakapi from 'streakapi';
import { CliError } from './errors.js';

const { Streak } = streakapi;

export function resolveToken({ token }) {
  return token || process.env.STREAK_API_KEY;
}

export function createClient({ token }) {
  const resolvedToken = resolveToken({ token });

  if (!resolvedToken) {
    throw new CliError(
      'Missing Streak API token. Set STREAK_API_KEY or pass --token <apiKey>.',
      { code: 'MISSING_TOKEN', exitCode: 2 }
    );
  }

  return new Streak(resolvedToken);
}
