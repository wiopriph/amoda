export default defineNuxtRouteMiddleware((to) => {
  const { user, isAdmin } = useAuth();

  if (!user.value) {
    return navigateTo({ name: 'admin-login', query: { 'redirected_from': to.fullPath } });
  }

  if (!isAdmin.value) {
    return navigateTo('/');
  }
});
