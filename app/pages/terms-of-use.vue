<script setup lang="ts">
definePageMeta({ name: 'terms-of-use' });

const title = 'Termos de Uso da Amoda | Escolhas online sem pagamento antecipado';
const description = 'Termos de Uso da Amoda | Escolhas online sem pagamento antecipado';

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
    { rel: 'canonical', href: 'https://amoda.ao/terms-of-use' },
  ],
}));

const highlights = [
  {
    icon: 'i-lucide-shirt',
    title: 'Escolher online',
  },
  {
    icon: 'i-lucide-wallet',
    title: 'Sem pagamento antecipado',
  },
  {
    icon: 'i-simple-icons-whatsapp',
    title: 'Confirmamos via WhatsApp',
  },
];

const sections = [
  {
    icon: 'i-lucide-shopping-cart',
    title: 'Como funciona',
    text: 'Você pode navegar, escolher produtos e enviar a sua escolha sem criar conta.',
    items: [
      'Adicionar produtos ao carrinho',
      'Fazer pedido sem pagar',
      'Escolher ponto de levantamento',
    ],
  },
  {
    icon: 'i-lucide-user',
    title: 'Seu compromisso',
    text: 'Você deve fornecer dados corretos para que possamos processar o pedido.',
    items: [
      'Nome e telefone válidos',
      'Usar seus próprios dados',
      'Responder quando contactarmos',
    ],
  },
  {
    icon: 'i-lucide-alert-circle',
    title: 'Pedidos',
    text: 'Um pedido é uma intenção de compra. Podemos confirmar ou cancelar se houver problemas.',
    items: [
      'Confirmamos via WhatsApp',
      'Podemos cancelar por erro ou indisponibilidade',
    ],
  },
  {
    icon: 'i-lucide-tag',
    title: 'Preços',
    text: 'Tentamos manter tudo correto, mas podemos corrigir erros se acontecerem.',
    items: [
      'Atualização de preços',
      'Cancelamento em caso de erro',
    ],
  },
  {
    icon: 'i-lucide-shield',
    title: 'Uso da plataforma',
    text: 'Use a Amoda de forma normal e legal.',
    items: [
      'Não usar para fraude',
      'Não tentar hackear',
      'Não abusar do sistema',
    ],
  },
];

const { makeWhatsappHref } = useWhatsappLink();

const whatsappHref = makeWhatsappHref(() => 'Olá! Tenho uma dúvida sobre os termos de uso da Amoda.');
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section class="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-6 sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          Sem complicação
        </UBadge>

        <h1 class="text-3xl font-black sm:text-5xl">
          Termos de Uso
        </h1>

        <p class="mt-3 text-muted">
          Regras simples para usar a Amoda
        </p>

        <div class="mt-5 flex flex-wrap gap-4 text-sm">
          <div
            v-for="item in highlights"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />
            {{ item.title }}
          </div>
        </div>
      </section>

      <section class="mt-6">
        <UCard class="border-primary/20 bg-primary/5">
          <h2 class="text-xl font-black">
            Resumo rápido
          </h2>

          <p class="mt-3 text-muted">
            Você usa a Amoda para escolher roupas, selecionar sem pagar e experimentar antes de decidir. Nós usamos seus dados apenas para processar o pedido e falar com você.
          </p>
        </UCard>
      </section>

      <section class="mt-6 space-y-4">
        <UCard
          v-for="section in sections"
          :key="section.title"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="section.icon"
              class="size-5 text-primary"
            />

            <h2
              class="font-bold"
              v-text="section.title"
            />
          </div>

          <p
            class="mt-2 text-muted"
            v-text="section.text"
          />

          <ul
            v-if="section.items.length"
            class="mt-3 space-y-2 text-sm text-muted"
          >
            <li
              v-for="item in section.items"
              :key="item"
              class="flex gap-2"
            >
              <span class="mt-2 size-1.5 rounded-full bg-primary" />
              {{ item }}
            </li>
          </ul>
        </UCard>
      </section>

      <section class="mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          title="Dúvidas?"
          description="Fale connosco no WhatsApp se algo não estiver claro."
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
