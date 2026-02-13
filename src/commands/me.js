import { printKeyValue, printJson } from '../lib/output.js';

export async function runMe({ client, json }) {
  const me = await client.Me.get();

  if (json) {
    printJson(me);
    return;
  }

  printKeyValue(me, ['name', 'email', 'userKey', 'timezone']);
}
