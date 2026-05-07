export default defineNuxtPlugin(async () => {
  const sid = useCookie('sid', { maxAge: 60 * 60 * 24 * 180, sameSite: 'lax' });

  if (!sid.value) {
    sid.value = crypto.randomUUID();
  }

  const { initCart } = useCart();

  await initCart(sid.value);
});
