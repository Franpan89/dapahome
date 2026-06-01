// Renderer markdown minimalista para posts del blog.
// Soporta: h2/h3, párrafos, **bold**, *italic*, [texto](link),
// imágenes ![alt](url), listas - / 1., separador ---, line breaks.
// Sin HTML crudo: escapamos primero para mitigar XSS.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // imágenes (antes que enlaces)
  out = out.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_m, alt, src) =>
      `<img src="${src}" alt="${alt}" class="my-6 rounded-2xl w-full h-auto" loading="lazy" />`,
  );
  // links
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, text, href) => {
      const safeHref = /^(https?:|mailto:|tel:|\/)/.test(href) ? href : '#';
      const ext = /^https?:/.test(safeHref);
      return `<a href="${safeHref}"${ext ? ' target="_blank" rel="noopener"' : ''} class="text-primary underline underline-offset-2 hover:opacity-80">${text}</a>`;
    },
  );
  // bold + italic
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return out;
}

export function renderMarkdown(src: string): string {
  if (!src) return '';
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // separador ---
    if (/^---+$/.test(line)) {
      html.push('<hr class="my-10 border-ink-200/60" />');
      i++;
      continue;
    }

    // encabezados
    if (/^###\s+/.test(line)) {
      html.push(`<h3 class="font-display text-xl mt-8 mb-3 tracking-tight">${inline(line.replace(/^###\s+/, ''))}</h3>`);
      i++;
      continue;
    }
    if (/^##\s+/.test(line)) {
      html.push(`<h2 class="font-display text-2xl md:text-3xl mt-10 mb-4 tracking-tight">${inline(line.replace(/^##\s+/, ''))}</h2>`);
      i++;
      continue;
    }

    // listas
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ul class="my-4 ml-5 list-disc space-y-1.5">${items.join('')}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ol class="my-4 ml-5 list-decimal space-y-1.5">${items.join('')}</ol>`);
      continue;
    }

    // párrafo (acumula hasta línea vacía)
    if (line.trim() === '') { i++; continue; }
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#|---|[-*]\s|\d+\.\s)/.test(lines[i])) {
      paragraph.push(lines[i]);
      i++;
    }
    html.push(`<p class="my-4 leading-relaxed text-ink-800">${inline(paragraph.join(' '))}</p>`);
  }

  return html.join('\n');
}
