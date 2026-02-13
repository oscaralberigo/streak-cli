import { printJson, printTable } from '../lib/output.js';

export async function runSearch({ client, json, query }) {
  const results = await client.search(query);

  if (json) return printJson(results);

  const rows = (results || []).map((r) => [
    r.boxKey || r.key || '',
    r.name || r.displayName || '',
    r.pipelineName || r.pipelineKey || '',
  ]);

  printTable(['boxKey', 'name', 'pipeline'], rows);
}
