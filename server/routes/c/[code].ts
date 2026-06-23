export default defineEventHandler((event) => {
  const code = event.context.params?.code ?? '';

  return sendRedirect(event, `/admin/carts/${code}`, 302);
});
