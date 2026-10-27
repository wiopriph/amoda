import { useHead, useRuntimeConfig } from '#imports';
import { deferThirdParty } from '~/utils/deferThirdParty';


interface PublicConfig {
  gtmId?: string;
  gtmEnabled?: boolean | string;
}

export default defineNuxtPlugin(() => {
  const { public: publicConfig } = useRuntimeConfig() as { public: PublicConfig };

  const isEnabled =
        publicConfig.gtmEnabled === true ||
        String(publicConfig.gtmEnabled).toLowerCase() === 'true';

  const gtmId = typeof publicConfig.gtmId === 'string' ? publicConfig.gtmId.trim() : '';

  if (!isEnabled || !gtmId) {
    return;
  }

  // dataLayer создаётся сразу: события до загрузки gtm.js копятся в очереди и
  // обрабатываются контейнером при старте
  const w = window as Window & { dataLayer?: unknown[] };

  w.dataLayer = w.dataLayer || [];

  useHead({
    noscript: [
      {
        id: 'gtm-noscript',
        innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        tagPosition: 'bodyOpen',
      },
    ],
  });

  deferThirdParty(() => {
    if (document.getElementById('gtm-script')) {
      return;
    }

    w.dataLayer!.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    const script = document.createElement('script');

    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(script);
  });
});
