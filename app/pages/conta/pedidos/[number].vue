<script setup lang="ts">
definePageMeta({ name: 'conta-pedidos-number', layout: 'account', middleware: 'account' });

const route = useRoute();
const orderNumber = String(route.params.number);

useHead({
  title: `Pedido #${orderNumber} | Amoda`,
  meta: [
    { name: 'description', content: `Estado e peças do pedido #${orderNumber}.` },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const { data: order, error } = await useFetch<any>(`/api/account/orders/${encodeURIComponent(orderNumber)}`);

if (error.value || !order.value) {
  throw createError({ statusCode: 404, fatal: true });
}
</script>

<template>
  <AccountOrderDetail :order="order" />
</template>
