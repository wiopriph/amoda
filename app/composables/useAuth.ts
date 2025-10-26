export const useAuth = () => {
  const supabase = useSupabaseClient();
  const supaUser = useSupabaseUser();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAdmin = computed(() => {
    const roles = (supaUser.value?.app_metadata as any)?.roles || [];

    return Array.isArray(roles) && roles.includes('admin');
  });


  const signIn = async ({ email, password }: { email: string; password: string }) => {
    error.value = null;
    isLoading.value = true;

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    isLoading.value = false;

    if (err) {
      error.value = err.message;
    }

    return !err;
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


  return {
    user: supaUser,
    isAdmin,
    isLoading,
    error,
    signIn,
    signUp,
    signInOtp,
    signOut,
  };
};
