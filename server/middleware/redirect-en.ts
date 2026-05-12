export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  if (url.pathname !== '/en' && !url.pathname.startsWith('/en/')) {
    return;
  }

  const targetPath = url.pathname === '/en' ? '/' : url.pathname.slice('/en'.length);

  return sendRedirect(event, `${targetPath}${url.search}`, 301);
});
