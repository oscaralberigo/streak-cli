export function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(headers, rows) {
  const widths = headers.map((h, i) => {
    const maxCell = rows.reduce((m, row) => Math.max(m, String(row[i] ?? '').length), 0);
    return Math.max(String(h).length, maxCell);
  });

  const render = (cols) =>
    cols
      .map((c, i) => String(c ?? '').padEnd(widths[i]))
      .join('  ')
      .trimEnd();

  console.log(render(headers));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) {
    console.log(render(row));
  }
}

export function printKeyValue(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined) {
      console.log(`${key}: ${obj[key]}`);
    }
  }
}
