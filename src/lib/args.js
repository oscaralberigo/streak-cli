export function parseArgv(argv) {
  const args = [...argv];
  let json = false;
  let token;
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--json') {
      json = true;
      continue;
    }

    if (arg === '--token') {
      token = args[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--token=')) {
      token = arg.slice('--token='.length);
      continue;
    }

    positionals.push(arg);
  }

  return {
    json,
    token,
    positionals,
  };
}
