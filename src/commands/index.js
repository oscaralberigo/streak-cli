import { CliError } from '../lib/errors.js';
import { runMe } from './me.js';
import { runPipelinesBoxes, runPipelinesList } from './pipelines.js';
import { runBoxesComments, runBoxesGet, runBoxesMeetingsAdd, runBoxesMeetingsList } from './boxes.js';
import { runSearch } from './search.js';
import { runMeetingsComplete, runMeetingsDelete } from './meetings.js';

function parseFlags(args) {
  const flags = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;

    if (arg.includes('=')) {
      const [key, value] = arg.slice(2).split('=');
      flags[key] = value;
      continue;
    }

    const key = arg.slice(2);
    const value = args[i + 1];
    if (value && !value.startsWith('--')) {
      flags[key] = value;
      i += 1;
    } else {
      flags[key] = true;
    }
  }

  return flags;
}

function parseRequiredIntFlag(flags, name) {
  const value = flags[name];
  if (value === undefined || value === true || value === '') {
    throw new CliError(`Missing required flag: --${name} <ms>`, { code: 'ARG_ERROR', exitCode: 2 });
  }

  if (!/^-?\d+$/.test(String(value))) {
    throw new CliError(`Flag --${name} must be an integer`, { code: 'ARG_ERROR', exitCode: 2 });
  }

  return Number(value);
}

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
  boxes meetings add <boxKey> --meeting-type <type> --start <ms> --duration <ms>
  boxes meetings list <boxKey>
  meetings complete <meetingKey>
  meetings delete <meetingKey>
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

  if (root === 'boxes' && sub === 'meetings') {
    const [action, boxKey, ...args] = rest;

    if (action === 'add') {
      if (!boxKey) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
      const flags = parseFlags(args);
      const meetingType = flags['meeting-type'];
      if (!meetingType || meetingType === true) {
        throw new CliError('Missing required flag: --meeting-type <type>', { code: 'ARG_ERROR', exitCode: 2 });
      }

      return {
        type: 'boxes.meetings.add',
        boxKey,
        meetingType,
        startTimestamp: parseRequiredIntFlag(flags, 'start'),
        duration: parseRequiredIntFlag(flags, 'duration'),
      };
    }

    if (action === 'list') {
      if (!boxKey) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
      return { type: 'boxes.meetings.list', boxKey };
    }
  }

  if (root === 'meetings' && sub === 'complete') {
    if (!rest[0]) throw new CliError('Missing required argument: <meetingKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'meetings.complete', meetingKey: rest[0] };
  }

  if (root === 'meetings' && sub === 'delete') {
    if (!rest[0]) throw new CliError('Missing required argument: <meetingKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'meetings.delete', meetingKey: rest[0] };
  }

  if (root === 'search') {
    const query = [sub, ...rest].filter(Boolean).join(' ').trim();
    if (!query) throw new CliError('Missing required argument: <query>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'search', query };
  }

  throw new CliError(`Unknown command: ${positionals.join(' ')}`, { code: 'ARG_ERROR', exitCode: 2 });
}

export async function runCommand({ command, client, token, json }) {
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
    case 'boxes.meetings.add':
      return runBoxesMeetingsAdd({
        token,
        json,
        boxKey: command.boxKey,
        meetingType: command.meetingType,
        startTimestamp: command.startTimestamp,
        duration: command.duration,
      });
    case 'boxes.meetings.list':
      return runBoxesMeetingsList({ token, json, boxKey: command.boxKey });
    case 'meetings.complete':
      return runMeetingsComplete({ token, json, meetingKey: command.meetingKey });
    case 'meetings.delete':
      return runMeetingsDelete({ token, json, meetingKey: command.meetingKey });
    case 'search':
      return runSearch({ client, json, query: command.query });
    default:
      throw new CliError(`Unsupported command: ${command.type}`, { code: 'ARG_ERROR', exitCode: 2 });
  }
}
