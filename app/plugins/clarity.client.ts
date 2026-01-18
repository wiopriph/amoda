export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const clarityId = config.public.clarityId;

  if (!clarityId) {
    return;
  }

  if (document.getElementById('ms-clarity')) {
    return;
  }

  (function(c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
    c[a] = c[a] || function() {
      (c[a].q = c[a].q || []).push(arguments);
    };

    t = l.createElement(r);
    t.async = 1;
    t.src = `https://www.clarity.ms/tag/${i}`;
    t.id = 'ms-clarity';
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', clarityId);
});
