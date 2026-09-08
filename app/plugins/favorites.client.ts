// Инициализация избранного один раз на приложение: после гидрации (чтобы SSR-разметка совпала)
// и при каждом входе/выходе. Раньше это жило в композабле и зависело от жизни первого компонента.
export default defineNuxtPlugin(() => {
  const { user } = useAuth();
  const { isServerMode, loadFromStorage, syncFromServer } = useFavorites();

  const STORAGE_KEY = 'amoda:favorites';

  onNuxtReady(() => {
    if (isServerMode.value) {
      syncFromServer();
    } else {
      loadFromStorage();
    }

    window.addEventListener('storage', (storageEvent) => {
      if (storageEvent.key === STORAGE_KEY && !isServerMode.value) {
        loadFromStorage();
      }
    });

    watch(() => user.value?.id ?? null, (userId, previousUserId) => {
      if (userId === previousUserId) {
        return;
      }

      if (isServerMode.value) {
        syncFromServer();
      } else {
        loadFromStorage();
      }
    });
  });
});
