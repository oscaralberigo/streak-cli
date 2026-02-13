import { printJson, printKeyValue, printTable } from '../lib/output.js';

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
