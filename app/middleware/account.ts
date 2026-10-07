export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth();

  if (!user.value) {
    return navigateTo({ name: 'entrar', query: { 'redirected_from': to.fullPath } });
  }
});
