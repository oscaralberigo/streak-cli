import { streakApiRequest } from '../lib/http.js';
import { printJson, printKeyValue, printTable } from '../lib/output.js';

export async function runTeamsList({ token, json, apiRequest = streakApiRequest }) {
  const teams = await apiRequest({ token, method: 'GET', path: '/api/v2/teams' });
  if (json) return printJson(teams);
  const rows = (teams || []).map((t) => [t.key || t.teamKey || '', t.name || '', String(t.private ?? '')]);
  printTable(['teamKey', 'name', 'private'], rows);
}

export async function runTeamsGet({ token, json, teamKey, apiRequest = streakApiRequest }) {
  const team = await apiRequest({ token, method: 'GET', path: `/api/v2/teams/${teamKey}` });
  if (json) return printJson(team);
  printKeyValue(team, ['key', 'name', 'private']);
}

export async function runContactsGet({ token, json, contactKey, apiRequest = streakApiRequest }) {
  const contact = await apiRequest({ token, method: 'GET', path: `/api/v1/contacts/${contactKey}` });
  if (json) return printJson(contact);
  printKeyValue(contact, ['key', 'displayName', 'givenName', 'familyName']);
}

export async function runContactsCreate({ token, json, teamKey, body, apiRequest = streakApiRequest }) {
  const contact = await apiRequest({ token, method: 'POST', path: `/api/v2/teams/${teamKey}/contacts/`, json: body });
  if (json) return printJson(contact);
  console.log(`Created contact ${contact?.key || contact?.contactKey || ''}`.trim());
}

export async function runContactsUpdate({ token, json, contactKey, body, apiRequest = streakApiRequest }) {
  const contact = await apiRequest({ token, method: 'POST', path: `/api/v1/contacts/${contactKey}`, json: body });
  if (json) return printJson(contact);
  console.log(`Updated contact ${contactKey}`);
}

export async function runContactsDelete({ token, json, contactKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/contacts/${contactKey}` });
  if (json) return printJson(result ?? { deleted: true, contactKey });
  console.log(`Deleted contact ${contactKey}`);
}

export async function runOrganizationsGet({ token, json, organizationKey, apiRequest = streakApiRequest }) {
  const org = await apiRequest({ token, method: 'GET', path: `/api/v1/organizations/${organizationKey}` });
  if (json) return printJson(org);
  printKeyValue(org, ['key', 'name']);
}

export async function runOrganizationsCreate({ token, json, teamKey, body, apiRequest = streakApiRequest }) {
  const org = await apiRequest({ token, method: 'POST', path: `/api/v2/teams/${teamKey}/organizations/`, json: body });
  if (json) return printJson(org);
  console.log(`Created organization ${org?.key || org?.organizationKey || ''}`.trim());
}

export async function runOrganizationsUpdate({ token, json, organizationKey, body, apiRequest = streakApiRequest }) {
  const org = await apiRequest({ token, method: 'POST', path: `/api/v1/organizations/${organizationKey}`, json: body });
  if (json) return printJson(org);
  console.log(`Updated organization ${organizationKey}`);
}

export async function runOrganizationsDelete({ token, json, organizationKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/organizations/${organizationKey}` });
  if (json) return printJson(result ?? { deleted: true, organizationKey });
  console.log(`Deleted organization ${organizationKey}`);
}

export async function runFilesList({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const files = await apiRequest({ token, method: 'GET', path: `/api/v1/boxes/${boxKey}/files` });
  if (json) return printJson(files);
  const rows = (files || []).map((f) => [f.key || f.fileKey || '', f.name || '', f.mimeType || '']);
  printTable(['fileKey', 'name', 'mimeType'], rows);
}

export async function runFilesGet({ token, json, fileKey, apiRequest = streakApiRequest }) {
  const file = await apiRequest({ token, method: 'GET', path: `/api/v1/files/${fileKey}` });
  if (json) return printJson(file);
  printKeyValue(file, ['key', 'name', 'mimeType', 'type']);
}

export async function runThreadsList({ token, json, boxKey, apiRequest = streakApiRequest }) {
  const threads = await apiRequest({ token, method: 'GET', path: `/api/v1/boxes/${boxKey}/threads` });
  if (json) return printJson(threads);
  const rows = (threads || []).map((t) => [t.key || t.threadKey || '', t.subject || '', t.lastTimestamp || '']);
  printTable(['threadKey', 'subject', 'lastTimestamp'], rows);
}

export async function runThreadsGet({ token, json, threadKey, apiRequest = streakApiRequest }) {
  const thread = await apiRequest({ token, method: 'GET', path: `/api/v1/threads/${threadKey}` });
  if (json) return printJson(thread);
  printKeyValue(thread, ['key', 'subject']);
}

export async function runThreadsPutInBox({ token, json, boxKey, threadKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'PUT', path: `/api/v1/boxes/${boxKey}/threads/${threadKey}` });
  if (json) return printJson(result ?? { added: true, boxKey, threadKey });
  console.log(`Added thread ${threadKey} to box ${boxKey}`);
}

export async function runThreadsRemove({ token, json, threadKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/threads/${threadKey}` });
  if (json) return printJson(result ?? { removed: true, threadKey });
  console.log(`Removed thread ${threadKey}`);
}

export async function runSnippetsList({ token, json, apiRequest = streakApiRequest }) {
  const snippets = await apiRequest({ token, method: 'GET', path: '/api/v1/snippets' });
  if (json) return printJson(snippets);
  const rows = (snippets || []).map((s) => [s.key || s.snippetKey || '', s.name || '', s.pipelineKey || '']);
  printTable(['snippetKey', 'name', 'pipelineKey'], rows);
}

export async function runSnippetsGet({ token, json, snippetKey, apiRequest = streakApiRequest }) {
  const snippet = await apiRequest({ token, method: 'GET', path: `/api/v1/snippets/${snippetKey}` });
  if (json) return printJson(snippet);
  printKeyValue(snippet, ['key', 'name', 'pipelineKey']);
}

export async function runSnippetsCreate({ token, json, body, apiRequest = streakApiRequest }) {
  const snippet = await apiRequest({ token, method: 'PUT', path: '/api/v1/snippets', form: body });
  if (json) return printJson(snippet);
  console.log(`Created snippet ${snippet?.key || snippet?.snippetKey || ''}`.trim());
}

export async function runSnippetsUpdate({ token, json, snippetKey, body, apiRequest = streakApiRequest }) {
  const snippet = await apiRequest({ token, method: 'POST', path: `/api/v1/snippets/${snippetKey}`, form: body });
  if (json) return printJson(snippet);
  console.log(`Updated snippet ${snippetKey}`);
}

export async function runSnippetsDelete({ token, json, snippetKey, apiRequest = streakApiRequest }) {
  const result = await apiRequest({ token, method: 'DELETE', path: `/api/v1/snippets/${snippetKey}` });
  if (json) return printJson(result ?? { deleted: true, snippetKey });
  console.log(`Deleted snippet ${snippetKey}`);
}
