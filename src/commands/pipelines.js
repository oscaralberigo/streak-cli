import { printJson, printTable } from '../lib/output.js';
import { streakApiRequest } from '../lib/http.js';

export async function runPipelinesList({ client, json }) {
  const pipelines = await client.Pipelines.getAll();

  if (json) return printJson(pipelines);

  const rows = (pipelines || []).map((p) => [p.key, p.name, p.numRows ?? '']);
  printTable(['key', 'name', 'boxes'], rows);
}

export async function runPipelinesGet({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const pipeline = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}` });
  if (json) return printJson(pipeline);
  printTable(['key', 'name', 'orgWide'], [[pipeline.key || pipeline.pipelineKey, pipeline.name || '', String(pipeline.orgWide ?? '')]]);
}

export async function runPipelinesCreate({ token, json, name, apiRequest = streakApiRequest }) {
  const pipeline = await apiRequest({ token, method: 'PUT', path: '/api/v1/pipelines', form: { name } });
  if (json) return printJson(pipeline);
  console.log(`Created pipeline ${pipeline?.key || ''} ${pipeline?.name || ''}`.trim());
}

export async function runPipelinesUpdate({ token, json, pipelineKey, body, apiRequest = streakApiRequest }) {
  const pipeline = await apiRequest({ token, method: 'POST', path: `/api/v1/pipelines/${pipelineKey}`, json: body });
  if (json) return printJson(pipeline);
  console.log(`Updated pipeline ${pipelineKey}`);
}

export async function runPipelinesDelete({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/pipelines/${pipelineKey}` });
  if (json) return printJson(result ?? { deleted: true, pipelineKey });
  console.log(`Deleted pipeline ${pipelineKey}`);
}

export async function runPipelinesBoxes({ client, json, pipelineKey }) {
  const boxes = await client.Pipelines.getBoxes(pipelineKey);

  if (json) return printJson(boxes);

  const rows = (boxes || []).map((b) => [b.boxKey || b.key, b.name, b.stageKey || '']);
  printTable(['boxKey', 'name', 'stageKey'], rows);
}
