// Минимальная санитизация HTML из админки (seo_content категорий):
// режем скрипты, фреймы, inline-обработчики и javascript:-ссылки.
// Контент пишет только своя админка — это страховка от stored XSS, не общий санитайзер.
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?(?:<\/\1\s*>|$)/gi, '')
    .replace(/<\/?(?:script|style|iframe|object|embed)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, '$1="#"');
}
