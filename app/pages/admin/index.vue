<script setup lang="ts">
definePageMeta({ name: 'admin', layout: 'admin', middleware: 'admin' });

const title = 'Painel de Administração';
const description = 'Gerencie marcas, categorias e produtos';

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

type SyncStockResult = {
  success: boolean
  totalFromMoysklad: number
  totalLinkedLocalSizes: number
  updated: number
  skippedWithoutCode: number
  skippedNotFound: number
};

const isSyncingStock = ref(false);
const syncStockResult = ref<SyncStockResult | null>(null);
const syncStockError = ref<string | null>(null);

const syncStockResultItems = computed(() => syncStockResult.value ?
  [
    { label: 'Total no Moysklad', value: syncStockResult.value.totalFromMoysklad },
    { label: 'Tamanhos com código', value: syncStockResult.value.totalLinkedLocalSizes },
    { label: 'Atualizados', value: syncStockResult.value.updated },
    { label: 'Ignorados sem código', value: syncStockResult.value.skippedWithoutCode },
    { label: 'Não encontrados', value: syncStockResult.value.skippedNotFound },
  ] :
  []);

const getSyncStockErrorText = (error: any) => (
  error?.data?.statusMessage ||
  error?.statusMessage ||
  error?.message ||
  'Falha ao sincronizar stock.'
);

const syncStock = async () => {
  isSyncingStock.value = true;
  syncStockResult.value = null;
  syncStockError.value = null;

  try {
    syncStockResult.value = await $fetch<SyncStockResult>('/api/admin/moysklad/sync-stock', {
      method: 'POST',
    });
  } catch (error: any) {
    syncStockError.value = getSyncStockErrorText(error);
  } finally {
    isSyncingStock.value = false;
  }
};
</script>

<template>
  <UPage>
    <UPageHeader
      :ui="{ title: 'text-xl font-semibold md:text-2xl' }"
      :title="title"
      :description="description"
    />

    <UPageBody>
      <UCard>
        <div class="space-y-6">
          <p class="text-gray-700">
            Gerencie marcas, categorias e produtos
          </p>

          <div class="space-y-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                Sincronização de stock
              </h2>

              <p class="mt-1 text-sm text-gray-600">
                Atualiza o stock dos tamanhos dos produtos a partir do Moysklad.
              </p>
            </div>

            <UButton
              icon="i-lucide-refresh-cw"
              :loading="isSyncingStock"
              :disabled="isSyncingStock"
              @click="syncStock"
            >
              Sincronizar stock
            </UButton>

            <UAlert
              v-if="syncStockError"
              title="Erro na sincronização"
              :description="syncStockError"
              color="error"
              variant="soft"
            />

            <div
              v-if="syncStockResult"
              class="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <h3 class="text-sm font-semibold text-gray-900">
                Resultado da sincronização
              </h3>

              <dl class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  v-for="item in syncStockResultItems"
                  :key="item.label"
                  class="rounded-md bg-white p-3 shadow-sm"
                >
                  <dt class="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {{ item.label }}
                  </dt>

                  <dd class="mt-1 text-2xl font-semibold text-gray-900">
                    {{ item.value }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>
