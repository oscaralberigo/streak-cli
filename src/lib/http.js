export async function streakApiRequest({ token, method = 'GET', path, form }) {
  const baseUrl = 'https://api.streak.com';
  const normalizedPath = path.startsWith('/api/') ? path : `/api/v1/${path.replace(/^\/+/, '')}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers = {
    Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
    Accept: 'application/json',
  };

  let body;
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(
      Object.entries(form).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) acc[key] = String(value);
        return acc;
      }, {})
    ).toString();
  }

  const response = await fetch(url, { method, headers, body });
  const text = await response.text();

  let parsed;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const error = new Error(
      parsed?.error || parsed?.message || (typeof parsed === 'string' ? parsed : `Response code ${response.status}`)
    );
    error.status = response.status;
    error.response = { body: parsed, text };
    throw error;
  }

  return parsed;
}
