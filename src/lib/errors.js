export class CliError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'CliError';
    this.code = options.code ?? 'CLI_ERROR';
    this.cause = options.cause;
    this.exitCode = options.exitCode ?? 1;
  }
}

export function normalizeSdkError(error) {
  if (!error) {
    return new CliError('Unknown error', { code: 'UNKNOWN_ERROR' });
  }

  const status = error.status || error.statusCode || error.code;
  const bodyMessage =
    error.response?.body?.message ||
    error.response?.text ||
    error.body?.message ||
    error.message;

  const message = status
    ? `Streak API error (${status}): ${bodyMessage || 'Request failed'}`
    : `Streak API error: ${bodyMessage || 'Request failed'}`;

  return new CliError(message, {
    code: 'SDK_ERROR',
    cause: error,
    exitCode: 1,
  });
}
