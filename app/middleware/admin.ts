export default defineNuxtRouteMiddleware(() => {
  const { user, isAdmin } = useAuth();

  if (!user.value) {
    return navigateTo({
      path: '/auth',
      query: { redirected_from: useRoute().fullPath },
    });
  }

  if (!isAdmin.value) {
    return navigateTo('/');
  }
});
