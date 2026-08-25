<script setup lang="ts">
import { TIKTOK_LINK } from '~/constants/contacts';


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
        v-for="proof in proofs"
        :key="proof.image"
        class="w-56 shrink-0 snap-start"
      >
        <div class="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
          <img
            :src="proof.image"
            :alt="proof.caption"
            width="560"
            height="836"
            loading="lazy"
            class="h-auto w-full"
          >
        </div>

        <figcaption class="mt-2 px-1 text-xs leading-5 text-muted">
          {{ proof.caption }}
        </figcaption>
      </figure>

      <a
        :href="TIKTOK_LINK"
        target="_blank"
        rel="noopener noreferrer"
        class="flex w-56 shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-950 p-6 text-center transition hover:bg-gray-800"
        :style="{ aspectRatio: '560 / 836' }"
      >
        <UIcon
          name="i-simple-icons-tiktok"
          class="size-10 text-white"
        />

        <span class="text-base font-bold text-white">
          1 700+ seguidoras
        </span>

        <span class="text-sm text-gray-300">
          Vê looks e entregas no TikTok
        </span>
      </a>
    </div>
  </section>
</template>
