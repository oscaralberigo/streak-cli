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

test('resolveCommand parses boxes meetings add', () => {
  const cmd = resolveCommand([
    'boxes',
    'meetings',
    'add',
    'box123',
    '--meeting-type',
    'PHONE_CALL',
    '--start',
    '1700000000000',
    '--duration',
    '1800000',
  ]);

  assert.equal(cmd.type, 'boxes.meetings.add');
  assert.equal(cmd.boxKey, 'box123');
  assert.equal(cmd.meetingType, 'PHONE_CALL');
  assert.equal(cmd.startTimestamp, 1700000000000);
  assert.equal(cmd.duration, 1800000);
});

test('resolveCommand validates integer flags for boxes meetings add', () => {
  assert.throws(
    () => resolveCommand(['boxes', 'meetings', 'add', 'box123', '--meeting-type', 'PHONE_CALL', '--start', 'abc', '--duration', '1']),
    /--start must be an integer/
  );
});

test('resolveCommand parses meetings complete/delete', () => {
  const complete = resolveCommand(['meetings', 'complete', 'meeting-1']);
  assert.equal(complete.type, 'meetings.complete');
  assert.equal(complete.meetingKey, 'meeting-1');

  const del = resolveCommand(['meetings', 'delete', 'meeting-2']);
  assert.equal(del.type, 'meetings.delete');
  assert.equal(del.meetingKey, 'meeting-2');
});
