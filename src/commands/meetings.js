import { printJson } from '../lib/output.js';
import { streakApiRequest } from '../lib/http.js';

export async function runMeetingsComplete({ token, json, meetingKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({
    token,
    method: 'POST',
    path: `/api/v2/meetings/${meetingKey}`,
  });

  if (json) return printJson(result);

  console.log(`Completed meeting ${meetingKey}`);
}

export async function runMeetingsDelete({ token, json, meetingKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({
    token,
    method: 'DELETE',
    path: `/api/v2/meetings/${meetingKey}`,
  });

  if (json) return printJson(result ?? { deleted: true, meetingKey });

  console.log(`Deleted meeting ${meetingKey}`);
}
