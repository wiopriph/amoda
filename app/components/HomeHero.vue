<script setup lang="ts">
import { TIKTOK_LINK } from '~/constants/contacts';


type HeroProps = {
  title?: string
  subtitle?: string
  socialProof?: string
  bullets?: string[]
  tiktokTitle?: string
  tiktokSubtitle?: string
  ctaPrimary?: string
  whatsappLabel?: string
  isTiktokLive?: boolean
  imageUrl?: string
};

const props = defineProps<HeroProps>();

const heroDefaults = {
  title: 'Seja a mais linda da festa',
  subtitle: 'Escolha o seu look, experimente antes de pagar e fique apenas com o que amar.',
  socialProof: 'Mais de 3.000 meninas já confiaram na Amoda',
  bullets: [
    'Experimente antes de pagar',
    'Pague só o que gostar',
    'Entrega grátis',
    'Atendimento 24/7',
  ],
  tiktokTitle: 'Siga-nos no TikTok',
  tiktokSubtitle: 'Looks, novidades e inspiração',
  ctaPrimary: 'Escolher meu look',
  whatsappLabel: 'Comprar pelo WhatsApp',
  imageUrl: 'https://yrdnlswgptdachbcoyri.supabase.co/storage/v1/object/public/products/products/256/c28c300c-0f1f-43f3-863b-098ca6e13d07.webp',
} as const;


const heroContent = computed(() => ({
  title: props.title || heroDefaults.title,
  subtitle: props.subtitle || heroDefaults.subtitle,
  socialProof: props.socialProof || heroDefaults.socialProof,
  bullets: props.bullets?.length ? props.bullets : heroDefaults.bullets,
  tiktokTitle: props.tiktokTitle || heroDefaults.tiktokTitle,
  tiktokSubtitle: props.tiktokSubtitle || heroDefaults.tiktokSubtitle,
  ctaPrimary: props.ctaPrimary || heroDefaults.ctaPrimary,
  whatsappLabel: props.whatsappLabel || heroDefaults.whatsappLabel,
  imageUrl: props.imageUrl || heroDefaults.imageUrl,
}));

const tiktokSubtitle = computed(() => props.isTiktokLive ? 'Ao vivo agora' : heroContent.value.tiktokSubtitle);
const tiktokTitle = computed(() => `${props.isTiktokLive ? 'LIVE — ' : ''}${heroContent.value.tiktokTitle}`);

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Quero comprar alguma coisa na vossa loja.');
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8"
  >
    <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <UButton
          :to="TIKTOK_LINK"
          target="_blank"
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-simple-icons-tiktok"
          class="mb-4 w-fit border border-pink-100 bg-white/70 font-semibold text-pink-600 shadow-sm backdrop-blur hover:bg-white"
        >
          {{ heroContent.socialProof }}
        </UButton>

        <h1 class="text-4xl font-black tracking-tight text-highlighted text-balance sm:text-5xl lg:text-6xl">
          {{ heroContent.title }}
        </h1>

        <p class="mt-5 max-w-2xl text-base text-muted sm:text-lg">
          {{ heroContent.subtitle }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <UButton
            :to="{ name: 'category-slug', params: { slug: 'mulheres' } }"
            size="xl"
            color="primary"
            icon="i-lucide-shopping-bag"
          >
            {{ heroContent.ctaPrimary }}
          </UButton>

          <UButton
            v-if="false"
            :to="whatsappHref"
            size="xl"
            color="success"
            icon="i-simple-icons-whatsapp"
            target="_blank"
          >
            {{ heroContent.whatsappLabel }}
          </UButton>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div
            v-for="heroBullet in heroContent.bullets"
            :key="heroBullet"
            class="flex items-center gap-2 text-sm font-medium text-toned"
          >
            <UIcon
              name="i-lucide-check-circle-2"
              class="size-5 text-primary"
            />

            <span>{{ heroBullet }}</span>
          </div>
        </div>
      </div>

      <div class="relative">
        <UBadge
          v-if="isTiktokLive"
          color="error"
          variant="solid"
          class="absolute right-3 top-3 z-10 flex items-center gap-1 px-2.5 py-1"
        >
          <span class="size-2 rounded-full bg-white animate-pulse" />
          LIVE
        </UBadge>

        <div class="aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-xl">
          <img
            :src="heroContent.imageUrl"
            alt="Amoda party look"
            class="h-full w-full object-cover"
          >
        </div>

        <a
          :href="TIKTOK_LINK"
          :aria-label="heroContent.tiktokTitle"
          target="_blank"
          rel="noopener noreferrer"
          class="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/90 px-3 py-3 shadow-lg backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary sm:bottom-4 sm:left-4 sm:right-4 sm:px-4"
        >
          <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-highlighted">
                {{ tiktokTitle }}
              </p>

              <p class="line-clamp-2 text-xs text-muted sm:line-clamp-1">
                {{ tiktokSubtitle }}
              </p>
            </div>

            <UBadge
              color="primary"
              variant="solid"
              class="w-fit shrink-0"
            >
              @amoda.ao
            </UBadge>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
