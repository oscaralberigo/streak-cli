import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgv } from '../src/lib/args.js';
import { resolveCommand } from '../src/commands/index.js';

test('parseArgv handles --json and --token', () => {
  const parsed = parseArgv(['--json', '--token', 'abc123', 'pipelines', 'list']);
  assert.equal(parsed.json, true);
  assert.equal(parsed.token, 'abc123');
  assert.deepEqual(parsed.positionals, ['pipelines', 'list']);
});

test('resolveCommand parses search query', () => {
  const cmd = resolveCommand(['search', 'big', 'deal']);
  assert.equal(cmd.type, 'search');
  assert.equal(cmd.query, 'big deal');
});
