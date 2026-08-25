<script setup lang="ts">
import { FACEBOOK_LINK } from '~/constants/contacts';


// Скрины анонимизированы: шапка чата срезана, имена и данные клиенток замыты
const proofs = [
  {
    image: '/trust/proof-01.webp',
    caption: 'Levamos várias peças — escolhe só o que gostar',
  },
  {
    image: '/trust/proof-02.webp',
    caption: '«Já recebi o vestido. Muito obrigada.»',
  },
  {
    image: '/trust/proof-03.webp',
    caption: 'Enviamos para as províncias com comprovativo',
  },
  {
    image: '/trust/proof-04.webp',
    caption: 'Entrega no teu bairro — pagas só ao receber',
  },
  {
    image: '/trust/proof-05.webp',
    caption: 'De Luanda a Benguela: pagas quando receberes',
  },
  {
    image: '/trust/proof-06.webp',
    caption: 'Entregamos até à tua porta',
  },
] as const;

// Фуллскрин-просмотр: при 224px текст переписки не читается
const isViewerOpen = ref(false);
const viewerIndex = ref(0);

const viewerImages = proofs.map(proof => ({ url: proof.image, alt: proof.caption }));

const openViewer = (index: number) => {
  viewerIndex.value = index;
  isViewerOpen.value = true;
};
</script>

<template>
  <section class="mt-6 sm:mt-10">
    <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
      Conversas reais, entregas reais
    </h2>

    <p class="mt-2 text-sm text-muted sm:text-base">
      Sem filtros: perguntas, entregas e agradecimentos de clientes no nosso WhatsApp.
    </p>

    <div class="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <figure
        v-for="(proof, proofIndex) in proofs"
        :key="proof.image"
        class="w-56 shrink-0 snap-start"
      >
        <button
          type="button"
          :aria-label="`Ampliar conversa: ${proof.caption}`"
          class="block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition hover:shadow-md"
          @click="openViewer(proofIndex)"
        >
          <img
            :src="proof.image"
            :alt="proof.caption"
            width="560"
            height="836"
            loading="lazy"
            class="h-auto w-full"
          >
        </button>

        <figcaption class="mt-2 px-1 text-xs leading-5 text-muted">
          {{ proof.caption }}
        </figcaption>
      </figure>

      <a
        :href="FACEBOOK_LINK"
        target="_blank"
        rel="noopener noreferrer"
        class="flex w-56 shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl bg-[#1877F2] p-6 text-center transition hover:bg-[#1568d4]"
        :style="{ aspectRatio: '560 / 836' }"
      >
        <UIcon
          name="i-simple-icons-facebook"
          class="size-10 text-white"
        />

        <span class="text-base font-bold text-white">
          Segue-nos no Facebook
        </span>

        <span class="text-sm text-blue-100">
          Vê entregas, novidades e comentários de clientes
        </span>
      </a>
    </div>

    <ProductGalleryLightbox
      v-model:open="isViewerOpen"
      :images="viewerImages"
      :startIndex="viewerIndex"
    />
  </section>
</template>
