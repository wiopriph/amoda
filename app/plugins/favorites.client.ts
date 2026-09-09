import { FAVORITES_STORAGE_KEY } from '~/composables/useFavorites';


// Инициализация избранного один раз на приложение: после гидрации (чтобы SSR-разметка совпала)
// и при каждом входе/выходе. Живёт в плагине, а не в композабле, чтобы не зависеть от жизни первого компонента.
export default defineNuxtPlugin(() => {
  const { user } = useAuth();
  const { isServerMode, reload } = useFavorites();

  onNuxtReady(() => {
    reload();

    window.addEventListener('storage', (storageEvent) => {
      if (storageEvent.key === FAVORITES_STORAGE_KEY && !isServerMode.value) {
        reload();
      }
    });

    watch(() => user.value?.id ?? null, () => {
      reload();
    });
  });
});
