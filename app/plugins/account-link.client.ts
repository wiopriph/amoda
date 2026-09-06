// После входа привязываем корзину и заказы этого устройства к аккаунту — один раз на пользователя за вкладку
export default defineNuxtPlugin(() => {
  const { user, canAccessAccount } = useAuth();
  const linkedUsers = new Set<string>();

  const storageKey = (userId: string) => `amoda:account-linked:${userId}`;

  const link = async () => {
    const userId = user.value?.id;

    if (!userId || !canAccessAccount.value || linkedUsers.has(userId)) {
      return;
    }

    try {
      if (window.sessionStorage.getItem(storageKey(userId))) {
        return;
      }
    } catch {
      // sessionStorage недоступен — просто привяжем ещё раз
    }

    linkedUsers.add(userId);

    const sid = useCookie<string | null>('sid').value;

    if (!sid) {
      return;
    }

    try {
      await $fetch('/api/account/link-session', {
        method: 'POST',
        body: { 'session_id': sid },
      });

      window.sessionStorage.setItem(storageKey(userId), '1');
    } catch {
      // Не критично: заказы, сделанные после входа, привязываются сразу на сервере
    }
  };

  watch(user, link, { immediate: true });
});
