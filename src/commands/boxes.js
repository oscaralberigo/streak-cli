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

export async function runBoxesCommentsAdd({ token, json, boxKey, message, apiRequest = streakApiRequest }) {
  const comment = await apiRequest({
    token,
    method: 'POST',
    path: `/api/v2/boxes/${boxKey}/comments`,
    json: { message },
  });

  if (json) return printJson(comment);

  const commentKey = comment?.commentKey || comment?.key || '';
  console.log(`Created comment ${commentKey} on box ${boxKey}`.trim());
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

export async function runBoxesTasksList({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const tasks = await apiRequest({
    token,
    method: 'GET',
    path: `/api/v2/boxes/${boxKey}/tasks`,
  });

  if (json) return printJson(tasks);

  const rows = (tasks || []).map((t) => [
    t.taskKey || t.key || '',
    t.status || '',
    t.text || '',
    t.creatorKey || '',
    t.dueDate || '',
    (t.assignedToSharingEntries || []).map((a) => a.email || a.name || a.userKey || '').filter(Boolean).join(', '),
  ]);

  printTable(['taskKey', 'status', 'text', 'creatorKey', 'dueDate', 'assignedTo'], rows);
}

export async function runBoxesTasksCreate({
  token,
  json,
  boxKey,
  text,
  dueDate,
  assignees,
  apiRequest = streakApiRequest,
}) {
  const body = {
    boxKey,
    text,
  };

  if (dueDate !== undefined && dueDate !== null) body.dueDate = dueDate;
  if (assignees && assignees.length > 0) {
    body.assignedToSharingEntries = assignees.map((email) => ({ email }));
  }

  const task = await apiRequest({
    token,
    method: 'POST',
    path: `/api/v2/boxes/${boxKey}/tasks`,
    json: body,
  });

  if (json) return printJson(task);

  console.log(`Created task ${task?.taskKey || ''} on box ${boxKey}`.trim());
}

export async function runBoxesListInPipeline({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const boxes = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/boxes` });
  if (json) return printJson(boxes);
  const rows = (boxes || []).map((b) => [b.boxKey || b.key || '', b.name || '', b.stageKey || '']);
  printTable(['boxKey', 'name', 'stageKey'], rows);
}

export async function runBoxesCreate({ token, json, pipelineKey, body, apiRequest = streakApiRequest }) {
  const box = await apiRequest({ token, method: 'POST', path: `/api/v2/pipelines/${pipelineKey}/boxes`, json: body });
  if (json) return printJson(box);
  console.log(`Created box ${box?.boxKey || box?.key || ''}`.trim());
}

export async function runBoxesUpdate({ token, json, boxKey, body, apiRequest = streakApiRequest }) {
  const box = await apiRequest({ token, method: 'POST', path: `/api/v1/boxes/${boxKey}`, json: body });
  if (json) return printJson(box);
  console.log(`Updated box ${boxKey}`);
}

export async function runBoxesDelete({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/boxes/${boxKey}` });
  if (json) return printJson(result ?? { deleted: true, boxKey });
  console.log(`Deleted box ${boxKey}`);
}

export async function runBoxesTimeline({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const items = await apiRequest({ token, method: 'GET', path: `/api/v1/boxes/${boxKey}/timeline` });
  if (json) return printJson(items);
  const rows = (items || []).slice(0, 50).map((i) => [i.timestamp || i.time || '', i.type || i.eventType || '', i.key || i.id || '']);
  printTable(['timestamp', 'type', 'key'], rows);
}

export async function runCommentsGet({ token, json, commentKey, apiRequest = streakApiRequest }) {
  const comment = await apiRequest({ token, method: 'GET', path: `/api/v1/comments/${commentKey}` });
  if (json) return printJson(comment);
  printKeyValue(comment, ['commentKey', 'boxKey', 'message', 'timestamp']);
}

export async function runCommentsUpdate({ token, json, commentKey, message, apiRequest = streakApiRequest }) {
  const comment = await apiRequest({ token, method: 'POST', path: `/api/v1/comments/${commentKey}`, json: { message } });
  if (json) return printJson(comment);
  console.log(`Updated comment ${commentKey}`);
}

export async function runCommentsDelete({ token, json, commentKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/comments/${commentKey}` });
  if (json) return printJson(result ?? { deleted: true, commentKey });
  console.log(`Deleted comment ${commentKey}`);
}

export async function runTasksGet({ token, json, taskKey, apiRequest = streakApiRequest }) {
  const task = await apiRequest({ token, method: 'GET', path: `/api/v1/tasks/${taskKey}` });
  if (json) return printJson(task);
  printKeyValue(task, ['taskKey', 'boxKey', 'status', 'text', 'dueDate']);
}

export async function runTasksUpdate({ token, json, taskKey, body, apiRequest = streakApiRequest }) {
  const task = await apiRequest({ token, method: 'POST', path: `/api/v1/tasks/${taskKey}`, json: body });
  if (json) return printJson(task);
  console.log(`Updated task ${taskKey}`);
}

export async function runTasksDelete({ token, json, taskKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/tasks/${taskKey}` });
  if (json) return printJson(result ?? { deleted: true, taskKey });
  console.log(`Deleted task ${taskKey}`);
}
