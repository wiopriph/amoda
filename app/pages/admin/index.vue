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

type SyncResult = {
  ok: boolean
  stock: {
    linkedSizes: number
    updated: number
    staleLinks: number[]
  }
  prices: {
    linkedVariants: number
    updated: number
    conflicts: { variantId: number; prices: number[] }[]
    skippedNoMsPrice: number
  }
};

type BackfillResult = {
  ok: boolean
  linkedProducts: number
  sizesWithCodeOnly: number
  filled: number
  unmatched: { productId: number; title: string; codes: string[] }[]
};

const getErrorText = (error: any, fallback: string) =>
  error?.data?.statusMessage || error?.statusMessage || error?.message || fallback;

const isSyncing = ref(false);
const syncResult = ref<SyncResult | null>(null);
const syncError = ref<string | null>(null);

const syncResultItems = computed(() => syncResult.value ?
  [
    { label: 'Tamanhos vinculados', value: syncResult.value.stock.linkedSizes },
    { label: 'Estoques atualizados', value: syncResult.value.stock.updated },
    { label: 'Vínculos sem dados no MS', value: syncResult.value.stock.staleLinks.length },
    { label: 'Variantes vinculadas', value: syncResult.value.prices.linkedVariants },
    { label: 'Preços atualizados', value: syncResult.value.prices.updated },
    { label: 'Conflitos de preço', value: syncResult.value.prices.conflicts.length },
  ] :
  []);

const runSync = async () => {
  isSyncing.value = true;
  syncResult.value = null;
  syncError.value = null;

  try {
    syncResult.value = await $fetch<SyncResult>('/api/admin/moysklad/sync', { method: 'POST' });
  } catch (error: any) {
    syncError.value = getErrorText(error, 'Falha ao sincronizar com MoySklad.');
  } finally {
    isSyncing.value = false;
  }
};

type CoverageResult = {
  ok: boolean
  checkedProducts: number
  productsWithIssues: number
  report: {
    productId: number
    title: string
    msVariantsTotal: number
    missingOnSite: { id: string; name: string; code: string | null; characteristics: string }[]
    unlinkedLocalSizes: { sizeId: number; color: string | null; size: string }[]
    brokenLinks: { sizeId: number; color: string | null; size: string; msVariantId: string }[]
    error?: string
  }[]
};

const isCheckingCoverage = ref(false);
const coverageResult = ref<CoverageResult | null>(null);
const coverageError = ref<string | null>(null);

const runCoverage = async () => {
  isCheckingCoverage.value = true;
  coverageResult.value = null;
  coverageError.value = null;

  try {
    coverageResult.value = await $fetch<CoverageResult>('/api/admin/moysklad/coverage');
  } catch (error: any) {
    coverageError.value = getErrorText(error, 'Falha ao verificar cobertura.');
  } finally {
    isCheckingCoverage.value = false;
  }
};

const isBackfilling = ref(false);
const backfillResult = ref<BackfillResult | null>(null);
const backfillError = ref<string | null>(null);

const runBackfill = async () => {
  isBackfilling.value = true;
  backfillResult.value = null;
  backfillError.value = null;

  try {
    backfillResult.value = await $fetch<BackfillResult>('/api/admin/moysklad/backfill', { method: 'POST' });
  } catch (error: any) {
    backfillError.value = getErrorText(error, 'Falha ao preencher vínculos.');
  } finally {
    isBackfilling.value = false;
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
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Sincronização MoySklad
            </h2>

            <p class="mt-1 text-sm text-gray-600">
              Atualiza estoques e preços a partir do MoySklad para tamanhos vinculados por UUID.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              icon="i-lucide-refresh-cw"
              :loading="isSyncing"
              :disabled="isSyncing || isBackfilling"
              @click="runSync"
            >
              Sincronizar estoque e preços
            </UButton>

            <UButton
              icon="i-lucide-wand-2"
              variant="outline"
              color="neutral"
              :loading="isBackfilling"
              :disabled="isSyncing || isBackfilling"
              @click="runBackfill"
            >
              Preencher vínculos (ms_code → UUID)
            </UButton>

            <UButton
              icon="i-lucide-scan-search"
              variant="outline"
              color="neutral"
              :loading="isCheckingCoverage"
              :disabled="isCheckingCoverage"
              @click="runCoverage"
            >
              Verificar cobertura
            </UButton>
          </div>

          <UAlert
            v-if="syncError"
            title="Erro na sincronização"
            :description="syncError"
            color="error"
            variant="soft"
          />

          <div
            v-if="syncResult"
            class="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <h3 class="text-sm font-semibold text-gray-900">
              Resultado da sincronização
            </h3>

            <dl class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="item in syncResultItems"
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

            <p
              v-if="syncResult.prices.conflicts.length"
              class="mt-3 text-xs text-gray-600"
            >
              Conflitos (variante: preços): {{ syncResult.prices.conflicts.map(c => `#${c.variantId}: ${c.prices.join('/')}`).join(', ') }}
            </p>
          </div>

          <UAlert
            v-if="backfillError"
            title="Erro no preenchimento"
            :description="backfillError"
            color="error"
            variant="soft"
          />

          <UAlert
            v-if="coverageError"
            title="Erro na verificação"
            :description="coverageError"
            color="error"
            variant="soft"
          />

          <div
            v-if="coverageResult"
            class="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <h3 class="text-sm font-semibold text-gray-900">
              Cobertura: {{ coverageResult.productsWithIssues }} de {{ coverageResult.checkedProducts }} produtos com pendências
            </h3>

            <p
              v-if="!coverageResult.report.length"
              class="mt-2 text-sm text-gray-600"
            >
              Tudo vinculado — nenhum problema encontrado.
            </p>

            <div
              v-for="item in coverageResult.report"
              :key="item.productId"
              class="mt-3 rounded-md bg-white p-3 shadow-sm"
            >
              <ULink
                :to="{ name: 'admin-products-edit', params: { id: item.productId } }"
                class="text-sm font-medium text-primary"
              >
                #{{ item.productId }} · {{ item.title }}
              </ULink>

              <p
                v-if="item.error"
                class="mt-1 text-xs text-error"
              >
                Erro MoySklad: {{ item.error }}
              </p>

              <p
                v-if="item.missingOnSite.length"
                class="mt-1 text-xs text-gray-700"
              >
                <strong>No MoySklad, sem par no site ({{ item.missingOnSite.length }} de {{ item.msVariantsTotal }}):</strong>
                {{ item.missingOnSite.map(v => `${v.characteristics || v.name}${v.code ? ` [${v.code}]` : ''}`).join(', ') }}
              </p>

              <p
                v-if="item.unlinkedLocalSizes.length"
                class="mt-1 text-xs text-gray-700"
              >
                <strong>No site, sem vínculo MoySklad:</strong>
                {{ item.unlinkedLocalSizes.map(s => `${s.color || '—'} / ${s.size}`).join(', ') }}
              </p>

              <p
                v-if="item.brokenLinks.length"
                class="mt-1 text-xs text-error"
              >
                <strong>Vínculo quebrado (modificação não existe mais):</strong>
                {{ item.brokenLinks.map(s => `${s.color || '—'} / ${s.size}`).join(', ') }}
              </p>
            </div>
          </div>

          <UAlert
            v-if="backfillResult"
            color="success"
            variant="soft"
            title="Preenchimento concluído"
            :description="`Preenchidos: ${backfillResult.filled} de ${backfillResult.sizesWithCodeOnly}. Sem correspondência: ${backfillResult.unmatched.map(u => `${u.title} (${u.codes.join(', ')})`).join('; ') || 'nenhum'}`"
          />
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>
