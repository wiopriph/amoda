type Office = {
  id: number | string
  name: string
  address?: string
  phone?: string
  description?: string
  opening_hours?: Record<string, string[][]>
};

export const useOffices = () => {
  const offices = useState<Office[]>('offices.items', () => []);
  const loadedAt = useState<number>('offices.loadedAt', () => 0);
  const pending = useState<boolean>('offices.pending', () => false);
  const error = useState<any>('offices.error', () => null);

  const load = async (opts?: { force?: boolean; maxAgeMs?: number }) => {
    const force = opts?.force ?? false;
    const maxAgeMs = opts?.maxAgeMs ?? 10 * 60 * 1000; // 10 min

    const now = Date.now();
    const isFresh = offices.value.length && (now - loadedAt.value) < maxAgeMs;

    if (!force && isFresh) return;

    if (pending.value) return;

    pending.value = true;
    error.value = null;

    try {
      const res = await $fetch<{ items: Office[] }>('/api/offices/list');

      offices.value = res?.items ?? [];
      loadedAt.value = Date.now();
    } catch (error_) {
      error.value = error_;
    } finally {
      pending.value = false;
    }
  };

  return {
    offices,
    pending,
    error,
    load,
  };
};
