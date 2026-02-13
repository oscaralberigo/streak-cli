import { parseArgv } from './lib/args.js';
import { createClient, getRequiredToken } from './lib/auth.js';
import { CliError, normalizeSdkError } from './lib/errors.js';
import { getHelpText, resolveCommand, runCommand } from './commands/index.js';

export async function run(argv = process.argv.slice(2)) {
  const parsed = parseArgv(argv);
  const command = resolveCommand(parsed.positionals);

  if (command.type === 'help') {
    console.log(getHelpText());
    return 0;
  }

  try {
    const token = getRequiredToken({ token: parsed.token });
    const client = createClient({ token });
    await runCommand({ command, client, token, json: parsed.json });
    return 0;
  } catch (error) {
    if (error instanceof CliError) {
      console.error(error.message);
      return error.exitCode;
    }

    const normalized = normalizeSdkError(error);
    console.error(normalized.message);
    return normalized.exitCode;
  }
}
