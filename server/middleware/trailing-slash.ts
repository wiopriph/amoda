// URL со слэшем на конце отдавали 200 — дубли для поисковика; приводим к без-слэшевому виду
export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  if (path === '/' || !path.endsWith('/')) {
    return;
  }

  if (path.startsWith('/api/') || path.startsWith('/_')) {
    return;
  }

  return sendRedirect(event, `${path.replace(/\/+$/, '')}${url.search}`, 301);
});
