export default defineNuxtRouteMiddleware((to) => {
  const { user, isAccountEnabled, canAccessAccount } = useAuth();

  if (!isAccountEnabled.value && !user.value) {
    throw createError({ statusCode: 404, fatal: true });
  }

  if (!user.value) {
    return navigateTo({ name: 'auth', query: { 'redirected_from': to.fullPath } });
  }

  if (!canAccessAccount.value) {
    throw createError({ statusCode: 404, fatal: true });
  }
});
