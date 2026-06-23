export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin') ?? '';
  const path = event.path ?? '';

  if (!path.startsWith('/api/extension/')) return;

  if (origin === 'https://online.moysklad.ru' || origin.endsWith('.moysklad.ru')) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-extension-token',
    });
  }

  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});
