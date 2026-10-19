<script setup lang="ts">
definePageMeta({ name: 'delivery' });

const title = 'Como comprar roupa online na Amoda | Experimenta antes de pagar';
const description = 'Vê como comprar moda feminina online em Luanda na Amoda: envias o pedido no site sem pagar, experimentas em casa ou no showroom e pagas só pelo que gostar.';

const faqEntries = [
  {
    question: 'Preciso pagar antes?',
    answer: 'Não. Escolhes online e pagas apenas se gostares da peça depois de experimentar.',
  },
  {
    question: 'Posso escolher várias peças?',
    answer: 'Sim. Podes escolher várias peças e levar apenas as que gostares.',
  },
  {
    question: 'E se nada servir?',
    answer: 'Tudo bem. Se nada servir ou agradar, não precisas de comprar.',
  },
  {
    question: 'Como sei quando posso experimentar?',
    answer: 'A nossa equipa entra em contacto pelo WhatsApp para confirmar os detalhes.',
  },
  {
    question: 'Preciso de criar conta para fazer o pedido?',
    answer: 'Não é obrigatório. Podes continuar só com o número de telefone. Entrando com o código recebido por SMS, acompanhas o estado do pedido na tua conta e usas os cupões de desconto disponíveis.',
  },
  {
    question: 'Onde fica o showroom?',
    answer: 'Na página do showroom encontras o endereço, o horário e os contactos.',
  },
];

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [
    { rel: 'canonical', href: 'https://amoda.ao/delivery' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqEntries.map((faqEntry) => ({
          '@type': 'Question',
          name: faqEntry.question,
          acceptedAnswer: { '@type': 'Answer', text: faqEntry.answer },
        })),
      }),
    },
  ],
}));

const valueCards = [
  {
    icon: 'i-lucide-shirt',
    title: 'Provas primeiro',
    description: 'Vês o tamanho, o tecido e como a peça te fica antes de decidir.',
  },
  {
    icon: 'i-lucide-wallet',
    title: 'Paga só o que gostar',
    description: 'Se uma peça não servir ou não agradar, simplesmente não a levas.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Sem risco desnecessário',
    description: 'Nada de pagar online por uma peça que ainda não viste ao vivo.',
  },
  {
    icon: 'i-simple-icons-whatsapp',
    title: 'Ajuda no WhatsApp',
    description: 'Se tiveres dúvidas sobre tamanho, ponto ou escolha, fala connosco pelo WhatsApp.',
  },
];

const purchaseSteps = [
  {
    title: 'Escolhe as peças',
    description: 'Vê os produtos no site e adiciona ao carrinho as peças que queres experimentar.',
  },
  {
    title: 'Envia o pedido no site',
    description: 'Leva menos de um minuto: indicas o número de telefone e escolhes onde experimentar — no showroom em Luanda (grátis) ou com entrega ao domicílio. Não precisas de pagar online.',
  },
  {
    title: 'Nós confirmamos',
    description: 'A nossa equipa fala contigo no WhatsApp para confirmar a disponibilidade, o horário e, na entrega, o custo até à tua morada.',
  },
  {
    title: 'Experimenta',
    description: 'Em casa, com o estafeta à espera, ou no showroom, com calma em frente ao espelho.',
  },
  {
    title: 'Paga só o que levar',
    description: 'Gostaste? Levas e pagas em dinheiro, transferência ou TPA. Não gostaste? Sem problema, não precisas de levar.',
  },
];

const infoCards = [
  {
    icon: 'i-lucide-shopping-bag',
    title: 'A escolha não é compra obrigatória',
    description: 'Selecionar significa que queres experimentar. Só pagas se decidires levar.',
  },
  {
    icon: 'i-simple-icons-whatsapp',
    title: 'Confirmação pelo WhatsApp',
    description: 'Depois do pedido, a nossa equipa entra em contacto para confirmar disponibilidade e detalhes.',
  },
  {
    icon: 'i-lucide-clock',
    title: 'Produtos ficam separados por tempo limitado',
    description: 'Informamos no WhatsApp até quando a tua escolha estará disponível.',
  },
  {
    icon: 'i-lucide-search-check',
    title: 'Confere tudo antes de pagar',
    description: 'Vê tamanho, cor, tecido e estado da peça antes de finalizar a compra.',
  },
  {
    icon: 'i-lucide-ticket',
    title: 'Conta e cupões',
    description: 'Entra com o teu número ao fazer o pedido para acompanhar o estado na tua conta e usar os cupões de desconto disponíveis.',
  },
  {
    icon: 'i-lucide-refresh-ccw',
    title: 'Trocas e devoluções',
    description: 'Depois de comprar, trocas e devoluções seguem a nossa política oficial.',
  },
];

const accordionItems = faqEntries.map((faqEntry) => ({
  label: faqEntry.question,
  content: faqEntry.answer,
}));

const pickupPointsTo = { name: 'pickup-points' } as const;
const returnPolicyTo = { name: 'return-policy' } as const;
const blogGuideTo = '/blog/como-funciona-experimenta-antes-de-pagar';

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Quero falar com a Amoda sobre como experimentar antes de pagar.');
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8"
      >
        <div class="flex flex-wrap gap-2">
          <UBadge
            color="primary"
            variant="soft"
          >
            Sem pagamento online
          </UBadge>

          <UBadge
            color="primary"
            variant="soft"
          >
            Experimenta antes
          </UBadge>

          <UBadge
            color="primary"
            variant="soft"
          >
            Fácil pelo WhatsApp
          </UBadge>
        </div>

        <h1 class="mt-5 text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Escolhe online. Experimenta antes de pagar.
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Na Amoda escolhes as peças pelo site, envias o pedido em menos de um minuto e experimentas antes de decidir —
          em casa ou no nosso showroom em Luanda. Pagas apenas pelo que gostares.
        </p>

        <div class="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <UButton
            :to="pickupPointsTo"
            size="xl"
            color="primary"
            icon="i-lucide-map-pin"
            class="justify-center"
          >
            Ver o showroom
          </UButton>

          <UButton
            :to="returnPolicyTo"
            size="xl"
            color="primary"
            variant="soft"
            icon="i-lucide-refresh-ccw"
            class="justify-center"
          >
            Ver política de trocas
          </UButton>
        </div>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <div>
            <h2 class="text-xl font-bold text-highlighted">
              Comprar roupa online sem medo
            </h2>

            <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
              Sabemos que roupa pode ficar diferente no corpo. Por isso não precisas de pagar antes de experimentar.
            </p>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              v-for="valueCard in valueCards"
              :key="valueCard.title"
              class="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="valueCard.icon"
                  class="size-5 text-primary"
                />

                <h3
                  class="font-semibold text-highlighted"
                  v-text="valueCard.title"
                />
              </div>

              <p
                class="mt-2 text-sm leading-6 text-muted"
                v-text="valueCard.description"
              />
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-bold text-highlighted">
            Como funciona
          </h2>

          <div class="mt-5 space-y-3">
            <div
              v-for="(purchaseStep, stepIndex) in purchaseSteps"
              :key="purchaseStep.title"
              class="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                v-text="stepIndex + 1"
              />

              <div class="min-w-0">
                <h3
                  class="font-semibold text-highlighted"
                  v-text="purchaseStep.title"
                />

                <p
                  class="mt-1 text-sm leading-6 text-muted"
                  v-text="purchaseStep.description"
                />
              </div>
            </div>
          </div>

          <p class="mt-5 text-sm leading-6 text-muted">
            Queres ver cada passo com imagens do site?

            <NuxtLink
              :to="blogGuideTo"
              class="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Vê o guia passo a passo no blog
            </NuxtLink>.
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard class="border-primary/20 bg-primary/5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-bold text-highlighted">
                Queres ver onde experimentar?
              </h2>

              <p class="mt-1 text-sm leading-6 text-muted">
                Vê o endereço, o horário e os contactos do showroom.
              </p>
            </div>

            <UButton
              :to="pickupPointsTo"
              color="primary"
              size="lg"
              class="w-full justify-center sm:w-auto"
            >
              Ver o showroom
            </UButton>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-bold text-highlighted">
            Informações importantes
          </h2>

          <div class="mt-5 divide-y divide-gray-100">
            <div
              v-for="infoCard in infoCards"
              :key="infoCard.title"
              class="py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="infoCard.icon"
                  class="size-5 text-primary"
                />

                <h3
                  class="font-semibold text-highlighted"
                  v-text="infoCard.title"
                />
              </div>

              <p
                class="mt-2 text-sm leading-6 text-muted"
                v-text="infoCard.description"
              />
            </div>
          </div>

          <div class="mt-5">
            <UButton
              :to="returnPolicyTo"
              color="neutral"
              variant="soft"
              class="w-full justify-center sm:w-auto"
            >
              Ver política de trocas
            </UButton>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-highlighted">
              Dúvidas frequentes
            </h2>
          </template>

          <UAccordion :items="accordionItems" />
        </UCard>
      </section>

      <section class="mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          title="Queres falar com a Amoda?"
          description="Envia uma mensagem no WhatsApp para tirar dúvidas sobre escolhas, tamanhos e o showroom."
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
            >
              Falar no WhatsApp
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
