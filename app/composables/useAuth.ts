const hasAdminRole = (user: any) => {
  const roles = user?.app_metadata?.roles || [];

  return Array.isArray(roles) && roles.includes('admin');
};

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const supaUser = useSupabaseUser();
  const { accountEnabled } = useRuntimeConfig().public;

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAdmin = computed(() => hasAdminRole(supaUser.value));

  // Кабинет открыт всем по флагу, а до релиза — только админу для проверки в проде
  const isAccountEnabled = computed(() => Boolean(accountEnabled));
  const canAccessAccount = computed(() => isAccountEnabled.value || isAdmin.value);


  const signIn = async ({ email, password }: { email: string; password: string }) => {
    error.value = null;
    isLoading.value = true;

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });

    isLoading.value = false;

    if (err) {
      error.value = err.message;

      return null;
    }

    return data.user;
  };

  const signUp = async ({ email, password }: { email: string; password: string }) => {
    error.value = null;
    isLoading.value = true;

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });

    isLoading.value = false;

    if (err) {
      error.value = err.message;

      return null;
    }

    return data.user;
  };

  const signInOtp = async (email: string) => {
    error.value = null;
    isLoading.value = true;

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });

    isLoading.value = false;

    if (err) {
      error.value = err.message;
    }

    return !err;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Куда вести после входа: в кабинет, если он доступен, админа без флага — в админку
  const resolveHomeRoute = (user: any = supaUser.value) => {
    if (isAccountEnabled.value || hasAdminRole(user)) {
      return isAccountEnabled.value || !hasAdminRole(user) ? { name: 'conta' } : { name: 'admin' };
    }

    return { name: 'index' };
  };


  return {
    user: supaUser,
    isAdmin,
    isAccountEnabled,
    canAccessAccount,
    isLoading,
    error,
    signIn,
    signUp,
    signInOtp,
    signOut,
    resolveHomeRoute,
  };
};
