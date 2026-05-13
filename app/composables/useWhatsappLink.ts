import { CONTACT_PHONE } from '~/constants/contacts';


export const useWhatsappLink = () => {
  const { publicCode } = useCart();
  const isMounted = ref(false);

  const phone = String(CONTACT_PHONE).replace(/\D/g, '');

  onMounted(() => {
    isMounted.value = true;
  });

  const withCartCode = (message: string) => {
    const lines = [message.trim()];

    if (isMounted.value && publicCode.value) {
      lines.push(`Código do carrinho: ${publicCode.value}`);
    }

    return lines.filter(Boolean).join('\n');
  };

  const makeWhatsappHref = (message: MaybeRefOrGetter<string>) =>
    computed(() => `https://wa.me/${phone}?text=${encodeURIComponent(withCartCode(toValue(message)))}`);

  return {
    makeWhatsappHref,
  };
};
