<script setup lang="ts">
import { CONTACT_PHONE, TIKTOK_LINK } from '~/constants/contacts';


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

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();

const WOMEN_SLUG = 'mulheres';

const startShoppingTo = computed(() =>
  localeRoute({ name: 'category-slug', params: { slug: WOMEN_SLUG } }),
);

const whatsappHref = computed(() => {
  const text = encodeURIComponent('Olá! Preciso de ajuda com um pedido na Amoda.');

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});

const fallbackBullets = computed(() =>
  tm('hero.bullets').map((item: any) => rt(item)),
);

const heroTitle = computed(() => props.title || t('hero.title'));
const heroSubtitle = computed(() => props.subtitle || t('hero.subtitle'));
const heroSocialProof = computed(() => props.socialProof || t('hero.socialProof'));
const heroBullets = computed(() => props.bullets?.length ? props.bullets : fallbackBullets.value);
const heroTiktokTitle = computed(() => props.tiktokTitle || t('hero.tiktokTitle'));
const heroTiktokSubtitle = computed(() => props.tiktokSubtitle || t('hero.tiktokSubtitle'));
const heroCtaPrimary = computed(() => props.ctaPrimary || t('hero.ctaPrimary'));
const heroWhatsappLabel = computed(() => props.whatsappLabel || t('hero.whatsapp'));
</script>

<i18n lang="json">
{
  "pt": {
    "hero": {
      "title": "Seja a mais linda da festa",
      "subtitle": "Escolha o seu look, experimente antes de pagar e fique apenas com o que amar.",
      "ctaPrimary": "Escolher meu look",
      "whatsapp": "Falar no WhatsApp",
      "socialProof": "Mais de 3.000 meninas já confiaram na Amoda",
      "bullets": [
        "Experimente antes de pagar",
        "Pague só o que gostar",
        "Entrega grátis",
        "Atendimento 24/7"
      ],
      "tiktokTitle": "Siga-nos no TikTok",
      "tiktokSubtitle": "Looks, novidades e inspiração"
    }
  },
  "en": {
    "hero": {
      "title": "Be the most beautiful girl at the party",
      "subtitle": "Choose your look, try before you pay, and keep only what you love.",
      "ctaPrimary": "Choose my look",
      "whatsapp": "Chat on WhatsApp",
      "socialProof": "Trusted by 3,000+ girls",
      "bullets": [
        "Try before you pay",
        "Pay only for what you like",
        "Free delivery",
        "24/7 support"
      ],
      "tiktokTitle": "Follow us on TikTok",
      "tiktokSubtitle": "Looks, new arrivals and inspiration"
    }
  }
}
</i18n>

<template>
  <UPageSection
    :ui="{ container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14' }"
  >
    <div class="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
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
            {{ heroSocialProof }}
          </UButton>

          <h1 class="text-4xl font-black tracking-tight text-highlighted text-balance sm:text-5xl lg:text-6xl">
            {{ heroTitle }}
          </h1>

          <p class="mt-5 max-w-2xl text-base text-muted sm:text-lg">
            {{ heroSubtitle }}
          </p>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <UButton
              size="xl"
              color="primary"
              :to="startShoppingTo"
              icon="i-lucide-shopping-bag"
            >
              {{ heroCtaPrimary }}
            </UButton>

            <UButton
              size="xl"
              color="neutral"
              variant="soft"
              icon="i-simple-icons-whatsapp"
              :to="whatsappHref"
              target="_blank"
            >
              {{ heroWhatsappLabel }}
            </UButton>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div
              v-for="bullet in heroBullets"
              :key="bullet"
              class="flex items-center gap-2 text-sm font-medium text-toned"
            >
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-5 text-primary"
              />

              <span>{{ bullet }}</span>
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
              :src="imageUrl || 'https://yrdnlswgptdachbcoyri.supabase.co/storage/v1/object/public/products/products/256/c28c300c-0f1f-43f3-863b-098ca6e13d07.webp'"
              alt="Amoda party look"
              class="h-full w-full object-cover"
            >
          </div>

          <a
            :href="TIKTOK_LINK"
            target="_blank"
            rel="noopener noreferrer"
            class="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/90 px-3 py-3 shadow-lg backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary sm:bottom-4 sm:left-4 sm:right-4 sm:px-4"
            :aria-label="heroTiktokTitle"
          >
            <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-highlighted">
                  {{ isTiktokLive ? 'LIVE — ' : '' }}{{ heroTiktokTitle }}
                </p>

                <p class="line-clamp-2 text-xs text-muted sm:line-clamp-1">
                  {{ isTiktokLive ? 'Ao vivo agora' : heroTiktokSubtitle }}
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
    </div>
  </UPageSection>
</template>
