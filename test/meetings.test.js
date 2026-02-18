import test from 'node:test';
import assert from 'node:assert/strict';
import { runBoxesMeetingsAdd, runBoxesMeetingsList, runBoxesTasksList } from '../src/commands/boxes.js';
import { runMeetingsComplete, runMeetingsDelete } from '../src/commands/meetings.js';

test('runBoxesMeetingsAdd calls v2 endpoint with form fields', async () => {
  let call;
  await runBoxesMeetingsAdd({
    token: 'tok',
    json: true,
    boxKey: 'box1',
    meetingType: 'PHONE_CALL',
    startTimestamp: 1700000,
    duration: 120000,
    apiRequest: async (params) => {
      call = params;
      return { meetingKey: 'm1' };
    },
  });

  assert.deepEqual(call, {
    token: 'tok',
    method: 'POST',
    path: '/api/v2/boxes/box1/meetings',
    form: {
      meetingType: 'PHONE_CALL',
      startTimestamp: 1700000,
      duration: 120000,
    },
  });
});

test('runBoxesMeetingsList calls v2 endpoint', async () => {
  let call;
  await runBoxesMeetingsList({
    token: 'tok',
    json: true,
    boxKey: 'box1',
    apiRequest: async (params) => {
      call = params;
      return [];
    },
  });

  assert.deepEqual(call, {
    token: 'tok',
    method: 'GET',
    path: '/api/v2/boxes/box1/meetings',
  });
});

test('runBoxesTasksList calls v2 endpoint', async () => {
  let call;
  await runBoxesTasksList({
    token: 'tok',
    json: true,
    boxKey: 'box1',
    apiRequest: async (params) => {
      call = params;
      return [];
    },
  });

  assert.deepEqual(call, {
    token: 'tok',
    method: 'GET',
    path: '/api/v2/boxes/box1/tasks',
  });
});

test('runMeetingsComplete/delete call expected endpoints', async () => {
  const calls = [];

  await runMeetingsComplete({
    token: 'tok',
    json: true,
    meetingKey: 'm1',
    apiRequest: async (params) => {
      calls.push(params);
      return {};
    },
  });

  await runMeetingsDelete({
    token: 'tok',
    json: true,
    meetingKey: 'm1',
    apiRequest: async (params) => {
      calls.push(params);
      return {};
    },
  });

  assert.deepEqual(calls, [
    { token: 'tok', method: 'POST', path: '/api/v2/meetings/m1' },
    { token: 'tok', method: 'DELETE', path: '/api/v2/meetings/m1' },
  ]);
});
