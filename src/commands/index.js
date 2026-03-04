import { CliError } from '../lib/errors.js';
import { runMe } from './me.js';
import { runPipelinesBoxes, runPipelinesCreate, runPipelinesGet, runPipelinesList, runPipelinesUpdate } from './pipelines.js';
import { runBoxesComments, runBoxesCommentsAdd, runBoxesCreate, runBoxesGet, runBoxesListInPipeline, runBoxesMeetingsAdd, runBoxesMeetingsList, runBoxesTasksCreate, runBoxesTasksList, runBoxesTimeline, runBoxesUpdate, runCommentsGet, runCommentsUpdate, runTasksGet, runTasksUpdate } from './boxes.js';
import { runSearch } from './search.js';
import { runMeetingsComplete } from './meetings.js';
import { runBoxFieldValueGet, runBoxFieldValueUpdate, runBoxFieldValuesList, runFieldsCreate, runFieldsGet, runFieldsList, runFieldsUpdate, runNewsfeedAll, runNewsfeedBox, runNewsfeedPipeline, runStagesCreate, runStagesGet, runStagesList, runStagesUpdate, runWebhooksCreate, runWebhooksGet, runWebhooksListPipeline, runWebhooksListTeam, runWebhooksUpdate } from './advanced.js';
import { runContactsCreate, runContactsGet, runContactsUpdate, runFilesGet, runFilesList, runOrganizationsCreate, runOrganizationsGet, runOrganizationsUpdate, runSnippetsCreate, runSnippetsGet, runSnippetsList, runSnippetsUpdate, runTeamsGet, runTeamsList, runThreadsGet, runThreadsList, runThreadsPutInBox } from './entities.js';

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

function parseRequiredJsonFlag(flags, name) {
  const value = flags[name];
  if (value === undefined || value === true || value === '') {
    throw new CliError(`Missing required flag: --${name} '<json>'`, { code: 'ARG_ERROR', exitCode: 2 });
  }
  try {
    return JSON.parse(String(value));
  } catch {
    throw new CliError(`Flag --${name} must be valid JSON`, { code: 'ARG_ERROR', exitCode: 2 });
  }
}

export function getHelpText() {
  return `streak - CLI wrapper for Streak SDK

Usage:
  streak [--json] [--token <apiKey>] <command>

Commands:
  me
  pipelines list
  pipelines get <pipelineKey>
  pipelines create --name <name>
  pipelines update <pipelineKey> --body '<json>'
  pipelines boxes <pipelineKey>

  boxes list <pipelineKey>
  boxes get <boxKey>
  boxes create <pipelineKey> --body '<json>'
  boxes update <boxKey> --body '<json>'
  boxes timeline <boxKey>

  boxes comments <boxKey>
  boxes comments add <boxKey> --message <text>
  comments get <commentKey>
  comments update <commentKey> --message <text>

  boxes tasks <boxKey>
  boxes tasks add <boxKey> --text <task> [--due-date <ms>] [--assignee <email> --assignee <email> ...]
  tasks get <taskKey>
  tasks update <taskKey> --body '<json>'

  boxes meetings add <boxKey> --meeting-type <type> --start <ms> --duration <ms>
  boxes meetings list <boxKey>
  meetings complete <meetingKey>

  stages list <pipelineKey>
  stages get <pipelineKey> <stageKey>
  stages create <pipelineKey> --name <name>
  stages update <pipelineKey> <stageKey> --name <name>

  fields list <pipelineKey>
  fields get <pipelineKey> <fieldKey>
  fields create <pipelineKey> --body '<json>'
  fields update <pipelineKey> <fieldKey> --body '<json>'
  fields values list <boxKey>
  fields values get <boxKey> <fieldKey>
  fields values update <boxKey> <fieldKey> --body '<json>'

  webhooks create --body '<json>'
  webhooks get <webhookKey>
  webhooks update <webhookKey> --body '<json>'
  webhooks list pipeline <pipelineKey>
  webhooks list team <teamKey>

  newsfeed all
  newsfeed pipeline <pipelineKey>
  newsfeed box <boxKey>

  teams list
  teams get <teamKey>

  contacts get <contactKey>
  contacts create <teamKey> --body '<json>'
  contacts update <contactKey> --body '<json>'

  organizations get <organizationKey>
  organizations create <teamKey> --body '<json>'
  organizations update <organizationKey> --body '<json>'

  files list <boxKey>
  files get <fileKey>

  threads list <boxKey>
  threads get <threadKey>
  threads put <boxKey> <threadKey>

  snippets list
  snippets get <snippetKey>
  snippets create --body '<json>'
  snippets update <snippetKey> --body '<json>'

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

  if (root === 'pipelines' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'pipelines.get', pipelineKey: rest[0] };
  }

  if (root === 'pipelines' && sub === 'create') {
    const flags = parseFlags(rest);
    const name = flags.name;
    if (!name || name === true) throw new CliError('Missing required flag: --name <name>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'pipelines.create', name: String(name) };
  }

  if (root === 'pipelines' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'pipelines.update', pipelineKey: rest[0], body };
  }

  if (root === 'pipelines' && sub === 'boxes') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'pipelines.boxes', pipelineKey: rest[0] };
  }

  if (root === 'boxes' && sub === 'list') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.list', pipelineKey: rest[0] };
  }

  if (root === 'boxes' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.get', boxKey: rest[0] };
  }

  if (root === 'boxes' && sub === 'create') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'boxes.create', pipelineKey: rest[0], body };
  }

  if (root === 'boxes' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'boxes.update', boxKey: rest[0], body };
  }

  if (root === 'boxes' && sub === 'timeline') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.timeline', boxKey: rest[0] };
  }

  if (root === 'boxes' && sub === 'comments') {
    const [actionOrBoxKey, maybeBoxKey, ...args] = rest;

    if (actionOrBoxKey === 'add') {
      if (!maybeBoxKey) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
      const flags = parseFlags(args);
      const message = flags.message;
      if (!message || message === true) {
        throw new CliError('Missing required flag: --message <text>', { code: 'ARG_ERROR', exitCode: 2 });
      }

      return {
        type: 'boxes.comments.add',
        boxKey: maybeBoxKey,
        message: String(message),
      };
    }

    if (!actionOrBoxKey) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.comments', boxKey: actionOrBoxKey };
  }

  if (root === 'boxes' && sub === 'tasks') {
    const [actionOrBoxKey, maybeBoxKey, ...args] = rest;

    if (actionOrBoxKey === 'add') {
      if (!maybeBoxKey) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
      const flags = parseFlags(args);
      const text = flags.text;
      if (!text || text === true) {
        throw new CliError('Missing required flag: --text <task>', { code: 'ARG_ERROR', exitCode: 2 });
      }

      const assignees = [];
      for (let i = 0; i < args.length; i += 1) {
        if (args[i] === '--assignee') {
          const value = args[i + 1];
          if (!value || value.startsWith('--')) {
            throw new CliError('Missing value for --assignee <email>', { code: 'ARG_ERROR', exitCode: 2 });
          }
          assignees.push(value);
          i += 1;
        }
      }

      const dueDate = flags['due-date'] !== undefined ? parseRequiredIntFlag(flags, 'due-date') : undefined;

      return {
        type: 'boxes.tasks.add',
        boxKey: maybeBoxKey,
        text: String(text),
        dueDate,
        assignees,
      };
    }

    if (!actionOrBoxKey) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'boxes.tasks.list', boxKey: actionOrBoxKey };
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

  if (root === 'comments' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <commentKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'comments.get', commentKey: rest[0] };
  }

  if (root === 'comments' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <commentKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const message = flags.message;
    if (!message || message === true) throw new CliError('Missing required flag: --message <text>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'comments.update', commentKey: rest[0], message: String(message) };
  }

  if (root === 'tasks' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <taskKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'tasks.get', taskKey: rest[0] };
  }

  if (root === 'tasks' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <taskKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'tasks.update', taskKey: rest[0], body };
  }

  if (root === 'meetings' && sub === 'complete') {
    if (!rest[0]) throw new CliError('Missing required argument: <meetingKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'meetings.complete', meetingKey: rest[0] };
  }

  if (root === 'stages' && sub === 'list') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'stages.list', pipelineKey: rest[0] };
  }

  if (root === 'stages' && sub === 'get') {
    if (!rest[0] || !rest[1]) throw new CliError('Usage: stages get <pipelineKey> <stageKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'stages.get', pipelineKey: rest[0], stageKey: rest[1] };
  }

  if (root === 'stages' && sub === 'create') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const name = flags.name;
    if (!name || name === true) throw new CliError('Missing required flag: --name <name>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'stages.create', pipelineKey: rest[0], name: String(name) };
  }

  if (root === 'stages' && sub === 'update') {
    if (!rest[0] || !rest[1]) throw new CliError('Usage: stages update <pipelineKey> <stageKey> --name <name>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(2));
    const name = flags.name;
    if (!name || name === true) throw new CliError('Missing required flag: --name <name>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'stages.update', pipelineKey: rest[0], stageKey: rest[1], name: String(name) };
  }

  if (root === 'fields' && sub === 'list') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'fields.list', pipelineKey: rest[0] };
  }

  if (root === 'fields' && sub === 'get') {
    if (!rest[0] || !rest[1]) throw new CliError('Usage: fields get <pipelineKey> <fieldKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'fields.get', pipelineKey: rest[0], fieldKey: rest[1] };
  }

  if (root === 'fields' && sub === 'create') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'fields.create', pipelineKey: rest[0], body };
  }

  if (root === 'fields' && sub === 'update') {
    if (!rest[0] || !rest[1]) throw new CliError('Usage: fields update <pipelineKey> <fieldKey> --body <json>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(2));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'fields.update', pipelineKey: rest[0], fieldKey: rest[1], body };
  }

  if (root === 'fields' && sub === 'values') {
    const [action, boxKey, fieldKey, ...args] = rest;
    if (action === 'list') {
      if (!boxKey) throw new CliError('Usage: fields values list <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
      return { type: 'fields.values.list', boxKey };
    }
    if (action === 'get') {
      if (!boxKey || !fieldKey) throw new CliError('Usage: fields values get <boxKey> <fieldKey>', { code: 'ARG_ERROR', exitCode: 2 });
      return { type: 'fields.values.get', boxKey, fieldKey };
    }
    if (action === 'update') {
      if (!boxKey || !fieldKey) throw new CliError('Usage: fields values update <boxKey> <fieldKey> --body <json>', { code: 'ARG_ERROR', exitCode: 2 });
      const flags = parseFlags(args);
      const body = parseRequiredJsonFlag(flags, 'body');
      return { type: 'fields.values.update', boxKey, fieldKey, body };
    }
  }

  if (root === 'webhooks' && sub === 'create') {
    const flags = parseFlags(rest);
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'webhooks.create', body };
  }

  if (root === 'webhooks' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <webhookKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'webhooks.get', webhookKey: rest[0] };
  }

  if (root === 'webhooks' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <webhookKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'webhooks.update', webhookKey: rest[0], body };
  }

  if (root === 'webhooks' && sub === 'list') {
    if (rest[0] === 'pipeline') {
      if (!rest[1]) throw new CliError('Usage: webhooks list pipeline <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
      return { type: 'webhooks.list.pipeline', pipelineKey: rest[1] };
    }
    if (rest[0] === 'team') {
      if (!rest[1]) throw new CliError('Usage: webhooks list team <teamKey>', { code: 'ARG_ERROR', exitCode: 2 });
      return { type: 'webhooks.list.team', teamKey: rest[1] };
    }
  }

  if (root === 'newsfeed' && sub === 'all') return { type: 'newsfeed.all' };
  if (root === 'newsfeed' && sub === 'pipeline') {
    if (!rest[0]) throw new CliError('Missing required argument: <pipelineKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'newsfeed.pipeline', pipelineKey: rest[0] };
  }
  if (root === 'newsfeed' && sub === 'box') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'newsfeed.box', boxKey: rest[0] };
  }

  if (root === 'teams' && sub === 'list') return { type: 'teams.list' };
  if (root === 'teams' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <teamKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'teams.get', teamKey: rest[0] };
  }

  if (root === 'contacts' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <contactKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'contacts.get', contactKey: rest[0] };
  }
  if (root === 'contacts' && sub === 'create') {
    if (!rest[0]) throw new CliError('Missing required argument: <teamKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'contacts.create', teamKey: rest[0], body };
  }
  if (root === 'contacts' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <contactKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'contacts.update', contactKey: rest[0], body };
  }
  if (root === 'organizations' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <organizationKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'organizations.get', organizationKey: rest[0] };
  }
  if (root === 'organizations' && sub === 'create') {
    if (!rest[0]) throw new CliError('Missing required argument: <teamKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'organizations.create', teamKey: rest[0], body };
  }
  if (root === 'organizations' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <organizationKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'organizations.update', organizationKey: rest[0], body };
  }
  if (root === 'files' && sub === 'list') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'files.list', boxKey: rest[0] };
  }
  if (root === 'files' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <fileKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'files.get', fileKey: rest[0] };
  }

  if (root === 'threads' && sub === 'list') {
    if (!rest[0]) throw new CliError('Missing required argument: <boxKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'threads.list', boxKey: rest[0] };
  }
  if (root === 'threads' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <threadKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'threads.get', threadKey: rest[0] };
  }
  if (root === 'threads' && sub === 'put') {
    if (!rest[0] || !rest[1]) throw new CliError('Usage: threads put <boxKey> <threadKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'threads.put', boxKey: rest[0], threadKey: rest[1] };
  }
  if (root === 'snippets' && sub === 'list') return { type: 'snippets.list' };
  if (root === 'snippets' && sub === 'get') {
    if (!rest[0]) throw new CliError('Missing required argument: <snippetKey>', { code: 'ARG_ERROR', exitCode: 2 });
    return { type: 'snippets.get', snippetKey: rest[0] };
  }
  if (root === 'snippets' && sub === 'create') {
    const flags = parseFlags(rest);
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'snippets.create', body };
  }
  if (root === 'snippets' && sub === 'update') {
    if (!rest[0]) throw new CliError('Missing required argument: <snippetKey>', { code: 'ARG_ERROR', exitCode: 2 });
    const flags = parseFlags(rest.slice(1));
    const body = parseRequiredJsonFlag(flags, 'body');
    return { type: 'snippets.update', snippetKey: rest[0], body };
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
    case 'pipelines.get':
      return runPipelinesGet({ token, json, pipelineKey: command.pipelineKey });
    case 'pipelines.create':
      return runPipelinesCreate({ token, json, name: command.name });
    case 'pipelines.update':
      return runPipelinesUpdate({ token, json, pipelineKey: command.pipelineKey, body: command.body });
    case 'pipelines.boxes':
      return runPipelinesBoxes({ client, json, pipelineKey: command.pipelineKey });
    case 'boxes.list':
      return runBoxesListInPipeline({ token, json, pipelineKey: command.pipelineKey });
    case 'boxes.get':
      return runBoxesGet({ client, json, boxKey: command.boxKey });
    case 'boxes.create':
      return runBoxesCreate({ token, json, pipelineKey: command.pipelineKey, body: command.body });
    case 'boxes.update':
      return runBoxesUpdate({ token, json, boxKey: command.boxKey, body: command.body });
    case 'boxes.timeline':
      return runBoxesTimeline({ token, json, boxKey: command.boxKey });
    case 'boxes.comments':
      return runBoxesComments({ client, json, boxKey: command.boxKey });
    case 'boxes.comments.add':
      return runBoxesCommentsAdd({ token, json, boxKey: command.boxKey, message: command.message });
    case 'comments.get':
      return runCommentsGet({ token, json, commentKey: command.commentKey });
    case 'comments.update':
      return runCommentsUpdate({ token, json, commentKey: command.commentKey, message: command.message });
    case 'boxes.tasks.list':
      return runBoxesTasksList({ token, json, boxKey: command.boxKey });
    case 'boxes.tasks.add':
      return runBoxesTasksCreate({
        token,
        json,
        boxKey: command.boxKey,
        text: command.text,
        dueDate: command.dueDate,
        assignees: command.assignees,
      });
    case 'tasks.get':
      return runTasksGet({ token, json, taskKey: command.taskKey });
    case 'tasks.update':
      return runTasksUpdate({ token, json, taskKey: command.taskKey, body: command.body });
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
    case 'stages.list':
      return runStagesList({ token, json, pipelineKey: command.pipelineKey });
    case 'stages.get':
      return runStagesGet({ token, json, pipelineKey: command.pipelineKey, stageKey: command.stageKey });
    case 'stages.create':
      return runStagesCreate({ token, json, pipelineKey: command.pipelineKey, name: command.name });
    case 'stages.update':
      return runStagesUpdate({ token, json, pipelineKey: command.pipelineKey, stageKey: command.stageKey, name: command.name });
    case 'fields.list':
      return runFieldsList({ token, json, pipelineKey: command.pipelineKey });
    case 'fields.get':
      return runFieldsGet({ token, json, pipelineKey: command.pipelineKey, fieldKey: command.fieldKey });
    case 'fields.create':
      return runFieldsCreate({ token, json, pipelineKey: command.pipelineKey, body: command.body });
    case 'fields.update':
      return runFieldsUpdate({ token, json, pipelineKey: command.pipelineKey, fieldKey: command.fieldKey, body: command.body });
    case 'fields.values.list':
      return runBoxFieldValuesList({ token, json, boxKey: command.boxKey });
    case 'fields.values.get':
      return runBoxFieldValueGet({ token, json, boxKey: command.boxKey, fieldKey: command.fieldKey });
    case 'fields.values.update':
      return runBoxFieldValueUpdate({ token, json, boxKey: command.boxKey, fieldKey: command.fieldKey, body: command.body });
    case 'webhooks.create':
      return runWebhooksCreate({ token, json, body: command.body });
    case 'webhooks.get':
      return runWebhooksGet({ token, json, webhookKey: command.webhookKey });
    case 'webhooks.update':
      return runWebhooksUpdate({ token, json, webhookKey: command.webhookKey, body: command.body });
    case 'webhooks.list.pipeline':
      return runWebhooksListPipeline({ token, json, pipelineKey: command.pipelineKey });
    case 'webhooks.list.team':
      return runWebhooksListTeam({ token, json, teamKey: command.teamKey });
    case 'newsfeed.all':
      return runNewsfeedAll({ token, json });
    case 'newsfeed.pipeline':
      return runNewsfeedPipeline({ token, json, pipelineKey: command.pipelineKey });
    case 'newsfeed.box':
      return runNewsfeedBox({ token, json, boxKey: command.boxKey });
    case 'teams.list':
      return runTeamsList({ token, json });
    case 'teams.get':
      return runTeamsGet({ token, json, teamKey: command.teamKey });
    case 'contacts.get':
      return runContactsGet({ token, json, contactKey: command.contactKey });
    case 'contacts.create':
      return runContactsCreate({ token, json, teamKey: command.teamKey, body: command.body });
    case 'contacts.update':
      return runContactsUpdate({ token, json, contactKey: command.contactKey, body: command.body });
    case 'organizations.get':
      return runOrganizationsGet({ token, json, organizationKey: command.organizationKey });
    case 'organizations.create':
      return runOrganizationsCreate({ token, json, teamKey: command.teamKey, body: command.body });
    case 'organizations.update':
      return runOrganizationsUpdate({ token, json, organizationKey: command.organizationKey, body: command.body });
    case 'files.list':
      return runFilesList({ token, json, boxKey: command.boxKey });
    case 'files.get':
      return runFilesGet({ token, json, fileKey: command.fileKey });
    case 'threads.list':
      return runThreadsList({ token, json, boxKey: command.boxKey });
    case 'threads.get':
      return runThreadsGet({ token, json, threadKey: command.threadKey });
    case 'threads.put':
      return runThreadsPutInBox({ token, json, boxKey: command.boxKey, threadKey: command.threadKey });
    case 'snippets.list':
      return runSnippetsList({ token, json });
    case 'snippets.get':
      return runSnippetsGet({ token, json, snippetKey: command.snippetKey });
    case 'snippets.create':
      return runSnippetsCreate({ token, json, body: command.body });
    case 'snippets.update':
      return runSnippetsUpdate({ token, json, snippetKey: command.snippetKey, body: command.body });
    case 'search':
      return runSearch({ client, json, query: command.query });
    default:
      throw new CliError(`Unsupported command: ${command.type}`, { code: 'ARG_ERROR', exitCode: 2 });
  }
}
