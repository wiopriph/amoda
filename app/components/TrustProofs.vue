<script setup lang="ts">
import { FACEBOOK_LINK } from '~/constants/contacts';


// Скрины анонимизированы: шапка чата срезана, имена и данные клиенток замыты
const proofs = [
  {
    image: '/trust/proof-01.webp',
    caption: 'Pediu 4 vestidos para experimentar em casa e ficou com os que gostou',
  },
  {
    image: '/trust/proof-02.webp',
    caption: '«Já recebi o vestido. Muito obrigada.» — mais uma entrega em Luanda',
  },
  {
    image: '/trust/proof-03.webp',
    caption: 'Envio para Benguela — o comprovativo segue sempre no WhatsApp',
  },
  {
    image: '/trust/proof-04.webp',
    caption: 'Entrega no Benfica — combinámos o preço e a hora pelo WhatsApp',
  },
  {
    image: '/trust/proof-05.webp',
    caption: 'Cliente de Benguela — só pagou quando o vestido chegou',
  },
  {
    image: '/trust/proof-06.webp',
    caption: 'Levamos até à porta — mesmo quando é no 7.º andar',
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
      Quem já comprou connosco
    </h2>

    <p class="mt-2 text-sm text-muted sm:text-base">
      Prints do nosso WhatsApp, partilhados com autorização das clientes. É assim que funciona no dia a dia.
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
          Vê as novidades e o que as clientes dizem
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
