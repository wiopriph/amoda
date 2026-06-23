export function assertExtension(event: any) {
  const config = useRuntimeConfig();
  const token = getHeader(event, 'x-extension-token');

  if (!token || !config.extensionToken || token !== config.extensionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid extension token' });
  }
}
