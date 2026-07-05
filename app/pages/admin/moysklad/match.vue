<script setup lang="ts">
definePageMeta({
  name: 'admin-moysklad-match',
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'MoySklad — Vinculação de tamanhos',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

type MsVariant = {
  msCode: string
  productName: string
  color: string
  size: string
  price: number
  msProductUrl: string | null
};

type Suggestion = {
  localId: number
  localSize: string
  localColor: string
  localProduct: string
  localProductSlug: string
  imageUrl: string | null
  variantId: number
  productId: number
  currentMsCode: string | null
  suggestion: (MsVariant & { score: number }) | null
  alternatives: (MsVariant & { score: number })[]
};

type AlreadyLinked = {
  localId: number
  localSize: string
  localColor: string
  localProduct: string
  localProductSlug: string
  imageUrl: string | null
  variantId: number
  productId: number
  currentMsCode: string | null
};

type CandidatesResponse = {
  msVariants: MsVariant[]
  alreadyLinked: AlreadyLinked[]
  suggestions: Suggestion[]
  stats: {
    totalMs: number
    totalLocal: number
    linked: number
    unlinked: number
    autoMatched: number
  }
};

const toast = useToast();

const { data, pending, refresh } = useFetch<CandidatesResponse>('/api/admin/moysklad/candidates', { server: false });

// localId → msCode (working state)
const selections = ref<Record<number, string>>({});

watch(data, (val) => {
  if (!val) return;

  const map: Record<number, string> = {};

  for (const s of val.suggestions) {
    // Pre-fill with high-confidence suggestion (score >= 80)
    if (s.suggestion && s.suggestion.score >= 80) {
      map[s.localId] = s.suggestion.msCode;
    } else {
      map[s.localId] = '';
    }
  }

  selections.value = map;
}, { immediate: true });

const msVariantOptions = computed(() =>
  (data.value?.msVariants ?? []).map(v => ({
    label: `${v.productName} / ${v.color} / ${v.size} [${v.msCode}]`,
    value: v.msCode,
  })),
);

const msVariantUrlMap = computed(() => {
  const map: Record<string, string> = {};

  for (const v of data.value?.msVariants ?? []) {
    if (v.msProductUrl) map[v.msCode] = v.msProductUrl;
  }

  return map;
});

const filterText = ref('');

const filteredSuggestions = computed(() => {
  const q = filterText.value.toLowerCase().trim();
  const list = data.value?.suggestions ?? [];

  if (!q) return list;

  return list.filter(s =>
    s.localProduct.toLowerCase().includes(q) ||
    s.localColor.toLowerCase().includes(q) ||
    s.localSize.toLowerCase().includes(q),
  );
});

const pendingCount = computed(() =>
  Object.values(selections.value).filter(v => v).length,
);

const isSaving = ref(false);
const isSyncing = ref(false);
const isSyncingStock = ref(false);

const syncStock = async () => {
  isSyncingStock.value = true;

  try {
    const result = await $fetch<{
      updated: number
      totalLinkedLocalSizes: number
      localCodesNotInMoysklad: string[]
    }>('/api/admin/moysklad/sync-stock', { method: 'POST' });

    const staleNote = result.localCodesNotInMoysklad.length
      ? ` Códigos sem correspondência no MoySklad: ${result.localCodesNotInMoysklad.join(', ')}.`
      : '';

    toast.add({
      title: 'Estoque sincronizado',
      description: `${result.updated} de ${result.totalLinkedLocalSizes} tamanhos atualizados.${staleNote}`,
      color: result.localCodesNotInMoysklad.length ? 'warning' : 'success',
    });

    await refresh();
  } catch (e: any) {
    toast.add({
      title: 'Erro na sincronização de estoque',
      description: e?.data?.statusMessage || 'Falha ao sincronizar estoque.',
      color: 'error',
    });
  } finally {
    isSyncingStock.value = false;
  }
};

const syncVariants = async () => {
  isSyncing.value = true;

  try {
    const result = await $fetch<{ updated: number; productsProcessed: number }>('/api/admin/moysklad/sync-variants', { method: 'POST' });

    toast.add({
      title: 'Sincronização concluída',
      description: `${result.productsProcessed} produtos processados, ${result.updated} tamanhos atualizados.`,
      color: 'success',
    });

    await refresh();
  } catch (e: any) {
    toast.add({
      title: 'Erro na sincronização',
      description: e?.data?.statusMessage || 'Falha ao sincronizar.',
      color: 'error',
    });
  } finally {
    isSyncing.value = false;
  }
};

const saveAll = async () => {
  const links = Object.entries(selections.value)
    .filter(([, msCode]) => msCode)
    .map(([localId, msCode]) => ({ localId: Number(localId), msCode }));

  if (!links.length) {
    toast.add({ title: 'Nada para salvar', color: 'warning' });

    return;
  }

  isSaving.value = true;

  try {
    const result = await $fetch<{ updated: number }>('/api/admin/moysklad/link', {
      method: 'POST',
      body: { links },
    });

    toast.add({
      title: 'Sucesso',
      description: `${result.updated} tamanhos vinculados.`,
      color: 'success',
    });

    await refresh();
  } catch (e: any) {
    toast.add({
      title: 'Erro',
      description: e?.data?.statusMessage || 'Falha ao salvar vínculos.',
      color: 'error',
    });
  } finally {
    isSaving.value = false;
  }
};

const scoreColor = (score: number) => {
  if (score >= 90) return 'success';

  if (score >= 70) return 'warning';

  return 'error';
};

const showLinked = ref(false);
</script>

<template>
  <UPage>
    <UPageHeader
      title="MoySklad — Vinculação"
      description="Associe os tamanhos locais às modificações do MoySklad"
    >
      <template #links>
        <UButton
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="pending"
          @click="refresh()"
        >
          Atualizar
        </UButton>

        <UButton
          variant="soft"
          color="neutral"
          icon="i-lucide-zap"
          :loading="isSyncing"
          :disabled="isSyncing || isSyncingStock"
          @click="syncVariants"
        >
          Sincronizar tamanhos
        </UButton>

        <UButton
          variant="soft"
          color="neutral"
          icon="i-lucide-package"
          :loading="isSyncingStock"
          :disabled="isSyncing || isSyncingStock"
          @click="syncStock"
        >
          Sincronizar estoque
        </UButton>

        <UButton
          color="primary"
          icon="i-lucide-save"
          :loading="isSaving"
          :disabled="isSaving || !pendingCount"
          @click="saveAll"
        >
          Salvar {{ pendingCount ? `(${pendingCount})` : '' }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- Stats -->
      <div
        v-if="data?.stats"
        class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5"
      >
        <UCard
          v-for="(value, key) in data.stats"
          :key="key"
          class="text-center"
        >
          <p class="text-2xl font-black text-highlighted">
            {{ value }}
          </p>

          <p class="mt-1 text-xs text-muted">
            {{
              key === 'totalMs' ? 'No MoySklad' :
              key === 'totalLocal' ? 'No site' :
              key === 'linked' ? 'Já vinculados' :
              key === 'unlinked' ? 'Sem vínculo' :
              'Auto-sugeridos'
            }}
          </p>
        </UCard>
      </div>

      <USkeleton
        v-if="pending"
        class="h-64 w-full"
      />

      <template v-else-if="data">
        <!-- Unlinked -->
        <UCard>
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-lg font-semibold">
              Sem vínculo ({{ data.suggestions.length }})
            </h2>

            <UInput
              v-model="filterText"
              placeholder="Filtrar por nome, cor ou tamanho..."
              icon="i-lucide-search"
              class="w-full sm:w-72"
            />
          </div>

          <div
            v-if="!filteredSuggestions.length"
            class="py-8 text-center text-sm text-muted"
          >
            {{ filterText ? 'Nenhum resultado para o filtro.' : 'Todos os tamanhos já estão vinculados.' }}
          </div>

          <div
            v-else
            class="divide-y divide-gray-100"
          >
            <div
              v-for="s in filteredSuggestions"
              :key="s.localId"
              class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
            >
              <!-- Thumbnail -->
              <NuxtImg
                v-if="s.imageUrl"
                :src="s.imageUrl"
                class="h-12 w-10 shrink-0 rounded-md border border-gray-200 object-cover"
              />
              <div
                v-else
                class="flex h-12 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50"
              >
                <UIcon
                  name="i-lucide-image"
                  class="size-4 text-gray-300"
                />
              </div>

              <!-- Local side -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <p class="truncate text-sm font-medium text-highlighted">
                    {{ s.localProduct }}
                  </p>

                  <UButton
                    :to="{ name: 'admin-products-edit', params: { id: s.productId } }"
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-external-link"
                    target="_blank"
                    class="shrink-0"
                  />

                  <UButton
                    :to="{ name: 'product-slug', params: { slug: s.localProductSlug } }"
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-eye"
                    target="_blank"
                    class="shrink-0"
                  />
                </div>

                <p class="text-xs text-muted">
                  {{ s.localColor }} / {{ s.localSize }}
                  <span class="ml-1 text-gray-400">#{{ s.localId }}</span>
                </p>
              </div>

              <!-- Arrow -->
              <UIcon
                name="i-lucide-arrow-right"
                class="hidden shrink-0 text-gray-400 sm:block"
              />

              <!-- Suggestion badge -->
              <div
                v-if="s.suggestion"
                class="shrink-0"
              >
                <UBadge
                  :color="scoreColor(s.suggestion.score)"
                  variant="soft"
                  class="text-xs"
                >
                  {{ s.suggestion.score }}%
                </UBadge>
              </div>

              <!-- MS code selector -->
              <div class="w-full sm:w-80">
                <div class="flex items-center gap-1">
                  <USelectMenu
                    v-model="selections[s.localId]"
                    :items="msVariantOptions"
                    value-key="value"
                    placeholder="Selecionar modificação MS..."
                    :search-input="{ placeholder: 'Pesquisar...' }"
                    class="min-w-0 flex-1"
                  />

                  <UButton
                    v-if="selections[s.localId] && msVariantUrlMap[selections[s.localId]]"
                    :to="msVariantUrlMap[selections[s.localId]]"
                    target="_blank"
                    size="sm"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-external-link"
                    aria-label="Abrir no MoySklad"
                    class="shrink-0"
                  />
                </div>

                <p
                  v-if="s.suggestion && !selections[s.localId]"
                  class="mt-1 cursor-pointer text-xs text-primary hover:underline"
                  @click="selections[s.localId] = s.suggestion!.msCode"
                >
                  Sugestão: {{ s.suggestion.productName }} / {{ s.suggestion.color }} / {{ s.suggestion.size }}
                  [{{ s.suggestion.msCode }}]
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Already linked -->
        <UCard class="mt-6">
          <div
            class="flex cursor-pointer items-center justify-between"
            @click="showLinked = !showLinked"
          >
            <h2 class="text-lg font-semibold">
              Já vinculados ({{ data.alreadyLinked.length }})
            </h2>

            <UIcon
              :name="showLinked ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              class="text-gray-400"
            />
          </div>

          <div
            v-if="showLinked"
            class="mt-4 divide-y divide-gray-100"
          >
            <div
              v-for="l in data.alreadyLinked"
              :key="l.localId"
              class="flex items-center gap-3 py-2 text-sm"
            >
              <NuxtImg
                v-if="l.imageUrl"
                :src="l.imageUrl"
                class="h-10 w-8 shrink-0 rounded border border-gray-200 object-cover"
              />
              <div
                v-else
                class="h-10 w-8 shrink-0 rounded border border-dashed border-gray-200 bg-gray-50"
              />

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1">
                  <span class="truncate font-medium text-highlighted">{{ l.localProduct }}</span>

                  <UButton
                    :to="{ name: 'admin-products-edit', params: { id: l.productId } }"
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-external-link"
                    target="_blank"
                    class="shrink-0"
                  />
                </div>

                <span class="text-xs text-muted">{{ l.localColor }} / {{ l.localSize }}</span>
              </div>

              <UBadge
                variant="soft"
                color="neutral"
                class="shrink-0 font-mono text-xs"
              >
                {{ l.currentMsCode }}
              </UBadge>

              <UButton
                v-if="l.currentMsCode && msVariantUrlMap[l.currentMsCode]"
                :to="msVariantUrlMap[l.currentMsCode]"
                target="_blank"
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-external-link"
                aria-label="Abrir no MoySklad"
                class="shrink-0"
              />

              <UButton
                size="xs"
                variant="ghost"
                color="error"
                icon="i-lucide-unlink"
                aria-label="Desvincular"
                @click="selections[l.localId] = ''"
              />
            </div>
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>
