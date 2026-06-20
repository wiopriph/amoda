<script setup lang="ts">
import { COMPANY_ADDRESS } from '~/constants/contacts';


definePageMeta({ name: 'privacy-policy' });

const title = 'Política de Privacidade da Amoda | Dados de escolhas e WhatsApp';
const description = 'Veja como a Amoda usa dados pessoais para escolhas online, confirmação pelo WhatsApp, pontos de experimentação e apoio ao cliente.';

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
    { rel: 'canonical', href: 'https://amoda.ao/privacy-policy' },
  ],
}));

const highlights = [
  {
    icon: 'i-lucide-user',
    title: 'Sem cadastro obrigatório',
  },
  {
    icon: 'i-simple-icons-whatsapp',
    title: 'Usamos o WhatsApp para confirmar',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Dados usados só para o pedido',
  },
];

const sections = [
  {
    icon: 'i-lucide-building-2',
    title: 'Quem somos',
    text: 'A Amoda é a responsável pelo website e pelo tratamento dos dados usados para escolhas online.',
    items: [`Endereço: ${COMPANY_ADDRESS}`],
  },
  {
    icon: 'i-lucide-database',
    title: 'Dados que recolhemos',
    text: 'Não pedimos dados desnecessários. No checkout, recolhemos apenas o necessário para processar a sua escolha.',
    items: [
      'Nome',
      'Número de telefone / WhatsApp',
      'Itens escolhidos e ponto de experimentação',
    ],
  },
  {
    icon: 'i-lucide-message-circle',
    title: 'Como usamos os dados',
    text: 'Usamos os seus dados para confirmar a escolha, preparar os itens, falar consigo no WhatsApp e prestar apoio ao cliente.',
    items: [],
  },
  {
    icon: 'i-lucide-share-2',
    title: 'Partilha de dados',
    text: 'Não vendemos os seus dados. Só partilhamos informações quando for necessário para cumprir o pedido ou quando a lei exigir.',
    items: [],
  },
  {
    icon: 'i-lucide-clock',
    title: 'Por quanto tempo guardamos',
    text: 'Guardamos os dados pelo tempo necessário para gerir a escolha, apoio ao cliente e obrigações legais. Depois, os dados podem ser eliminados ou anonimizados.',
    items: [],
  },
  {
    icon: 'i-lucide-lock',
    title: 'Segurança',
    text: 'Aplicamos medidas razoáveis para proteger os seus dados contra acesso não autorizado, perda ou alteração.',
    items: [],
  },
  {
    icon: 'i-lucide-user-check',
    title: 'Os seus direitos',
    text: 'Você pode pedir informação, correção ou eliminação dos seus dados, quando aplicável. Para isso, fale connosco no WhatsApp.',
    items: [],
  },
  {
    icon: 'i-lucide-scan-face',
    title: 'Menores',
    text: 'A Amoda não é destinada a menores. Se acredita que recebemos dados de um menor, contacte-nos para resolvermos.',
    items: [],
  },
  {
    icon: 'i-lucide-external-link',
    title: 'Links externos',
    text: 'O nosso site pode ter links para outros websites, como WhatsApp, TikTok, Facebook ou Google Maps. Não controlamos as políticas desses serviços.',
    items: [],
  },
  {
    icon: 'i-lucide-refresh-ccw',
    title: 'Alterações',
    text: 'Podemos atualizar esta política quando necessário. A versão nova entra em vigor quando for publicada no site.',
    items: [],
  },
];

const { makeWhatsappHref } = useWhatsappLink();

const whatsappHref = makeWhatsappHref(() => 'Olá! Preciso de ajuda com privacidade ou dados pessoais na Amoda.');
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
          Privacidade simples
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Política de Privacidade
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          A Amoda usa apenas os dados necessários para receber a sua escolha, falar consigo no WhatsApp e preparar os seus itens.
        </p>

        <p class="mt-3 text-sm text-muted">
          Atualizado em 09/01/2026
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
            Você não precisa criar conta para usar a Amoda. Quando confirma uma escolha, pedimos apenas o seu nome e WhatsApp para confirmar o pedido e combinar a experimentação.
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <div class="divide-y divide-gray-100">
            <div
              v-for="section in sections"
              :key="section.title"
              class="py-5 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="section.icon"
                  class="size-5 text-primary"
                />

                <h2
                  class="text-lg font-bold text-highlighted"
                  v-text="section.title"
                />
              </div>

              <p
                class="mt-2 text-sm leading-7 text-muted sm:text-base"
                v-text="section.text"
              />

              <ul
                v-if="section.items.length"
                class="mt-3 space-y-2 text-sm leading-6 text-muted"
              >
                <li
                  v-for="item in section.items"
                  :key="item"
                  class="flex gap-2"
                >
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />

                  <span v-text="item" />
                </li>
              </ul>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          title="Precisa de ajuda com privacidade?"
          description="Fale connosco no WhatsApp se quiser perguntar algo sobre os seus dados pessoais."
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
              variant="solid"
              size="sm"
            >
              Falar no WhatsApp
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
