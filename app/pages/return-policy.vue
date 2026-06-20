<script setup lang="ts">
definePageMeta({ name: 'return-policy' });

const title = 'Trocas e devoluções na Amoda | Experimente antes de pagar';
const description = 'Conheça a política de trocas e devoluções da Amoda em Luanda. Experimente antes de pagar, leve só o que gostar e veja as regras após a compra.';

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
    { rel: 'canonical', href: 'https://amoda.ao/return-policy' },
  ],
}));

const highlights = [
  {
    icon: 'i-lucide-shirt',
    title: 'Experimente primeiro',
  },
  {
    icon: 'i-lucide-wallet',
    title: 'Pague só o que levar',
  },
  {
    icon: 'i-lucide-refresh-ccw',
    title: 'Troca possível em até 7 dias',
  },
];

const rules = [
  {
    icon: 'i-lucide-calendar-days',
    title: 'Prazo de 7 dias',
    text: 'Depois de levar a peça, você pode pedir troca ou devolução em até 7 dias.',
  },
  {
    icon: 'i-lucide-tags',
    title: 'Produto sem uso',
    text: 'A peça precisa estar sem uso, em condição original, com etiqueta, embalagem e acessórios.',
  },
  {
    icon: 'i-lucide-ban',
    title: 'Itens que não aceitamos',
    text: 'Não aceitamos devolução de roupa interior, itens de higiene pessoal, produtos Final Sale, peças usadas, danificadas ou alteradas.',
  },
  {
    icon: 'i-lucide-banknote',
    title: 'Reembolso',
    text: 'Se a devolução for aprovada, o valor será devolvido conforme o método usado no ponto. O prazo normal é de 5 a 10 dias úteis.',
  },
  {
    icon: 'i-lucide-alert-circle',
    title: 'Produto errado ou com defeito',
    text: 'Se receber algo errado ou com defeito, contacte-nos em até 24 horas após o levantamento e envie fotos.',
  },
];

const { makeWhatsappHref } = useWhatsappLink();

const whatsappHref = makeWhatsappHref(() => 'Olá! Preciso de ajuda com troca ou devolução na Amoda.');
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          Sem pagamento antes de experimentar
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Trocas e devoluções
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Na Amoda, você pode experimentar antes de pagar. Se não gostar no ponto, não leva e não paga.
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in highlights"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />

            <span v-text="item.title" />
          </div>
        </div>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard class="border-primary/20 bg-primary/5">
          <h2 class="text-xl font-black text-highlighted">
            O mais importante
          </h2>

          <p class="mt-3 text-sm leading-7 text-muted sm:text-base">
            Antes de pagar, você pode ver, tocar e experimentar as peças. Se não servir, não ficar bem ou não gostar, basta recusar no local.
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-black text-highlighted">
            Regras depois da compra
          </h2>

          <div class="mt-5 divide-y divide-gray-100">
            <div
              v-for="rule in rules"
              :key="rule.title"
              class="py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="rule.icon"
                  class="size-5 text-primary"
                />

                <h3
                  class="font-bold text-highlighted"
                  v-text="rule.title"
                />
              </div>

              <p
                class="mt-2 text-sm leading-6 text-muted"
                v-text="rule.text"
              />
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-black text-highlighted">
            Como pedir troca ou devolução
          </h2>

          <p class="mt-3 text-sm leading-7 text-muted sm:text-base">
            Entre em contacto e informe o número da escolha. A nossa equipa vai orientar os próximos passos.
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          title="Precisa de ajuda?"
          description="Fale connosco no WhatsApp. Vamos orientar sobre troca, devolução ou qualquer dúvida."
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
              variant="solid"
              size="sm"
            >
              Escrever no WhatsApp
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
