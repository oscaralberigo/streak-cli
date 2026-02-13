import { printJson, printKeyValue, printTable } from '../lib/output.js';
import { streakApiRequest } from '../lib/http.js';

export async function runBoxesGet({ client, json, boxKey }) {
  const box = await client.Boxes.getOne(boxKey);

  if (json) return printJson(box);

  printKeyValue(box, ['boxKey', 'name', 'pipelineKey', 'stageKey', 'createdTimestamp']);
}

export async function runBoxesComments({ client, json, boxKey }) {
  const comments = await client.Boxes.getComments(boxKey);

  if (json) return printJson(comments);

  const rows = (comments || []).map((c) => [
    c.commentKey || c.key,
    c.author?.name || c.user?.name || '',
    (c.text || '').replace(/\s+/g, ' ').slice(0, 90),
  ]);

  printTable(['commentKey', 'author', 'text'], rows);
}

export async function runBoxesMeetingsAdd({ token, json, boxKey, meetingType, startTimestamp, duration, apiRequest = streakApiRequest }) {
  const meeting = await apiRequest({
    token,
    method: 'POST',
    path: `/api/v2/boxes/${boxKey}/meetings`,
    form: {
      meetingType,
      startTimestamp,
      duration,
    },
  });

  if (json) return printJson(meeting);

  console.log(`Added meeting ${meeting?.meetingKey || ''} to box ${boxKey}`.trim());
}

export async function runBoxesMeetingsList({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const meetings = await apiRequest({
    token,
    method: 'GET',
    path: `/api/v2/boxes/${boxKey}/meetings`,
  });

  if (json) return printJson(meetings);

  const rows = (meetings || []).map((m) => [
    m.meetingKey || '',
    m.meetingType || '',
    m.startTimestamp ?? '',
    m.duration ?? '',
    m.completed ? 'yes' : 'no',
  ]);

  printTable(['meetingKey', 'type', 'start', 'duration', 'completed'], rows);
}
