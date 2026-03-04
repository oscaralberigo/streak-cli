import { streakApiRequest } from '../lib/http.js';
import { printJson, printKeyValue, printTable } from '../lib/output.js';

export async function runStagesList({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const stages = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/stages` });
  if (json) return printJson(stages);
  const rows = (stages || []).map((s) => [s.key || s.stageKey || '', s.name || '', s.index ?? '']);
  printTable(['stageKey', 'name', 'index'], rows);
}

export async function runStagesGet({ token, json, pipelineKey, stageKey, apiRequest = streakApiRequest }) {
  const stage = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/stages/${stageKey}` });
  if (json) return printJson(stage);
  printKeyValue(stage, ['key', 'name', 'index']);
}

export async function runStagesCreate({ token, json, pipelineKey, name, apiRequest = streakApiRequest }) {
  const stage = await apiRequest({ token, method: 'PUT', path: `/api/v1/pipelines/${pipelineKey}/stages`, form: { name } });
  if (json) return printJson(stage);
  console.log(`Created stage ${stage?.key || stage?.stageKey || ''} in pipeline ${pipelineKey}`.trim());
}

export async function runStagesUpdate({ token, json, pipelineKey, stageKey, name, apiRequest = streakApiRequest }) {
  const stage = await apiRequest({ token, method: 'POST', path: `/api/v1/pipelines/${pipelineKey}/stages/${stageKey}`, form: { name } });
  if (json) return printJson(stage);
  console.log(`Updated stage ${stageKey}`);
}

export async function runFieldsList({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const fields = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/fields` });
  if (json) return printJson(fields);
  const rows = (fields || []).map((f) => [f.key || f.fieldKey || '', f.name || '', f.type || '']);
  printTable(['fieldKey', 'name', 'type'], rows);
}

export async function runFieldsGet({ token, json, pipelineKey, fieldKey, apiRequest = streakApiRequest }) {
  const field = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/fields/${fieldKey}` });
  if (json) return printJson(field);
  printKeyValue(field, ['key', 'name', 'type']);
}

export async function runFieldsCreate({ token, json, pipelineKey, body, apiRequest = streakApiRequest }) {
  const field = await apiRequest({ token, method: 'PUT', path: `/api/v1/pipelines/${pipelineKey}/fields`, json: body });
  if (json) return printJson(field);
  console.log(`Created field ${field?.key || field?.fieldKey || ''} in pipeline ${pipelineKey}`.trim());
}

export async function runFieldsUpdate({ token, json, pipelineKey, fieldKey, body, apiRequest = streakApiRequest }) {
  const field = await apiRequest({ token, method: 'POST', path: `/api/v1/pipelines/${pipelineKey}/fields/${fieldKey}`, json: body });
  if (json) return printJson(field);
  console.log(`Updated field ${fieldKey}`);
}

export async function runBoxFieldValuesList({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const values = await apiRequest({ token, method: 'GET', path: `/api/v1/boxes/${boxKey}/fields` });
  if (json) return printJson(values);
  const rows = (values || []).map((v) => [v.fieldKey || v.key || '', JSON.stringify(v.value ?? v) ]);
  printTable(['fieldKey', 'value'], rows);
}

export async function runBoxFieldValueGet({ token, json, boxKey, fieldKey, apiRequest = streakApiRequest }) {
  const value = await apiRequest({ token, method: 'GET', path: `/api/v1/boxes/${boxKey}/fields/${fieldKey}` });
  if (json) return printJson(value);
  printJson(value);
}

export async function runBoxFieldValueUpdate({ token, json, boxKey, fieldKey, body, apiRequest = streakApiRequest }) {
  const value = await apiRequest({ token, method: 'POST', path: `/api/v1/boxes/${boxKey}/fields/${fieldKey}`, json: body });
  if (json) return printJson(value);
  console.log(`Updated field value ${fieldKey} on box ${boxKey}`);
}

export async function runWebhooksCreate({ token, json, body, apiRequest = streakApiRequest }) {
  const webhook = await apiRequest({ token, method: 'POST', path: '/api/v2/webhooks', json: body });
  if (json) return printJson(webhook);
  console.log(`Created webhook ${webhook?.key || webhook?.webhookKey || ''}`.trim());
}

export async function runWebhooksGet({ token, json, webhookKey, apiRequest = streakApiRequest }) {
  const webhook = await apiRequest({ token, method: 'GET', path: `/api/v2/webhooks/${webhookKey}` });
  if (json) return printJson(webhook);
  printKeyValue(webhook, ['key', 'event', 'targetUrl']);
}

export async function runWebhooksUpdate({ token, json, webhookKey, body, apiRequest = streakApiRequest }) {
  const webhook = await apiRequest({ token, method: 'POST', path: `/api/v2/webhooks/${webhookKey}`, json: body });
  if (json) return printJson(webhook);
  console.log(`Updated webhook ${webhookKey}`);
}

export async function runWebhooksListPipeline({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const hooks = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/webhooks` });
  if (json) return printJson(hooks);
  const rows = (hooks || []).map((h) => [h.key || h.webhookKey || '', h.event || '', h.targetUrl || '']);
  printTable(['webhookKey', 'event', 'targetUrl'], rows);
}

export async function runWebhooksListTeam({ token, json, teamKey, apiRequest = streakApiRequest }) {
  const hooks = await apiRequest({ token, method: 'GET', path: `/api/v2/teams/${teamKey}/webhooks` });
  if (json) return printJson(hooks);
  const rows = (hooks || []).map((h) => [h.key || h.webhookKey || '', h.event || '', h.targetUrl || '']);
  printTable(['webhookKey', 'event', 'targetUrl'], rows);
}

export async function runNewsfeedAll({ token, json, apiRequest = streakApiRequest }) {
  const items = await apiRequest({ token, method: 'GET', path: '/api/v1/newsfeed' });
  if (json) return printJson(items);
  const rows = (items || []).map((i) => [i.timestamp || '', i.eventType || i.type || '', i.boxKey || i.pipelineKey || '']);
  printTable(['timestamp', 'event', 'key'], rows);
}

export async function runNewsfeedPipeline({ token, json, pipelineKey, apiRequest = streakApiRequest }) {
  const items = await apiRequest({ token, method: 'GET', path: `/api/v1/pipelines/${pipelineKey}/newsfeed` });
  if (json) return printJson(items);
  const rows = (items || []).map((i) => [i.timestamp || '', i.eventType || i.type || '', i.boxKey || '']);
  printTable(['timestamp', 'event', 'boxKey'], rows);
}

export async function runNewsfeedBox({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const items = await apiRequest({ token, method: 'GET', path: `/api/v1/boxes/${boxKey}/newsfeed` });
  if (json) return printJson(items);
  const rows = (items || []).map((i) => [i.timestamp || '', i.eventType || i.type || '', i.key || i.id || '']);
  printTable(['timestamp', 'event', 'key'], rows);
}
