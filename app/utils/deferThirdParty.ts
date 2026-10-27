// Аналитика (GTM, Clarity) грузится после первого действия пользователя либо через паузу
// после load: эти скрипты съедали ~1 с главного потока ровно во время отрисовки страницы
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'] as const;

const FALLBACK_DELAY_MS = 4000;

export function deferThirdParty(load: () => void, fallbackDelayMs = FALLBACK_DELAY_MS) {
  let done = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const run = () => {
    if (done) {
      return;
    }

    done = true;

    if (timer) {
      clearTimeout(timer);
    }

    for (const eventName of INTERACTION_EVENTS) {
      window.removeEventListener(eventName, run);
    }

    load();
  };

  for (const eventName of INTERACTION_EVENTS) {
    window.addEventListener(eventName, run, { once: true, passive: true });
  }

  const startTimer = () => {
    timer = setTimeout(run, fallbackDelayMs);
  };

  if (document.readyState === 'complete') {
    startTimer();
  } else {
    window.addEventListener('load', startTimer, { once: true });
  }
}
