export default defineNuxtRouteMiddleware(() => {
  const { user, isAdmin } = useAuth();

  if (!user.value) {
    return navigateTo({
      path: '/auth',
      // eslint-disable-next-line camelcase
      query: { redirected_from: useRoute().fullPath },
    });
  }

  if (!isAdmin.value) {
    return navigateTo('/');
  }
});
