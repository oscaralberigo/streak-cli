import { printJson, printTable } from '../lib/output.js';

export async function runPipelinesList({ client, json }) {
  const pipelines = await client.Pipelines.getAll();

  if (json) return printJson(pipelines);

  const rows = (pipelines || []).map((p) => [p.key, p.name, p.numRows ?? '']);
  printTable(['key', 'name', 'boxes'], rows);
}

export async function runPipelinesBoxes({ client, json, pipelineKey }) {
  const boxes = await client.Pipelines.getBoxes(pipelineKey);

  if (json) return printJson(boxes);

  const rows = (boxes || []).map((b) => [b.boxKey || b.key, b.name, b.stageKey || '']);
  printTable(['boxKey', 'name', 'stageKey'], rows);
}
