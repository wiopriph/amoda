import { hasAdminRole } from '#shared/utils/auth';


// Ошибки Supabase Auth по-человечески, в tu-регистре. Порядок важен: первый совпавший паттерн побеждает
const AUTH_ERROR_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'E-mail ou palavra-passe errados.'],
  [/unsupported phone provider|sms provider/i, 'O acesso por SMS ainda não está ativo. Tenta mais tarde.'],
  [/sms_send_failed|error sending confirmation otp/i, 'Não conseguimos enviar o SMS. Confirma o número e tenta novamente daqui a pouco.'],
  [/token has expired|otp_expired|invalid (otp|token)|token.*invalid/i, 'Código errado ou expirado. Pede um novo código.'],
  [/only request this after|rate limit|too many/i, 'Espera um pouco antes de pedir outro código.'],
  [/captcha/i, 'Confirma que não és um robô e tenta de novo.'],
];

export const humanizeAuthError = (message?: string | null) => {
  const raw = String(message || '');
  const match = AUTH_ERROR_MESSAGES.find(([pattern]) => pattern.test(raw));

  return match ? match[1] : 'Não foi possível entrar. Tenta novamente em instantes.';
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

  const run = async <T>(action: () => Promise<{ data: T; error: { message: string } | null }>) => {
    error.value = null;
    isLoading.value = true;

    try {
      const { data, error: err } = await action();

      if (err) {
        error.value = humanizeAuthError(err.message);

        return null;
      }

      return data;
    } finally {
      isLoading.value = false;
    }
  };

  // Админ: e-mail + пароль или магическая ссылка на /auth (ссылок на страницу с сайта нет)
  const signIn = async ({ email, password }: { email: string; password: string }, captchaToken?: string) => {
    const data = await run(() => supabase.auth.signInWithPassword({ email, password, options: { captchaToken } }));

    return data?.user ?? null;
  };

  // Админ: магическая ссылка на e-mail. Возврат на /auth — этот адрес разрешён в Supabase (Redirect URLs)
  const signInWithEmailLink = async (email: string, captchaToken?: string) => {
    const data = await run(() => supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        // Вход только для существующих аккаунтов: клиентки регистрируются по телефону на /entrar
        shouldCreateUser: false,
        captchaToken,
      },
    }));

    return data !== null;
  };

  // Клиентка: код по SMS. Пользователь создаётся при первом входе, отдельной регистрации нет
  const signInWithPhone = async (phone: string, captchaToken?: string) => {
    const data = await run(() => supabase.auth.signInWithOtp({
      phone,
      options: { channel: 'sms', captchaToken },
    }));

    return data !== null;
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const data = await run(() => supabase.auth.verifyOtp({ phone, token, type: 'sms' }));

    return data?.user ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Куда вести после входа: в кабинет, если он доступен, админа без флага — в админку
  const resolveHomeRoute = (user: any = supaUser.value) => {
    if (isAccountEnabled.value) {
      return { name: 'conta' };
    }

    return hasAdminRole(user) ? { name: 'admin' } : { name: 'index' };
  };


  return {
    user: supaUser,
    isAdmin,
    isAccountEnabled,
    canAccessAccount,
    isLoading,
    error,
    signIn,
    signInWithEmailLink,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
    resolveHomeRoute,
  };
};
