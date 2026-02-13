import { CliError } from '../lib/errors.js';
import { runMe } from './me.js';
import { runPipelinesBoxes, runPipelinesList } from './pipelines.js';
import { runBoxesComments, runBoxesGet } from './boxes.js';
import { runSearch } from './search.js';

export function getHelpText() {
  return `streak - CLI wrapper for Streak SDK

Usage:
  streak [--json] [--token <apiKey>] <command>

Commands:
  me
  pipelines list
  pipelines boxes <pipelineKey>
  boxes get <boxKey>
  boxes comments <boxKey>
  search <query>

Global flags:
  --json             Print raw JSON output
  --token <apiKey>   Override STREAK_API_KEY
  -h, --help         Show help
`;
}

export function resolveCommand(positionals) {
  const [root, sub, ...rest] = positionals;

  if (!root || root === '-h' || root === '--help' || root === 'help') {
    return { type: 'help' };
  }

  if (root === 'me') return { type: 'me' };

  if (root === 'pipelines' && sub === 'list') return { type: 'pipelines.list' };

  if (root === 'pipelines' && sub === 'boxes') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'pipelines.boxes', pipelineKey: rest[0] };
  }

  if (root === 'boxes' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.get', boxKey: rest[0] };
  }

  if (root === 'boxes' && sub === 'comments') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.comments', boxKey: rest[0] };
  }

  if (root === 'search') {
    const query = [sub, ...rest].filter(Boolean).join(' ').trim();
    if (!query) throw new CliError('Missing required argument: <query>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'search', query };
  }

  throw new CliError(`Unknown command: ${positionals.join(' ')}`, { code: 'ARG_ERROR', exitCode: 2 });
}

export async function runCommand({ command, client, json }) {
  switch (command.type) {
    case 'me':
      return runMe({ client, json });
    case 'pipelines.list':
      return runPipelinesList({ client, json });
    case 'pipelines.boxes':
      return runPipelinesBoxes({ client, json, pipelineKey: command.pipelineKey });
    case 'boxes.get':
      return runBoxesGet({ client, json, boxKey: command.boxKey });
    case 'boxes.comments':
      return runBoxesComments({ client, json, boxKey: command.boxKey });
    case 'search':
      return runSearch({ client, json, query: command.query });
    default:
      throw new CliError(`Unsupported command: ${command.type}`, { code: 'ARG_ERROR', exitCode: 2 });
  }
}
