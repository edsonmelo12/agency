
import { GoogleGenAI, Part, Type, Modality } from "@google/genai";
import { GenerationOptions, PageType, Section, Producer, ProductInfo, ImageAspectRatio, VisualStyle, Ebook, EbookChapter, VslScript, SeoSettings, AssetPreset, ImageExportFormat, EbookConfig, PaidCampaignInput, PaidCampaignPlan, AiPlanResult, ImageFallbackReason } from "../types";

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY ?? import.meta.env.VITE_API_KEY) as string | undefined;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY não configurada. Defina VITE_GEMINI_API_KEY ou VITE_API_KEY no .env.");
}

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY as string | undefined;
const OPENROUTER_URL = import.meta.env.VITE_OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'gpt-4o-mini';

const createGenAiClient = () => new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const extractErrorMessage = (err: any) =>
  String(err?.message || err?.error?.message || '').toLowerCase();

const shouldFallbackToOpenRouter = (err: any) => {
  if (!OPENROUTER_KEY) return false;
  const message = extractErrorMessage(err);
  return message.includes('quota') || message.includes('resource_exhausted') || message.includes('429');
};

const isQuotaError = (err: any) => {
  const message = extractErrorMessage(err);
  return /quota|resource_exhausted|429|rate limit|limit exceeded/i.test(message);
};

const isOtherImageError = (err: any) => /OTHER/i.test(extractErrorMessage(err));

const shouldFallbackImageModel = (err: any) => isQuotaError(err) || isOtherImageError(err);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (err: any): boolean => {
  const message = String(err?.message || '');
  const code = err?.error?.code ?? err?.code;
  const status = err?.error?.status ?? err?.status;
  return code === 503 || status === 'UNAVAILABLE' || /overloaded|unavailable|503/i.test(message);
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelay = 700): Promise<T> => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryableError(err) || attempt >= retries) throw err;
      await sleep(baseDelay * Math.pow(2, attempt));
      attempt += 1;
    }
  }
};

/**
 * Limpa a resposta da IA, removendo blocos de código Markdown e ruídos de texto explicativo.
 * Crucial para manter a estabilidade do JSON.parse().
 */
const cleanJsonResponse = (text: string): string => {
  if (!text) return "[]";
  let cleaned = text.trim();

  // Remove blocos de código markdown (```json ... ```)
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  let start = -1;
  let end = -1;

  if (firstBracket !== -1 && (firstBrace === -1 || (firstBracket < firstBrace && firstBracket !== -1))) {
    start = firstBracket;
    end = lastBracket;
  } else if (firstBrace !== -1) {
    start = firstBrace;
    end = lastBrace;
  }

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned;
};

/**
 * Remove metadados de texto que a IA às vezes inclui dentro de campos de string JSON.
 */
const stripJsonNoise = (text: string): string => {
  if (!text) return "";
  let s = text.trim();
  if (s.startsWith('{') || s.startsWith('"') || s.includes('":')) {
    try {
      const parsed = JSON.parse(s);
      if (typeof parsed === 'object') return parsed.introduction || parsed.conclusion || parsed.content || s;
    } catch (e) {
      return s.replace(/^[^{]*{[^}]*intro(duction)?":\s*"/i, '').replace(/"\s*,?\s*"chapters":.*$/is, '').replace(/^["\s]+|["\s]+$/g, '');
    }
  }
  return s;
};

const stripAuthorWidthLimits = (html: string) => {
  if (!html) return html;
  return html.replace(/class=["']([^"']*)["']/g, (_match, cls) => {
    const cleaned = cls
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => {
        const base = token.split(':').pop() || token;
        if (base === 'mx-auto') return false;
        if (base.startsWith('max-w-')) return false;
        if (base.startsWith('w-[')) return false;
        if (/^w-(1\/2|1\/3|2\/3|3\/4|4\/5|5\/6|2\/5|1\/4|2\/4|3\/4|[0-9]+\/[0-9]+)$/.test(base)) return false;
        return true;
      });
    return `class="${cleaned.join(' ')}"`;
  });
};

const sanitizeAuthorHtml = (html: string) => {
  if (!html) return html;
  let cleaned = html
    .replace(/<img\b([^>]*?)<img\b[^>]*?>/gi, '<img$1>')
    .replace(/<img\b([^>]*?)<\s*\/img>/gi, '<img$1>')
    .replace(/<img\b[^>]*?\s+img\s*=\s*["'][^"']*["'][^>]*>/gi, '');

  if (typeof DOMParser === 'undefined') {
    return cleaned;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${cleaned}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement | null;
    if (!root) return cleaned;
    const imgs = Array.from(root.querySelectorAll('img'));
    const links = Array.from(root.querySelectorAll('a'));
    links.forEach((link) => link.remove());
    imgs.forEach((img) => {
      const src = (img.getAttribute('src') || '').trim();
      if (!src || /<img/i.test(src) || /img\s+src=/i.test(src)) {
        img.remove();
      }
    });
    return root.innerHTML;
  } catch {
    return cleaned;
  }
};

const fetchOpenRouterResponse = async (prompt: string) => {
  if (!OPENROUTER_KEY) throw new Error('OPENROUTER_KEY não configurada para fallback.');
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.55,
      messages: [
        { role: 'system', content: 'Você é um estrategista de marketing pago que responde apenas em JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1200,
      stream: false,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter fallback falhou (${response.status}): ${errorText}`);
  }
  const json = await response.json();
  return json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text || '';
};

const buildAuthorContentBlocks = (html: string, expert: Producer) => {
  const fallbackHeading = `<h3 class="text-2xl md:text-3xl font-extrabold tracking-tight text-current">${expert.name || '__EXPERT_NAME__'}</h3>`;
  const fallbackBio = `<p class="text-base leading-relaxed text-current opacity-90">${expert.authority || 'Especialista com experiencia comprovada no tema.'}</p>`;
  const fallbackList = `
      <ul class="space-y-3 text-sm text-current opacity-90">
        <li class="flex gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-emerald-500"></span>Atuacao pratica com resultados reais.</li>
        <li class="flex gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-emerald-500"></span>Metodologia aplicada em casos concretos.</li>
        <li class="flex gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-emerald-500"></span>Didatica clara e foco em execucao.</li>
      </ul>
    `;

  if (typeof DOMParser === 'undefined') {
    return { headingHtml: fallbackHeading, paragraphHtml: fallbackBio, listHtml: fallbackList };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement | null;
    if (!root) {
      return { headingHtml: fallbackHeading, paragraphHtml: fallbackBio, listHtml: fallbackList };
    }
    const headingEl = root.querySelector('h1,h2,h3,h4,strong');
    const headingText = (headingEl?.textContent || expert.name || '').trim();
    const paragraphs = Array.from(root.querySelectorAll('p'))
      .map((p) => (p.textContent || '').trim())
      .filter((t) => t.length > 0);
    const listItems = Array.from(root.querySelectorAll('li'))
      .map((li) => (li.textContent || '').trim())
      .filter((t) => t.length > 0);

    const headingHtml = headingText
      ? `<h3 class="text-2xl md:text-3xl font-extrabold tracking-tight text-current">${headingText}</h3>`
      : fallbackHeading;
    const paragraphHtml = paragraphs.length > 0
      ? paragraphs.slice(0, 2).map(p => `<p class="text-base leading-relaxed text-current opacity-90">${p}</p>`).join('\n')
      : fallbackBio;
    const listHtml = listItems.length > 0
      ? `<ul class="space-y-3 text-sm text-current opacity-90">${listItems.slice(0, 3).map(t => `<li class="flex gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-emerald-500"></span>${t}</li>`).join('')}</ul>`
      : fallbackList;
    return { headingHtml, paragraphHtml, listHtml };
  } catch {
    return { headingHtml: fallbackHeading, paragraphHtml: fallbackBio, listHtml: fallbackList };
  }
};

const extractAuthorImageTag = (html: string) => {
  if (!html || typeof DOMParser === 'undefined') return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement | null;
    if (!root) return null;
    const imgs = Array.from(root.querySelectorAll('img'));
    const img = imgs.find((el) => {
      const src = (el.getAttribute('src') || '').trim();
      if (!src) return false;
      if (/<img/i.test(src) || /img\s+src=/i.test(src)) return false;
      return true;
    });
    return img?.outerHTML || null;
  } catch {
    return null;
  }
};

const buildDesignSystemContext = (options: GenerationOptions, sectionId: string = '') => {
  const ds = options.designSystem;
  if (!ds) return '';
  const strengthNote = ds.strength === 'light'
    ? 'Forca leve: aplique apenas paleta e tipografia.'
    : ds.strength === 'strong'
      ? 'Forca forte: aplique paleta, tipografia, efeitos e sugestoes de layout.'
      : 'Forca media: aplique paleta, tipografia e efeitos.';
  const key = (sectionId || '').toLowerCase().trim();
  const sectionOverride = (ds.sectionOverrides && (ds.sectionOverrides[key] || ds.sectionOverrides[sectionId])) || '';
  const parts: string[] = [
    'DESIGN SYSTEM (multi-segmento):',
    `Segmento: ${ds.segment || 'Nao definido'}. Estilo: ${ds.style || 'Nao definido'}.`,
    strengthNote
  ];
  if (ds.globalRules) parts.push(`Base Global: ${ds.globalRules}`);
  if (ds.segmentSystem) parts.push(`Sistema do Segmento: ${ds.segmentSystem}`);
  if (ds.projectOverride) parts.push(`Override do Projeto: ${ds.projectOverride}`);
  if (sectionOverride) parts.push(`Override da Secao (${key}): ${sectionOverride}`);
  return parts.join('\n');
};

const buildFreedomContext = (options: GenerationOptions) => {
  const level = options.creativeFreedom || 'medium';
  if (level === 'low') {
    return 'Liberdade baixa: siga layouts seguros e padrões convencionais. Evite estruturas incomuns.';
  }
  if (level === 'high') {
    return 'Liberdade alta: escolha a melhor estrutura visual para o objetivo. Evite templates rígidos e proponha soluções criativas mantendo clareza e conversão.';
  }
  return 'Liberdade média: mantenha clareza e consistência, mas varie layout quando fizer sentido.';
};

const buildBusinessBrief = (producer: Producer, product: ProductInfo) => {
  const promise = product?.description || 'Promessa não informada.';
  const mechanism = product?.uniqueMechanism || 'Mecanismo não informado.';
  const proof = product?.proofStats || 'Prova não informada.';
  const objections = product?.objections || 'Objeções não informadas.';
  return `Brief de Negócio:
- Promessa: ${promise}
- Mecanismo: ${mechanism}
- Provas: ${proof}
- Objeções: ${objections}
- Autoridade: ${producer?.authority || 'Não informada'}`;
};

const getSectionObjective = (sectionId: string) => {
  const key = (sectionId || '').toLowerCase();
  if (key === 'hero') return 'Objetivo: captar atenção e apresentar promessa principal.';
  if (key === 'problem') return 'Objetivo: gerar identificação com a dor e urgência.';
  if (key === 'benefits') return 'Objetivo: destacar ganhos claros e tangíveis.';
  if (key === 'highlight') return 'Objetivo: reforçar a proposta central com impacto.';
  if (key === 'method') return 'Objetivo: explicar como funciona de forma simples.';
  if (key === 'author') return 'Objetivo: construir autoridade e confiança.';
  if (key === 'proof') return 'Objetivo: validar com prova social.';
  if (key === 'offer') return 'Objetivo: converter com oferta clara e CTA.';
  if (key === 'faq') return 'Objetivo: remover objeções.';
  return 'Objetivo: comunicar valor com clareza.';
};

const getSectionLayoutRule = (sectionId: string) => {
  const key = (sectionId || '').toLowerCase();
  if (key === 'proof' || key === 'offer') {
    return 'Layout: use card interno centralizado (bloco com fundo e borda suave) para o conteúdo principal.';
  }
  if (key === 'author') {
    return 'Layout: siga o layout fixo do autor com duas colunas.';
  }
  return 'Layout: conteúdo direto no fundo da seção (sem card centralizado). Evite wrapper com bg/rounded/shadow e max-w.';
};

const stripCardWrapper = (html: string) => {
  if (!html || typeof DOMParser === 'undefined') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement | null;
    if (!root) return html;
    const elements = Array.from(root.children);
    if (elements.length !== 1) return html;
    const card = elements[0] as HTMLElement;
    const cls = (card.getAttribute('class') || '').split(/\s+/);
    const hasBg = cls.some((c) => c.startsWith('bg-'));
    const hasRounded = cls.some((c) => c.startsWith('rounded'));
    const hasShadow = cls.some((c) => c.startsWith('shadow'));
    const hasPadding = cls.some((c) => c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-'));
    const hasNarrow =
      cls.some((c) => c.startsWith('max-w-')) ||
      cls.some((c) => c.startsWith('w-[')) ||
      cls.some((c) => c === 'mx-auto');
    if (card.tagName.toLowerCase() === 'div' && hasBg && hasRounded && hasPadding && (hasShadow || hasNarrow)) {
      return card.innerHTML.trim();
    }
    return html;
  } catch {
    return html;
  }
};

const stripCardWrapperInSection = (html: string) => {
  if (!html || typeof DOMParser === 'undefined') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const section = doc.body.querySelector('section');
    if (!section) return stripCardWrapper(html);
    const container = section.querySelector('.container') || section.querySelector('div');
    if (!container) return html;
    const inner = container.innerHTML.trim();
    // 1) Remove "card" wrapper when content should be direct.
    let stripped = stripCardWrapper(inner);

    // 2) Remove "page wrapper" (inner bg + large padding + nested container).
    if (stripped === inner) {
      const tmpDoc = parser.parseFromString(`<div>${inner}</div>`, 'text/html');
      const root = tmpDoc.body.firstElementChild as HTMLElement | null;
      if (root && root.children.length === 1) {
        const wrapper = root.children[0] as HTMLElement;
        const cls = (wrapper.getAttribute('class') || '').split(/\s+/);
        const hasBg = cls.some((c) => c.startsWith('bg-'));
        const hasPadding = cls.some((c) => c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-'));
        const hasBigPadding = cls.some((c) => /^py-(2[0-9]|3[0-9])/.test(c) || /^p-(2[0-9]|3[0-9])/.test(c));
        const nestedContainer = wrapper.querySelector('.container');
        if (hasBg && hasPadding && (hasBigPadding || nestedContainer)) {
          const candidate = (nestedContainer?.innerHTML || wrapper.innerHTML || '').trim();
          if (candidate) stripped = candidate;
        }
      }
    }

    if (stripped !== inner) {
      container.innerHTML = stripped;
      return section.outerHTML || html;
    }
    return html;
  } catch {
    return html;
  }
};

const enforceAuthorSectionLayout = (content: string, expert: Producer) => {
  const sanitized = stripAuthorWidthLimits(sanitizeAuthorHtml((content || '').trim()));
  const imgMatch = extractAuthorImageTag(sanitized) || sanitized.match(/<img\b[^>]*>/i)?.[0] || null;
  const extractSrc = (tag: string | null) => {
    if (!tag) return '__EXPERT_PHOTO__';
    const match = tag.match(/src=["']([^"']+)["']/i);
    return match?.[1] || '__EXPERT_PHOTO__';
  };
  const imgSrc = extractSrc(imgMatch);
  const imgTag = `<img class="w-56 h-56 rounded-full object-cover shadow-md" src="${imgSrc}" alt="Foto do especialista" />`;
  let cleaned = imgMatch ? sanitized.replace(imgMatch, '').trim() : sanitized.trim();
  cleaned = cleaned.replace(/<img\b[^>]*>/gi, '').trim();
  const { headingHtml, paragraphHtml, listHtml } = buildAuthorContentBlocks(cleaned, expert);

  return `
      <div class="w-full rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-10">
        <div class="grid w-full items-start gap-10 lg:grid-cols-2">
          <div class="flex justify-center lg:justify-start">
            ${imgTag}
          </div>
          <div class="w-full space-y-6">
            <div class="space-y-3">
              ${headingHtml}
              ${paragraphHtml}
            </div>
            ${listHtml}
          </div>
        </div>
      </div>
    `;
};

const forceAuthorSectionLayout = (content: string, expert: Producer) => {
  if (typeof DOMParser === 'undefined') return content;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const section = doc.body.querySelector('section');
    if (!section) return content;
    const container = section.querySelector('div');
    if (!container) return content;
    const inner = container.innerHTML || '';
    container.innerHTML = enforceAuthorSectionLayout(inner, expert);
    return section.outerHTML || content;
  } catch {
    return content;
  }
};

/**
 * Injeta dados dinâmicos do Expert e Produto nos Placeholders do HTML gerado.
 */
const postProcessGeneratedHTML = (sections: Section[], producer: Producer, product: ProductInfo, options?: GenerationOptions): Section[] => {
  const logo = producer?.brandKit?.logoUrl || '';
  const photo = producer?.brandKit?.photoUrl || '';
  const productImg = product?.imageUrl || '';
  const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="#e2e8f0"/><rect x="120" y="120" width="560" height="560" rx="24" fill="#cbd5f5"/></svg>'
  )}`;
  const safePhoto = photo || fallbackImage;
  const safeProductImg = productImg || fallbackImage;
  const checkoutUrl = product?.isExternal && product?.externalUrl ? product.externalUrl : '#';
  console.log('[postProcessGeneratedHTML] v2.3', { sections: sections.length, productImg: Boolean(productImg) });

  const normalizeContrastForLightBackground = (html: string) => {
    if (!html || typeof DOMParser === 'undefined') return html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const section = doc.body.querySelector('section');
      const lightBgRoots = ['bg-white', 'bg-slate-50', 'bg-slate-100', 'bg-gray-50', 'bg-gray-100', 'bg-zinc-50', 'bg-neutral-50'];
      const isLightBgClass = (c: string) => lightBgRoots.some((root) => c === root || c.startsWith(`${root}/`));
      const isTranslucentDarkOnLight =
        options?.backgroundColor !== 'dark' &&
        ((section?.getAttribute('class') || '').includes('bg-slate-900/40') ||
          (section?.getAttribute('class') || '').includes('bg-slate-900/30') ||
          (section?.getAttribute('class') || '').includes('bg-slate-900/20'));

      const elements = Array.from(doc.querySelectorAll<HTMLElement>('*'));
      const lightBgEls = elements.filter((el) => {
        const cls = (el.getAttribute('class') || '').split(/\s+/);
        return cls.some(isLightBgClass);
      });
      const hasLightBg =
        lightBgEls.length > 0 ||
        (section ? (section.getAttribute('class') || '').split(/\s+/).some(isLightBgClass) : false) ||
        isTranslucentDarkOnLight;
      if (!hasLightBg) return html;

      const replaceLightText = (cls: string) => {
        let fixed = cls;
        fixed = fixed.replace(/\btext-white\b/g, 'text-slate-900');
        fixed = fixed.replace(/\btext-slate-100\b/g, 'text-slate-900');
        fixed = fixed.replace(/\btext-slate-200\b/g, 'text-slate-800');
        fixed = fixed.replace(/\btext-slate-300\b/g, 'text-slate-700');
        fixed = fixed.replace(/\btext-slate-400\b/g, 'text-slate-600');
        fixed = fixed.replace(/\btext-slate-500\b/g, 'text-slate-600');
        fixed = fixed.replace(/\btext-gray-100\b/g, 'text-gray-900');
        fixed = fixed.replace(/\btext-gray-200\b/g, 'text-gray-800');
        fixed = fixed.replace(/\btext-gray-300\b/g, 'text-gray-700');
        fixed = fixed.replace(/\btext-gray-400\b/g, 'text-gray-600');
        fixed = fixed.replace(/\btext-current\b/g, '');
        return fixed.trim().replace(/\s+/g, ' ');
      };

      const ensureDarkText = (el: HTMLElement) => {
        const cls = (el.getAttribute('class') || '').trim();
        let fixed = replaceLightText(cls);
        const hasTextClass = /\btext-[a-z0-9\-\[\]\/]+\b/.test(fixed);
        if (!hasTextClass) fixed = `${fixed} text-slate-900`.trim();
        if (fixed !== cls) el.setAttribute('class', fixed);
      };

      // If section itself is light, force dark text at section level.
      if (section) {
        const cls = (section.getAttribute('class') || '').split(/\s+/);
        if (cls.some(isLightBgClass) || isTranslucentDarkOnLight) ensureDarkText(section);
      }

      // For each light background wrapper, enforce dark text on wrapper and its descendants.
      lightBgEls.forEach((el) => {
        ensureDarkText(el);
        const descendants = Array.from(el.querySelectorAll<HTMLElement>('*'));
        descendants.forEach((child) => {
          const childCls = child.getAttribute('class') || '';
          const fixed = replaceLightText(childCls);
          if (fixed !== childCls) child.setAttribute('class', fixed);
        });
      });

      return section?.outerHTML || doc.body.innerHTML || html;
    } catch {
      return html;
    }
  };

  return sections.map(section => {
    let content = section.content || '';
    const hasEscapedHtml = /&lt;[a-zA-Z]/.test(content) && /&gt;/.test(content);
    if (hasEscapedHtml) {
      content = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
    }
    content = content.replace(/__EXPERT_LOGO__/g, logo)
      .replace(/__EXPERT_PHOTO__/g, safePhoto)
      .replace(/__PRODUCT_IMAGE__/g, safeProductImg)
      .replace(/__CHECKOUT_URL__/g, checkoutUrl)
      .replace(/__PRODUCT_NAME__/g, product.name)
      .replace(/__PRODUCT_PRICE__/g, product.price)
      .replace(/__EXPERT_NAME__/g, producer.name);

    // Fix quotes escaped as literal text inside HTML attributes
    content = content.replace(/"alt="([^"]+)"/g, 'alt="$1"');
    content = content.replace(/"style="([^"]+)"/g, 'style="$1"');

    // Repair missing "<" before img tags
    content = content.replace(/(^|[^\w<])img\s+src=/gi, '$1<img src=');
    // Repair duplicated or nested "img src=" inside src attribute
    content = content.replace(/<img\s+src=["']\s*<img\s+src=["']?/gi, '<img src="');
    content = content.replace(/<img\s+src=["']\s*img\s+src=["']([^"']+)["']?/gi, '<img src="$1"');
    content = content.replace(/<img\s+src=["']\s*img\s+src=([^"'>\s]+)["']?/gi, '<img src="$1"');
    content = content.replace(/src=["']\s*<img\s+src=["']/gi, 'src="');
    content = content.replace(/src=["']\s*img\s+src=["']([^"']+)["']\s*["']/gi, 'src="$1"');
    content = content.replace(/src=["']\s*img\s+src=([^"'>\s]+)["']?/gi, 'src="$1"');

    // Repair stray alt/style blocks without an <img> tag
    if (productImg) {
      content = content.replace(/(^|[^<])\s*"?alt="([^"]+)"\s*style="([^"]+)"[^>]*>/gi, `$1<img src="${productImg}" alt="$2" style="$3" />`);
      content = content.replace(/(^|[^<])\s*"?alt="([^"]+)"[^>]*>/gi, `$1<img src="${productImg}" alt="$2" />`);
    }

    // Remove orphaned alt fragments rendered as text
    content = content.replace(/(^|[^<])["']\s*alt="[^"]*"\s*\/?>/gi, '$1');

    // Normalize broken src attributes inside <img> tags
    content = content.replace(/<img\b[^>]*>/gi, (tag) => {
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) return tag;
      let src = srcMatch[1];

      const dataMatch = src.match(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/);
      if (dataMatch) {
        src = dataMatch[0];
      } else {
        const nestedMatch = src.match(/<img\s+src=["']?([^"'>\s]+)["']?/i);
        if (nestedMatch) src = nestedMatch[1];
        src = src.replace(/^<img\s+src=["']?/i, '').replace(/^img\s+src=["']?/i, '');
      }

      return tag.replace(/src=["'][^"']*["']/i, `src="${src}"`);
    });

    // If the model returns a bare data URL as text, wrap it in an image tag.
    // Avoid touching data URLs inside tags/attributes or style/script blocks.
    if (section.type !== 'author') {
      content = content.replace(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/g, (match, offset, full) => {
        const before = full.slice(0, offset);
        const lastOpen = before.lastIndexOf('<');
        const lastClose = before.lastIndexOf('>');
        if (lastOpen > lastClose) return match;
        const lastStyleOpen = before.lastIndexOf('<style');
        const lastStyleClose = before.lastIndexOf('</style');
        if (lastStyleOpen > lastStyleClose) return match;
        const lastScriptOpen = before.lastIndexOf('<script');
        const lastScriptClose = before.lastIndexOf('</script');
        if (lastScriptOpen > lastScriptClose) return match;
        return `<img src="${match}" alt="Imagem do produto" />`;
      });
    }

    // Replace empty image sources with a safe placeholder.
    content = content.replace(/<img([^>]*?)\ssrc=["']\s*["']([^>]*?)>/gi, `<img$1 src="${fallbackImage}"$2>`);

    // Replace any remaining placeholders to avoid broken images.
    content = content.replace(/__EXPERT_PHOTO__/g, safePhoto);
    content = content.replace(/__PRODUCT_IMAGE__/g, safeProductImg);

    // Remove empty or unresolved logo tags to avoid broken layout blocks.
    if (!logo) {
      content = content.replace(/<img[^>]*src=["']\s*(__EXPERT_LOGO__)?\s*["'][^>]*alt=["']?Logo["']?[^>]*>/gi, '');
      content = content.replace(/<img[^>]*alt=["']?Logo["']?[^>]*src=["']\s*(__EXPERT_LOGO__)?\s*["'][^>]*>/gi, '');
      content = content.replace(/<img[^>]*src=["']\s*["'][^>]*class=["'][^"']*logo[^"']*["'][^>]*>/gi, '');
    }

    // Remove any remaining unresolved logo placeholders.
    content = content.replace(/__EXPERT_LOGO__/g, '');

    if (section.type === 'author') {
      const allowFreeAuthor = options?.authorLayoutMode === 'free';
      if (!allowFreeAuthor) {
        content = forceAuthorSectionLayout(content, producer);
        let firstAuthorImgSeen = false;
        content = content.replace(/<img\b[^>]*>/gi, (tag) => {
          const altMatch = tag.match(/alt=["']([^"']+)["']/i);
          const alt = (altMatch?.[1] || '').toLowerCase();
          const isAuthorImg = alt.includes('especialista') || alt.includes('autor') || alt.includes('expert');
          if (!isAuthorImg) return '';
          if (firstAuthorImgSeen) return '';
          firstAuthorImgSeen = true;
          const required = ['w-full', 'max-w-[260px]', 'h-[260px]', 'rounded-full', 'object-cover', 'shadow-md'];
          if (/class=/.test(tag)) {
            return tag.replace(/class=["']([^"']*)["']/, (_, cls) => {
              const merged = new Set(cls.split(/\s+/).filter(Boolean));
              required.forEach((c) => merged.add(c));
              return `class="${Array.from(merged).join(' ')}"`;
            });
          }
          return tag.replace(/<img\b/, `<img class="${required.join(' ')}"`);
        });

        if (!firstAuthorImgSeen) {
          const safeAuthorImg = `<img class="w-full max-w-[260px] h-[260px] rounded-full object-cover shadow-md" src="${safePhoto}" alt="Foto do especialista" />`;
          content = content.replace(/(<div[^>]*class=["'][^"']*shrink-0[^"']*["'][^>]*>)/i, `$1${safeAuthorImg}`);
          if (!/Foto do especialista/i.test(content)) {
            content = content.replace(/(<div[^>]*class=["'][^"']*lg:justify-start[^"']*["'][^>]*>)/i, `$1${safeAuthorImg}`);
          }
        }
      }

      // Ensure author image is visible (remove hidden) and properly styled.
      if (typeof DOMParser !== 'undefined') {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const sectionEl = doc.body.querySelector('section');
          if (sectionEl) {
            const imgs = Array.from(sectionEl.querySelectorAll<HTMLImageElement>('img'));
            imgs.forEach((img) => {
              const cls = (img.getAttribute('class') || '').split(/\s+/).filter(Boolean);
              const withoutHidden = cls.filter((c) => c !== 'hidden');
              const hasDisplay = withoutHidden.some((c) => c === 'block' || c === 'inline-block' || c === 'flex');
              if (!hasDisplay) withoutHidden.push('block');
              const required = ['w-full', 'max-w-[260px]', 'h-[260px]', 'rounded-full', 'object-cover', 'shadow-md'];
              required.forEach((c) => {
                if (!withoutHidden.includes(c)) withoutHidden.push(c);
              });
              img.setAttribute('class', withoutHidden.join(' '));
              if (!img.getAttribute('alt')) img.setAttribute('alt', 'Foto do especialista');
            });
            content = sectionEl.outerHTML || content;
          }
        } catch {
          // no-op
        }
      }
    }

    if (section.type !== 'author' && section.type !== 'proof' && section.type !== 'offer') {
      content = stripCardWrapperInSection(content);
    }

    // Ensure HERO always has a product image visible.
    if (section.type === 'hero' && typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const sectionEl = doc.body.querySelector('section');
        const hasImg = !!sectionEl?.querySelector('img');
        if (sectionEl && !hasImg) {
          const grid = sectionEl.querySelector('[class*="grid"]');
          const wrapper = grid || sectionEl.querySelector('div');
          if (wrapper) {
            const imgWrap = doc.createElement('div');
            imgWrap.setAttribute('class', 'flex justify-center lg:justify-end');
            imgWrap.innerHTML = `<img src="${safeProductImg}" alt="Imagem do produto" class="w-full max-w-md rounded-2xl shadow-2xl" />`;
            wrapper.appendChild(imgWrap);
            content = sectionEl.outerHTML || content;
          }
        }
        if (sectionEl) {
          const imgs = Array.from(sectionEl.querySelectorAll<HTMLImageElement>('img'));
          imgs.forEach((img) => {
            const cls = (img.getAttribute('class') || '').split(/\s+/).filter(Boolean);
            const withoutHidden = cls.filter((c) => c !== 'hidden');
            const hasDisplay = withoutHidden.some((c) => c === 'block' || c === 'inline-block' || c === 'flex');
            if (!hasDisplay) withoutHidden.push('block');
            const required = ['w-full', 'h-full', 'object-cover'];
            required.forEach((c) => {
              if (!withoutHidden.includes(c)) withoutHidden.push(c);
            });
            img.setAttribute('class', withoutHidden.join(' '));
            if (!img.getAttribute('alt')) img.setAttribute('alt', 'Imagem do produto');
          });
          content = sectionEl.outerHTML || content;
        }
      } catch {
        // no-op
      }
    }

    content = normalizeContrastForLightBackground(content);

    // Force external checkout links to open in a new tab.
    if (checkoutUrl && checkoutUrl !== '#') {
      const checkoutEscaped = checkoutUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const checkoutLinkRegex = new RegExp(`<a([^>]*?)href=["']${checkoutEscaped}["']([^>]*?)>`, 'gi');
      content = content.replace(checkoutLinkRegex, (match, pre, post) => {
        const hasTarget = /target=/.test(match);
        const hasRel = /rel=/.test(match);
        let attrs = `${pre}href="${checkoutUrl}"${post}`;
        if (!hasTarget) attrs += ' target="_blank"';
        if (!hasRel) attrs += ' rel="noopener noreferrer"';
        return `<a${attrs}>`;
      });
    }

    return { ...section, content };
  });
};

/**
 * GERAÇÃO DE LANDING PAGE
 * Utiliza o modelo Pro com thinkingBudget para criar copy persuasiva e estrutura HTML Tailwind.
 */
export const generateLandingPage = async (options: GenerationOptions, producer: Producer, product: ProductInfo): Promise<Section[]> => {
  const ai = createGenAiClient();
  const premiumProfile = () => {
    if (options.tone === 'Friendly') {
      return {
        name: 'Warm / Organic',
        anchor: 'Blocos arredondados com destaque orgânico e badges suaves',
        fonts: "Display: 'Fraunces', serif. Corpo: 'Manrope', sans-serif.",
        motion: 'Transições suaves e leves no hero.'
      };
    }
    if (options.tone === 'Technical' || options.tone === 'Urgent') {
      return {
        name: 'Modern / Contrast',
        anchor: 'Tipografia forte com contraste alto e divisores precisos',
        fonts: "Display: 'Sora', sans-serif. Corpo: 'Manrope', sans-serif.",
        motion: 'Entrada rápida no hero e hover nítido no CTA.'
      };
    }
    return {
      name: 'Editorial / Magazine',
      anchor: 'Headline em bloco editorial com divisor forte',
      fonts: "Display: 'Fraunces', serif. Corpo: 'Manrope', sans-serif.",
      motion: 'Entrada sutil no hero e hover discreto no CTA.'
    };
  };
  const nicheKey = (options.designSystem?.nichePreset || options.designSystem?.segment || '')
    .toString()
    .toLowerCase();
  const nicheProfile =
    nicheKey.includes('artesanato') || nicheKey.includes('craft')
      ? {
          name: 'Playful / Handmade',
          anchor: 'Badges e selos visuais, cards arredondados e sensação artesanal',
          fonts: "Display: 'Baloo 2', sans-serif. Corpo: 'Nunito', sans-serif.",
          motion: 'Hover leve com micro-escala; sem ruído visual.'
        }
      : nicheKey.includes('saude') || nicheKey.includes('saúde') || nicheKey.includes('mental')
        ? {
            name: 'Calm / Trust',
            anchor: 'Respiro amplo, contraste suave e hierarquia limpa',
            fonts: "Display: 'Sora', sans-serif. Corpo: 'Manrope', sans-serif.",
            motion: 'Transições discretas e estáveis.'
          }
        : null;

  const aestheticProfile =
    nicheProfile ||
    (options.visualPreset === 'agency-premium'
      ? premiumProfile()
      : {
          name: 'Minimal / Direct',
          anchor: 'CTA central com hierarquia limpa e foco em clareza',
          fonts: "Display: 'Playfair Display', serif. Corpo: 'Work Sans', sans-serif.",
          motion: 'Sem animações decorativas; apenas hover no CTA.'
        });
  const scaleGuide =
    options.visualScale === 'compact'
      ? 'Escala compacta: títulos menores, espaçamentos mais densos.'
      : options.visualScale === 'large'
        ? 'Escala ampla: títulos grandes e espaçamento generoso.'
        : 'Escala equilibrada: bom respiro e legibilidade.';

  const colorGuide = `Cores: use a primária ${options.primaryColor} como dominante e a cor de destaque ${options.secondaryColor} apenas para CTA e badges.`;
  const systemInstruction = `Você é um Web Designer e Copywriter Brasileiro de Elite.
REQUISITO: Gere uma Landing Page profissional em Português do Brasil (PT-BR).
GRAMÁTICA: Use ortografia brasileira impecável. PROIBIDO o uso de palavras como "feature", "sales", "layout" ou qualquer termo em inglês no conteúdo final.
HTML: Use Tailwind CSS. Entregue apenas o HTML interno de cada seção (sem <section>, sem <html>, sem <body>).
ESTRUTURA: O HTML gerado será inserido dentro de um container centralizado. Use grid e flexbox para layouts internos.
PLACEHOLDERS: Use __PRODUCT_IMAGE__, __EXPERT_PHOTO__, __EXPERT_LOGO__, __CHECKOUT_URL__.
AUTOR: Informações do autor só podem aparecer na seção "Autor/Especialista". Não cite bio do autor nem use __EXPERT_PHOTO__/__EXPERT_LOGO__ em outras seções.
DESIGN: Direção estética obrigatória: ${aestheticProfile.name}. Âncora visual: ${aestheticProfile.anchor}. Tipografia sugerida: ${aestheticProfile.fonts}. ${scaleGuide} ${colorGuide}
CONSISTÊNCIA: mantenha a mesma escala tipográfica e espaçamento vertical entre seções. Não altere a estrutura das seções fora do plano.
ESCOPO: Gere APENAS a seção atual. Ignore qualquer pedido de criar a página inteira ou outras seções.
RETORNO: JSON com { content }.`;

  const themePreset = options.backgroundColor === 'dark'
    ? 'Tema escuro: fundo azul-noite, texto claro, CTA em verde/azul vibrante.'
    : options.backgroundColor === 'neutral'
      ? 'Tema neutro: fundo branco, texto escuro, CTA índigo.'
      : 'Tema claro: fundo cinza suave, texto escuro, CTA azul.';

  const fallbackMechanism = product.uniqueMechanism || 'Método prático e validado, com aplicação simples no dia a dia.';
  const fallbackProof = product.proofStats || 'Resultados consistentes com alunos reais e avaliação positiva.';
  const anchorText = product.anchorPrice || product.anchorSavings
    ? `Ancoragem: preço cheio ${product.anchorPrice || 'não informado'}; economia ${product.anchorSavings || 'não informada'}.`
    : '';

  const themeBase =
    options.backgroundColor === 'dark'
      ? { section: 'bg-slate-950 text-slate-100', sectionAlt: 'bg-slate-900/40 text-slate-100' }
      : options.backgroundColor === 'neutral'
        ? { section: 'bg-white text-slate-900', sectionAlt: 'bg-slate-50 text-slate-900' }
        : { section: 'bg-slate-50 text-slate-900', sectionAlt: 'bg-white text-slate-900' };

  const container = 'container mx-auto max-w-6xl px-6 lg:px-12';

  const sectionPlan = [
    {
      id: 'hero',
      title: 'Hero',
      bg: themeBase.section,
      padding: 'py-16 lg:py-24',
      containerClass: 'container mx-auto max-w-7xl px-6 lg:px-16',
      wrapClass: 'relative overflow-hidden',
      prompt: `Crie um hero forte com: título grande, subtítulo, CTA principal, microprova.
Use layout em duas colunas (grid assimétrico), com imagem à direita e texto à esquerda.
Inclua __PRODUCT_IMAGE__ em destaque com moldura arredondada, sombra forte e badge flutuante.
Inclua pequenos selos (garantia, acesso imediato) próximos ao CTA.`
    },
    {
      id: 'problem',
      title: 'Problema',
      bg: themeBase.sectionAlt,
      padding: 'py-14',
      prompt: `Crie uma seção de dores com 3 cards ou lista com ícones.
Use grid responsivo com cards de mesma altura.`
    },
    {
      id: 'benefits',
      title: 'Benefícios',
      bg: themeBase.section,
      padding: 'py-14',
      prompt: `Crie benefícios com variação visual: cards com ícones e um destaque maior (bento).
Inclua 4 a 6 benefícios claros.`
    },
    {
      id: 'highlight',
      title: 'Destaque',
      bg: themeBase.sectionAlt,
      padding: 'py-16',
      prompt: `Crie uma faixa de destaque com CTA.
Use um bloco central com fundo colorido suave e texto curto de impacto.`
    },
    {
      id: 'method',
      title: 'Método',
      bg: themeBase.sectionAlt,
      padding: 'py-14',
      prompt: `Crie a seção de método com passos numerados (3 ou 4 passos).
Use cards com número em círculo e título forte.
Inclua o mecanismo único: ${fallbackMechanism}.`
    },
    {
      id: 'proof',
      title: 'Prova Social',
      bg: themeBase.section,
      padding: 'py-14',
      prompt: `Crie depoimentos em cards com nomes e microdetalhes.
Inclua mini-avatar/ícone e variação de tamanho em 1 card.
Use prova concreta: ${fallbackProof}.`
    },
    {
      id: 'author',
      title: 'Autor/Especialista',
      bg: themeBase.sectionAlt,
      padding: 'py-14',
      prompt: `Crie uma seção "Sobre o autor" com foto e mini bio.
Use layout em 2 colunas no desktop (grid com lg:grid-cols-2) e 1 coluna no mobile.
Foto com tamanho fixo (ex: w-40 h-40), object-cover e borda arredondada.
Texto ao lado com título, autoridade e 2-3 bullets curtos.
Evite max-w-xs/sm e larguras fixas pequenas.
Use __EXPERT_PHOTO__ e __EXPERT_LOGO__ apenas aqui.
Inclua nome do expert e autoridade. Nao misture depoimentos nem oferta.
Use apenas UMA tag <img>. Nao gere <img> vazio, nem tags quebradas.`
    },
    {
      id: 'offer',
      title: 'Oferta',
      bg: themeBase.sectionAlt,
      padding: 'py-16',
      prompt: `Crie a seção de oferta com preço, ancoragem (${anchorText}), CTA e garantia.
Inclua lista do que o aluno recebe e selos de segurança.`
    },
    {
      id: 'faq',
      title: 'FAQ',
      bg: themeBase.section,
      padding: 'py-14',
      prompt: `Crie um FAQ com 4 a 6 perguntas e respostas.
Use cards ou accordion visual com boa hierarquia.`
    },
    {
      id: 'cta',
      title: 'CTA Final',
      bg: themeBase.sectionAlt,
      padding: 'py-16',
      prompt: `Crie um CTA final curto e direto com botão chamativo e reforço de urgência suave.`
    }
  ];

  const sanitizeSectionContent = (html: string) => {
    let content = (html || '').trim();
    content = content.replace(/<\/?section[^>]*>/gi, '');
    content = content.replace(/<\/?body[^>]*>/gi, '');
    content = content.replace(/<\/?html[^>]*>/gi, '');
    return content.trim();
  };

  const sections: Section[] = [];
  const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string) => {
    let timeoutId: number | null = null;
    const timeout = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(`Timeout ao gerar seção: ${label}`)), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  for (const section of sectionPlan) {
    const model = section.id === 'hero' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const thinkingBudget = section.id === 'hero' ? 1400 : 600;
    const authorRule = section.id === 'author'
      ? options.authorLayoutMode === 'free'
        ? 'Regra: Seção AUTOR livre. Inclua foto (__EXPERT_PHOTO__), nome, mini-bio e 3 bullets de credenciais. Pode variar layout (editorial, faixa, split) mantendo legibilidade. Não inclua depoimentos nem CTA de oferta.'
        : 'Regra: Use __EXPERT_PHOTO__ e __EXPERT_LOGO__ somente nesta seção. Não inclua depoimentos nem CTA de oferta aqui.'
      : 'Regra: Não cite bio do autor, não use __EXPERT_PHOTO__ nem __EXPERT_LOGO__ nesta seção.';
    const designSystemContext = buildDesignSystemContext(options, section.id);
    const freedomContext = buildFreedomContext(options);
    const briefContext = buildBusinessBrief(producer, product);
    const objectiveContext = getSectionObjective(section.id);
    let layoutContext = getSectionLayoutRule(section.id);
    if (section.id === 'author' && options.authorLayoutMode === 'free') {
      layoutContext = 'Layout: liberdade criativa para o autor; mantenha foto, nome, bio e bullets com boa hierarquia.';
    }

    const contents = `Produto: ${product.name}.
Tom: ${options.tone}.
Contexto (negócio): ${options.prompt}.
Ignore instruções de estrutura global e crie somente a seção atual.
${themePreset}
Direção estética: ${aestheticProfile.name}. Âncora visual: ${aestheticProfile.anchor}. ${aestheticProfile.fonts}
${scaleGuide} ${colorGuide}
${designSystemContext}
${freedomContext}
${briefContext}
${objectiveContext}
${layoutContext}
Seção: ${section.title}.
${section.prompt}
Expert: ${producer.name}. Autoridade: ${producer.authority || 'Não informado'}.
Oferta: ${product.description}. Preço: ${product.price}. Garantia: ${product.guaranteeDays || 7} dias.
Bônus: ${product.bonusDescription || 'Não informado'}.
${authorRule}
Regras: Retorne apenas o HTML interno da seção, sem <section> e sem container externo.
Inclua __CHECKOUT_URL__ para botões de ação quando fizer sentido.`;

    let response: any;
    try {
      response = await withTimeout(
        withRetry(
          () =>
            ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction,
                thinkingConfig: { thinkingBudget },
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: { content: { type: Type.STRING } },
                  required: ["content"]
                }
              }
            }),
          2,
          800
        ),
        90000,
        section.id
      );
    } catch (err: any) {
      const message = String(err?.message || '');
      const shouldFallback = section.id === 'hero' && (model === 'gemini-3-pro-preview');
      if (shouldFallback) {
        console.warn('[generateLandingPage] hero fallback to flash', err);
        response = await withTimeout(
          withRetry(
            () =>
              ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents,
                config: {
                  systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: { content: { type: Type.STRING } },
                    required: ["content"]
                  }
                }
              }),
            1,
            800
          ),
          60000,
          `${section.id}-fallback`
        );
      } else {
        throw err;
      }
    }

    let parsed: any = {};
    const rawText = response.text || '';
    try {
      parsed = JSON.parse(cleanJsonResponse(rawText || "{}"));
    } catch (err) {
      parsed = { content: rawText };
      console.warn('[generateLandingPage] JSON parse failed, using raw content', err);
    }
    let inner = sanitizeSectionContent(parsed?.content || '');
    if (section.id === 'author' && options.authorLayoutMode !== 'free') {
      inner = enforceAuthorSectionLayout(inner, producer);
    }
    const content = `
      <section class="lb-section ${section.bg} ${section.padding} ${section.wrapClass || ''}">
        <div class="${section.containerClass || container}">
          ${inner}
        </div>
      </section>
    `;
    sections.push({ id: `${section.id}-${Date.now()}`, type: section.id, content });
  }

  return postProcessGeneratedHTML(sections, producer, product, options);
};

export const hydrateSectionContent = (content: string, producer: Producer, product: ProductInfo): string => {
  const processed = postProcessGeneratedHTML(
    [{ id: `tmp-${Date.now()}`, type: 'custom', content }],
    producer,
    product
  );
  return processed[0]?.content || content;
};

export const regenerateSectionWithCRO = async (
  sectionType: string,
  options: GenerationOptions,
  expert: Producer,
  product: ProductInfo,
  currentHtml: string = ''
): Promise<string> => {
  const ai = createGenAiClient();
  const systemInstruction = `Você é um especialista em CRO e copywriting.
Reescreva apenas o HTML interno de UMA seção, sem <section>, sem <html>, sem <body>.
Use Tailwind CSS e mantenha legibilidade, contraste e hierarquia.`;

  const themePreset = options.backgroundColor === 'dark'
    ? 'Tema escuro: fundo azul-noite, texto claro, CTA em verde/azul vibrante.'
    : options.backgroundColor === 'neutral'
      ? 'Tema neutro: fundo branco, texto escuro, CTA índigo.'
      : 'Tema claro: fundo cinza suave, texto escuro, CTA azul.';

  const themeBase =
    options.backgroundColor === 'dark'
      ? { section: 'bg-slate-950 text-slate-100', sectionAlt: 'bg-slate-900/40 text-slate-100' }
      : options.backgroundColor === 'neutral'
        ? { section: 'bg-white text-slate-900', sectionAlt: 'bg-slate-50 text-slate-900' }
        : { section: 'bg-slate-50 text-slate-900', sectionAlt: 'bg-white text-slate-900' };

  const container = 'container mx-auto max-w-6xl px-6 lg:px-12';
  const normalizeSectionType = (value: string) => {
    const lowered = (value || '').toLowerCase().trim();
    if (/(hero|headline|above\s*the\s*fold|dobro\s*da\s*dobra|principal)/i.test(lowered)) {
      return 'hero';
    }
    if (/(autor|especialista|sobre\s*o?\s*autor|bio|biografia|about)/i.test(lowered)) {
      return 'author';
    }
    return lowered;
  };
  const type = normalizeSectionType(sectionType);
  const ensureAuthorLayout = (content: string) =>
    options.authorLayoutMode === 'free' ? content : enforceAuthorSectionLayout(content, expert);
  const designSystemContext = buildDesignSystemContext(options, type);
  const freedomContext = buildFreedomContext(options);
  const briefContext = buildBusinessBrief(expert, product);
  const objectiveContext = getSectionObjective(type);
  let layoutContext = getSectionLayoutRule(type);
  if (type === 'author' && options.authorLayoutMode === 'free') {
    layoutContext = 'Layout: liberdade criativa para o autor; mantenha foto, nome, bio e bullets com boa hierarquia.';
  }

  const authorPrompt =
    options.authorLayoutMode === 'free'
      ? `Crie seção Sobre o autor com liberdade visual (editorial/ faixa/ split).
Inclua foto (__EXPERT_PHOTO__), nome, mini-bio e 3 bullets de credenciais.
Use apenas UMA tag <img> e garanta contraste/legibilidade.`
      : `Crie seção Sobre o autor com grid 2 colunas.
Use __EXPERT_PHOTO__ com tamanho fixo (w-40 h-40) e texto ao lado.
Inclua 2-3 bullets com credenciais.
Use apenas UMA tag <img>. Nao gere <img> vazio, nem tags quebradas.`;

  const prompts: Record<string, { title: string; bg: string; padding: string; prompt: string }> = {
    hero: {
      title: 'Hero',
      bg: themeBase.section,
      padding: 'py-20',
      prompt: `Crie HERO acima da dobra com headline forte, subheadline, CTA e prova/benefício rápido.
Inclua área de visual do produto usando __PRODUCT_IMAGE__ (obrigatório).
Use layout 2 colunas no desktop e empilhado no mobile.
Evite listas longas; no máximo 3 bullets curtos.`
    },
    problem: {
      title: 'Problema',
      bg: themeBase.sectionAlt,
      padding: 'py-14',
      prompt: `Crie uma seção de dores com 3 cards (mesma altura).
Sem imagens grandes. Sem largura fixa pequena.`
    },
    benefits: {
      title: 'Benefícios',
      bg: themeBase.section,
      padding: 'py-14',
      prompt: `Crie benefícios com 4-6 cards e ícones pequenos.
Use grid responsivo e texto curto.`
    },
    method: {
      title: 'Método',
      bg: themeBase.sectionAlt,
      padding: 'py-14',
      prompt: `Crie passos numerados (3-4) com títulos curtos e descrição breve.`
    },
    proof: {
      title: 'Prova Social',
      bg: themeBase.section,
      padding: 'py-14',
      prompt: `Crie depoimentos em cards pequenos com nomes e cargos.
Proibido usar a foto grande do expert nesta seção.
Use mini avatar/ícone apenas.`
    },
    author: {
      title: 'Autor/Especialista',
      bg: themeBase.sectionAlt,
      padding: 'py-14',
      prompt: authorPrompt
    },
    offer: {
      title: 'Oferta',
      bg: themeBase.sectionAlt,
      padding: 'py-16',
      prompt: `Crie oferta com preço, CTA e garantia.
Inclua lista do que o aluno recebe.`
    },
    faq: {
      title: 'FAQ',
      bg: themeBase.section,
      padding: 'py-14',
      prompt: `Crie 4-6 perguntas com respostas curtas em cards.`
    }
  };

  const config = prompts[type] || prompts.benefits;

  const authorRule = type === 'author'
    ? options.authorLayoutMode === 'free'
      ? 'Regra: Seção AUTOR livre. Inclua foto (__EXPERT_PHOTO__), nome, mini-bio e 3 bullets de credenciais. Pode variar layout mantendo legibilidade. Não misture depoimentos nem oferta.'
      : 'Regra: Use __EXPERT_PHOTO__ e __EXPERT_LOGO__ apenas aqui. Não misture depoimentos nem oferta.'
    : 'Regra: Não cite bio do autor, não use __EXPERT_PHOTO__ nem __EXPERT_LOGO__ nesta seção.';

  const mode = options.regenMode || 'full';
  const modeRule = mode === 'copy'
    ? 'Modo TEXTO: preserve o layout geral; reescreva apenas o texto (títulos, parágrafos e bullets).'
    : mode === 'layout'
      ? 'Modo LAYOUT: preserve o texto original; reorganize apenas a estrutura e classes para melhorar a leitura.'
      : mode === 'style'
        ? 'Modo ESTILO: preserve texto e estrutura; ajuste apenas classes para harmonizar com o tema atual.'
        : 'Modo COMPLETO: reescreva texto e layout respeitando o tema.';

  const contents = `Produto: ${product.name}. Promessa: ${product.description}. Preço: ${product.price}.
Expert: ${expert.name}. Autoridade: ${expert.authority || 'Não informado'}.
${themePreset}
Seção: ${config.title}.
${config.prompt}
${authorRule}
${designSystemContext}
${freedomContext}
${briefContext}
${objectiveContext}
${layoutContext}
ESCOPO: Reescreva apenas esta seção. Ignore qualquer pedido de criar outras seções.
${modeRule}
HTML atual (referência para preservar quando necessário):
${currentHtml}
Use __CHECKOUT_URL__ para CTA quando fizer sentido.`;

  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { content: { type: Type.STRING } },
            required: ["content"]
          }
        }
      }),
    2,
    800
  );

  const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
  let inner = (parsed?.content || '').trim();
  inner = inner.replace(/<\/?section[^>]*>/gi, '');
  inner = inner.replace(/<\/?body[^>]*>/gi, '');
  inner = inner.replace(/<\/?html[^>]*>/gi, '');
  if (type === 'author') {
    inner = ensureAuthorLayout(inner);
  }
  if (type === 'hero' && !/__PRODUCT_IMAGE__/i.test(inner)) {
    inner = `
      <div class="grid gap-10 lg:grid-cols-2 items-center">
        <div>${inner}</div>
        <div class="flex justify-center lg:justify-end">
          <img src="__PRODUCT_IMAGE__" alt="Imagem do produto" class="w-full max-w-md rounded-2xl shadow-2xl"/>
        </div>
      </div>
    `;
  }

  const wrapped = `
    <section class="lb-section ${config.bg} ${config.padding}">
      <div class="${container}">
        ${inner}
      </div>
    </section>
  `;

  const processed = postProcessGeneratedHTML(
    [{ id: `${type}-${Date.now()}`, type, content: wrapped }],
    expert,
    product,
    options
  );

  return processed[0]?.content || wrapped;
};

/**
 * GERAÇÃO DE IMAGENS (ESTÚDIO)
 * Suporta referências reais (Inpainting/Image-to-Image) e prompts puros.
 */
export const generateStudioImage = async (
  base64: string | null,
  prompt: string,
  style: VisualStyle,
  ratio: ImageAspectRatio,
  quality: 'standard' | 'ultra',
  format: ImageExportFormat,
  qlt: number,
  preset: AssetPreset,
  strictRef: boolean = false,
  adCopy?: string,
  adType?: string
): Promise<{
  url: string;
  model: string;
  usedReference: boolean;
  fallbackUsed: boolean;
  fallbackReason?: ImageFallbackReason;
}> => {
  const isHighRes = quality === 'ultra';
  const primaryModel = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  const modelForRun = base64
    ? (isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image')
    : primaryModel;
  const ai = createGenAiClient();

  const mapRatio = (r: string): string => {
    const supported = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    if (r === "1.91:1") return "16:9";
    return supported.includes(r) ? r : "1:1";
  };

  const finalPrompt = base64
    ? `Main subject: The product in the reference image. ${
        strictRef
          ? 'STRICT: preserve exact shape, texture, colors, proportions, labels/logos, materials, and identity. Do NOT add, remove, alter, or embellish any part of the product. Do NOT add text, stickers, highlights, or attachments on the product. Do NOT occlude the product. Only the background and lighting around it may change.'
          : 'Use the reference as primary anchor; keep product identity highly consistent.'
      } Style: ${
        strictRef ? 'Neutral studio product photography' : `Professional ${style}`
      }. Context: ${prompt || 'Clean background, subtle props allowed but must not touch or cover the product.'} Preset: ${preset}. NO TEXT, NO TYPOGRAPHY, NO LETTERS.`
    : `Professional ${style} image. Subject: ${prompt}. Preset: ${preset}. Aspect Ratio: ${ratio}. High quality lighting. NO TEXT, NO TYPOGRAPHY, NO LETTERS.`;

  const buildContents = (useBase64: boolean): any => {
    const parts: any[] = [{ text: finalPrompt }];
    if (useBase64 && base64) {
      const mimeType = base64.split(';')[0].split(':')[1] || 'image/png';
      const data = base64.split(',')[1];
      parts.unshift({ inlineData: { data, mimeType } });
    }
    return [{ role: 'user', parts }];
  };

  const buildImageConfig = (modelName: string, useBase64: boolean, override?: Record<string, any>) => {
    const config: Record<string, any> = {};
    if (!useBase64) {
      config.aspectRatio = mapRatio(ratio);
    }
    if (modelName === 'gemini-3-pro-image-preview' && isHighRes) {
      config.imageSize = "2K";
    }
    if (override) {
      Object.assign(config, override);
    }
    return config;
  };

  const run = async (modelName: string, useBase64: boolean, overrideConfig?: Record<string, any>) => {
    const response = await withRetry(
      () =>
        ai.models.generateContent({
          model: modelName,
          contents: buildContents(useBase64),
          config: {
            ...buildImageConfig(modelName, useBase64, overrideConfig),
            responseModalities: [Modality.IMAGE]
          }
        }),
      2,
      800
    );
    const parts = response.candidates?.[0]?.content?.parts || [];
    const part = parts.find((p: any) => p?.inlineData);
    if (part?.inlineData) return `data:${format};base64,${part.inlineData.data}`;
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason) {
      throw new Error(`Falha ao gerar imagem (${modelName}): ${finishReason}.`);
    }
    throw new Error(`Falha ao gerar imagem (${modelName}).`);
  };

  try {
    const url = await run(modelForRun, !!base64);
    if (base64) {
      return { url, model: modelForRun, usedReference: true, fallbackUsed: false };
    }
    return { url, model: modelForRun, usedReference: false, fallbackUsed: false };
  } catch (err) {
    if (strictRef && base64) {
      throw err;
    }
    if (base64 && shouldFallbackImageModel(err)) {
      try {
        const url = await run(modelForRun, false);
        return {
          url,
          model: modelForRun,
          usedReference: false,
          fallbackUsed: true,
          fallbackReason: 'reference'
        };
      } catch (fallbackErr) {
        err = fallbackErr;
      }
    }

    if (!shouldFallbackImageModel(err)) throw err;

    const fallbackModel =
      modelForRun === 'gemini-3-pro-image-preview'
        ? 'gemini-2.5-flash-image'
        : 'gemini-3-pro-image-preview';
    const fallbackReason: ImageFallbackReason = isQuotaError(err) ? 'quota' : 'model';
    const overrideConfig =
      fallbackReason === 'quota' && fallbackModel === 'gemini-3-pro-image-preview'
        ? { imageSize: '1K' }
        : undefined;
    const url = await run(fallbackModel, false, overrideConfig);
    return {
      url,
      model: fallbackModel,
      usedReference: false,
      fallbackUsed: true,
      fallbackReason
    };
  }
};

/**
 * ANÁLISE DE PRODUTO EXTERNO
 * Usa Google Search para extrair inteligência de mercado de URLs de concorrentes.
 */
export const analyzeExternalProduct = async (url: string): Promise<any> => {
  const ai = createGenAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise as informações do produto nesta URL: ${url}. Extraia dados completos de oferta e persona.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          price: { type: Type.STRING },
          anchorPrice: { type: Type.STRING },
          anchorSavings: { type: Type.STRING },
          uniqueMechanism: { type: Type.STRING },
          proofStats: { type: Type.STRING },
          learningGoals: { type: Type.STRING },
          bonusDescription: { type: Type.STRING },
          scarcityText: { type: Type.STRING },
          guaranteeDays: { type: Type.NUMBER },
          testimonials: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          faq: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          },
          persona: {
            type: Type.OBJECT,
            properties: {
              niche: { type: Type.STRING },
              ageRange: { type: Type.STRING },
              gender: { type: Type.STRING },
              audience: { type: Type.STRING },
              pains: { type: Type.STRING },
              desires: { type: Type.STRING },
              objections: { type: Type.STRING }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

/**
 * GERAÇÃO DE PAUTA DE E-BOOK
 */
export const generateBookOutline = async (title: string, topic: string, author: string, product: ProductInfo, config?: EbookConfig): Promise<any> => {
  const ai = createGenAiClient();
  const persona = product?.persona;
  const mechanismText = product.uniqueMechanism ? `Mecanismo unico: ${product.uniqueMechanism}.` : '';
  const proofText = product.proofStats ? `Provas concretas: ${product.proofStats}.` : '';
  const objectionsText = persona?.objections ? `Objeções principais: ${persona.objections}.` : '';
  const typeText = config?.type === 'lead_magnet'
    ? 'Tipo: Isca digital. Conteúdo leve, foco em vitória rápida e valor imediato.'
    : 'Tipo: Produto principal. Conteúdo profundo, framework completo e autoridade.';
  const depthText = config?.depth === 'short'
    ? 'Profundidade: Curto (5-7 capítulos).'
    : config?.depth === 'deep'
      ? 'Profundidade: Profundo (10-14 capítulos).'
      : 'Profundidade: Médio (7-10 capítulos).';
  const ctaText = config?.ctaStyle === 'direct'
    ? 'CTA: direto para compra/ação.'
    : 'CTA: soft, ponte para a oferta.';
  const exerciseText = config?.exerciseFrequency === 'every_2'
    ? 'Exercícios: a cada 2 capítulos (intercalar).'
    : 'Exercícios: em todos os capítulos.';
  const introLimitText = 'Introdução: no máximo 1 página (~350-450 palavras).';
  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Crie um outline para um e-book chamado "${title}" sobre "${topic}".
Autor: ${author}. Produto: ${product.name}.
Persona: ${persona?.audience || 'Público geral'}; dores: ${persona?.pains || 'Não informado'}; desejos: ${persona?.desires || 'Não informado'}.
${mechanismText} ${proofText} ${objectionsText}
${typeText} ${depthText} ${ctaText} ${exerciseText} ${introLimitText}
Objetivo: conteúdo claro, prático e orientado a resultados.
Regras de alinhamento com o funil:
- Repita a promessa central do produto na introducao, em outras palavras.
- Se houver mecanismo unico, crie um capitulo dedicado ao metodo e a aplicacao pratica.
- Trate 1-2 objecoes comuns ao longo dos capitulos.
- Inclua um bloco de prova/autoridade quando houver provas concretas.
- Conclusao deve ter CTA alinhado ao tipo (soft ou direto).
Inclua capítulos com notas de conteúdo (hook, objetivo, passos e resumo).
Evite tabelas. Quando precisar comparar itens, use blocos de 3 linhas no formato:
Gatilho: ...
Reação: ...
Comportamento: ...
Inclua exercício somente quando a frequência pedir e marque exerciseRequired.
Evite jargões e frases vagas. Use linguagem simples e específica.
Não use itálico/ênfase com asteriscos ou underline. Não use blockquotes. Para falas, use aspas normais sem formatação.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              introduction: { type: Type.STRING },
              conclusion: { type: Type.STRING },
              coverPrompt: { type: Type.STRING },
              visualSettings: {
                type: Type.OBJECT,
                properties: {
                  fontFamily: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  accentColor: { type: Type.STRING }
                }
              },
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    content: { type: Type.STRING },
                    layout: { type: Type.STRING },
                    exerciseRequired: { type: Type.BOOLEAN }
                  },
                  required: ["title", "notes"]
                }
              }
            },
            required: ["title", "author", "introduction", "conclusion", "chapters", "coverPrompt", "visualSettings"]
          }
        }
      }),
    2,
    800
  );
  return JSON.parse(cleanJsonResponse(response.text));
};

/**
 * REDAÇÃO DE CAPÍTULO DE E-BOOK
 * Usa thinkingBudget para garantir que o conteúdo seja informativo e longo.
 */
export const generateChapterContent = async (bookTitle: string, chapter: any, expert: Producer, product: ProductInfo, config?: EbookConfig): Promise<string> => {
  const ai = createGenAiClient();
  const persona = product?.persona;
  const mechanismText = product.uniqueMechanism ? `Mecanismo unico: ${product.uniqueMechanism}.` : '';
  const proofText = product.proofStats ? `Provas concretas: ${product.proofStats}.` : '';
  const objectionsText = persona?.objections ? `Objecoes principais: ${persona.objections}.` : '';
  const typeText = config?.type === 'lead_magnet'
    ? 'Tipo: Isca digital. Foque em valor imediato e leitura leve.'
    : 'Tipo: Produto principal. Foque em profundidade e autoridade.';
  const depthText = config?.depth === 'short'
    ? 'Profundidade: curta (700-1000 palavras).'
    : config?.depth === 'deep'
      ? 'Profundidade: profunda (1600-2200 palavras).'
      : 'Profundidade: média (1100-1500 palavras).';
  const ctaText = config?.ctaStyle === 'direct' ? 'CTA: direto.' : 'CTA: soft.';
  const chapterIndex = typeof chapter?.chapterIndex === 'number' ? chapter.chapterIndex : null;
  const isIntro = typeof chapter?.title === 'string' && /introdu[cç][aã]o/i.test(chapter.title);
  const shouldIncludeExercise = typeof chapter?.exerciseRequired === 'boolean'
    ? chapter.exerciseRequired
    : config?.exerciseFrequency === 'every_1'
      ? true
      : chapterIndex !== null
        ? chapterIndex % 2 === 0
        : true;
  const exerciseRule = shouldIncludeExercise
    ? 'Inclua 1 exercício prático.'
    : 'Não inclua exercício prático neste capítulo.';
  const introLimitRule = isIntro ? 'Introdução: máximo de 450 palavras (≈1 página). Evite alongar.' : '';
  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Escreva o conteúdo completo do capítulo "${chapter.title}" do e-book "${bookTitle}".
Use o plano: ${chapter.notes || 'Hook, objetivo, passos práticos, exercício e resumo'}.
Expert: ${expert.name}. Autoridade: ${expert.authority || 'Não informado'}.
Produto: ${product.name}. Promessa: ${product.description}.
Persona: ${persona?.audience || 'Público geral'}; dores: ${persona?.pains || 'Não informado'}; desejos: ${persona?.desires || 'Não informado'}.
${mechanismText} ${proofText} ${objectionsText}
${typeText} ${depthText} ${ctaText}
Regras:
- Linguagem clara, específica e direta.
- Sem jargões vazios.
- Estruture com subtítulos (##), listas e passos numerados.
- ${exerciseRule}
- Termine com um resumo final com 3 bullets.
- ${introLimitRule}
- Use exemplos reais ou verossímeis.
- Não use itálico/ênfase com asteriscos ou underline. Não use blockquotes. Para falas, use aspas normais sem formatação.
- Evite tabelas. Prefira blocos de 3 linhas no formato Gatilho/Reação/Comportamento quando precisar listar exemplos.
- Não inclua frases do tipo "Aqui está o conteúdo" ou similares.
- Se o capitulo for sobre metodo, explique o mecanismo e como aplicar.`,
        config: { thinkingConfig: { thinkingBudget: 2500 } }
      }),
    2,
    800
  );
  return stripJsonNoise(response.text);
};

export const reviewChapterContent = async (
  bookTitle: string,
  chapterTitle: string,
  content: string,
  expert: Producer,
  product: ProductInfo,
  config?: EbookConfig,
  exerciseRequired: boolean = true
): Promise<string> => {
  if (!content || content.trim().length < 80) return content;
  const ai = createGenAiClient();
  const persona = product?.persona;
  const typeText = config?.type === 'lead_magnet'
    ? 'Tipo: Isca digital. Conteúdo leve e direto.'
    : 'Tipo: Produto principal. Conteúdo profundo e autoritativo.';
  const exerciseRule = exerciseRequired
    ? 'Preserve 1 exercício prático.'
    : 'Remova qualquer exercício prático se existir.';
  const introLimitRule = /introdu[cç][aã]o/i.test(chapterTitle)
    ? 'Introdução: máximo de 450 palavras (≈1 página). Enxugue sem perder a promessa.'
    : '';
  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Revise o capítulo "${chapterTitle}" do e-book "${bookTitle}".
Conteúdo atual:
${content}

Contexto:
Expert: ${expert.name}. Autoridade: ${expert.authority || 'Não informado'}.
Produto: ${product.name}. Promessa: ${product.description}.
Persona: ${persona?.audience || 'Público geral'}; dores: ${persona?.pains || 'Não informado'}; desejos: ${persona?.desires || 'Não informado'}.
${typeText}
${introLimitRule}

Regras de revisão:
- Mantenha o idioma PT-BR e a estrutura (subtítulos, listas, passos).
- Corte redundâncias e simplifique sem reduzir demais a densidade.
- Reforce benefícios práticos e exemplos verossímeis.
- ${exerciseRule} Mantenha um resumo final com 3 bullets.
- Remova itálico/ênfase com asteriscos ou underline. Remova blockquotes. Mantenha falas com aspas normais.
- Se houver tabela, transforme em blocos Gatilho/Reação/Comportamento.
- Evite jargões vazios e qualquer termo em inglês.
Retorne apenas o texto final, sem markdown extra ou comentários.`,
        config: { thinkingConfig: { thinkingBudget: 2200 } }
      }),
    2,
    800
  );
  return stripJsonNoise(response.text);
};

/**
 * GERAÇÃO DE ROTEIRO VSL
 */
export const generateVslScript = async (model: string, duration: string, expert: Producer, product: ProductInfo): Promise<any> => {
  const ai = createGenAiClient();
  const proofText = product.proofStats ? `Provas concretas: ${product.proofStats}.` : '';
  const mechanismText = product.uniqueMechanism ? `Mecanismo único: ${product.uniqueMechanism}.` : '';
  const anchorText = product.anchorPrice || product.anchorSavings
    ? `Ancoragem: preço cheio ${product.anchorPrice || 'não informado'}; economia ${product.anchorSavings || 'não informada'}.`
    : '';
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Gere um roteiro de VSL usando o modelo ${model} para o produto ${product.name}. ${mechanismText} ${anchorText} ${proofText}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

/**
 * SINTETIZAÇÃO DE VOZ (TTS)
 * Retorna dados PCM brutos (Raw PCM) que precisam de decodificação manual.
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = createGenAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const refineLandingPageContent = async (sections: Section[], instruction: string): Promise<Section[]> => {
  const ai = createGenAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Refine: "${instruction}" nas seções.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonResponse(response.text));
};

export const injectAssetIntoPage = async (type: 'ebook' | 'vsl', asset: any, expert: Producer, product: ProductInfo): Promise<Section> => {
  const ai = createGenAiClient();
  const ebookConfig = asset?.config as EbookConfig | undefined;
  const typeHint = ebookConfig?.type === 'lead_magnet'
    ? 'E-book do tipo isca digital, com CTA suave.'
    : ebookConfig?.type === 'principal'
      ? 'E-book como produto principal, com CTA direto.'
      : 'E-book com CTA equilibrado.';
  const mechanismText = product.uniqueMechanism ? `Mencione o metodo: ${product.uniqueMechanism}.` : '';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie seção HTML para promover ${type}: ${asset.title}. ${typeHint} ${mechanismText}
Inclua título forte, 2-3 bullets de benefício, prova curta e CTA alinhado ao tipo.
Use layout responsivo em duas colunas quando possível.`,
    config: { responseMimeType: "application/json" }
  });
  const section = JSON.parse(cleanJsonResponse(response.text));
  return postProcessGeneratedHTML([section], expert, product)[0];
};

export const generateCreativeCampaign = async (sections: Section[], expert: Producer, product: ProductInfo): Promise<any[]> => {
  const ai = createGenAiClient();
  const proofText = product.proofStats ? `Provas concretas: ${product.proofStats}.` : '';
  const mechanismText = product.uniqueMechanism ? `Mecanismo único: ${product.uniqueMechanism}.` : '';
  const anchorText = product.anchorPrice || product.anchorSavings
    ? `Ancoragem: preço cheio ${product.anchorPrice || 'não informado'}; economia ${product.anchorSavings || 'não informada'}.`
    : '';
  const contents = `Crie 3 anúncios para este funil. Produto: ${product.name}. Tom: ${expert.tone}.
  Variação 1 (Engajamento): conteúdo educativo e valor, sem preço. Use o mecanismo único para gerar curiosidade.
  Variação 2 (Autoridade): destaque provas concretas e resultados com credibilidade.
  Variação 3 (Conversão): destaque oferta e ancoragem de preço com CTA direto.
  RETORNO: para cada anúncio, preencha o campo "angle" com um destes valores: "engajamento" | "autoridade" | "conversao".
  Use linguagem clara, específica e orientada a benefício. Evite jargões e frases genéricas.
  Estrutura recomendada: Gancho -> Benefício -> Prova -> CTA.
  Expert: ${expert.name}. Autoridade: ${expert.authority || 'Não informado'}.
  Oferta: ${product.description}. Preço: ${product.price}. Garantia: ${product.guaranteeDays || 7} dias. Bônus: ${product.bonusDescription || 'Não informado'}.
  ${mechanismText} ${anchorText} ${proofText}`.trim();
  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          angle: { type: Type.STRING },
          adCopy: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          visualStyle: { type: Type.STRING }
        },
        required: ["type", "angle", "adCopy", "imagePrompt", "visualStyle"]
      }
    }
  };
  const models = ['gemini-3-flash-preview', 'gemini-3-pro-preview'];
  let lastError: any;
  for (const model of models) {
    try {
      const response = await withRetry(
        () => ai.models.generateContent({ model, contents, config }),
        2,
        700
      );
      try {
        return JSON.parse(cleanJsonResponse(response.text));
      } catch (parseErr: any) {
        throw new Error(`Falha ao interpretar resposta do modelo (${model}). Tente novamente.`);
      }
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err)) break;
    }
  }
  throw lastError;
};

export const generateMarketingIdeas = async (expert: Producer, product: ProductInfo): Promise<any[]> => {
  const ai = createGenAiClient();
  const persona = product?.persona;
  const contents = `Você é um estrategista de marketing. Gere 5 ideias de marketing altamente relevantes para este produto.
Produto: ${product.name}. Promessa: ${product.description}. Preço: ${product.price}.
Expert: ${expert.name}. Autoridade: ${expert.authority || 'Não informado'}.
Persona: ${persona?.audience || 'Público geral'}; dores: ${persona?.pains || 'Não informado'}; desejos: ${persona?.desires || 'Não informado'}.
Formato de saída: lista com {categoria, ideia, por_que_funciona, primeiros_passos}.`;

  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                categoria: { type: Type.STRING },
                ideia: { type: Type.STRING },
                por_que_funciona: { type: Type.STRING },
                primeiros_passos: { type: Type.STRING }
              },
              required: ["categoria", "ideia", "por_que_funciona", "primeiros_passos"]
            }
          }
        }
      }),
    2,
    800
  );
  return JSON.parse(cleanJsonResponse(response.text || "[]"));
};

export const generatePaidAdsPlan = async (
  expert: Producer,
  product: ProductInfo,
  objective: string,
  platform: string,
  budget: string
): Promise<any> => {
  const ai = createGenAiClient();
  const persona = product?.persona;
  const contents = `Crie um plano de campanha paga para ${platform}.
Objetivo: ${objective}. Orçamento: ${budget}.
Produto: ${product.name}. Promessa: ${product.description}. Preço: ${product.price}.
Expert: ${expert.name}. Autoridade: ${expert.authority || 'Não informado'}.
Persona: ${persona?.audience || 'Público geral'}; dores: ${persona?.pains || 'Não informado'}; desejos: ${persona?.desires || 'Não informado'}.
Inclua: estrutura de campanha, segmentações, criativos recomendados e métricas-alvo.`;

  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estrutura: { type: Type.STRING },
              segmentacao: { type: Type.STRING },
              criativos: { type: Type.STRING },
              metricas: { type: Type.STRING }
            },
            required: ["estrutura", "segmentacao", "criativos", "metricas"]
          }
        }
      }),
    2,
    800
  );
  return JSON.parse(cleanJsonResponse(response.text || "{}"));
};

const parsePaidCampaign = (text: string): PaidCampaignPlan => JSON.parse(cleanJsonResponse(text || "{}"));

export const generatePaidCampaignStrategy = async (
  expert: Producer,
  product: ProductInfo,
  input: PaidCampaignInput
): Promise<AiPlanResult> => {
  const ai = createGenAiClient();
  const persona = product?.persona;
  const assets = input.assets || { hasPv: false, hasEbook: false, hasProof: false };

  const contents = `
Você é um estrategista de marketing pago. Use a biblioteca "marketing-ideas" para sugerir ângulos e ações.
Gere um plano de campanha pago com foco em ${input.objective} usando ${input.channel}.

Produto: ${product.name}
Promessa: ${product.description}
Preço: ${product.price}
Mecanismo: ${input.mechanism || product.uniqueMechanism || 'Não informado'}
Expert: ${expert.name} (${expert.authority || 'Não informado'})

Persona: ${input.segment || persona?.audience || 'Público geral'}
Dores: ${input.pain || persona?.pains || 'Não informado'}
Desejos: ${persona?.desires || 'Não informado'}
Objeções: ${persona?.objections || 'Não informado'}

Ticket: ${input.ticket}
Tom: ${input.tone}
Orçamento: ${input.budget || 'Não informado'}
Canal secundário: ${input.secondaryChannel || 'Não informado'}
Métrica principal: ${input.primaryMetric || 'Não informado'}
Ativos disponíveis: PV=${assets.hasPv ? 'sim' : 'não'}, Ebook=${assets.hasEbook ? 'sim' : 'não'}, Provas=${assets.hasProof ? 'sim' : 'não'}

Regras:
- Inclua um passo de aquecimento (pre-targeting) se objetivo for aquecer/orgânico.
- Use linguagem clara e direta, orientada a conversão.
- Forneça 3-5 ângulos, 3-5 criativos, e 5-7 itens de checklist.
`;

  const generateWithGemini = async (): Promise<AiPlanResult> => {
    const response = await withRetry(
      () =>
        ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                funnel: {
                  type: Type.OBJECT,
                  properties: {
                    top: { type: Type.STRING },
                    middle: { type: Type.STRING },
                    bottom: { type: Type.STRING }
                  },
                  required: ["top", "middle", "bottom"]
                },
                angles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                creatives: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      format: { type: Type.STRING },
                      goal: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["format", "goal", "notes"]
                  }
                },
                copy: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                    cta: { type: Type.STRING }
                  },
                  required: ["headline", "body", "cta"]
                },
                checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["summary", "funnel", "angles", "creatives", "copy", "checklist", "nextSteps"]
            }
          }
        }),
      2,
      900
    );
    return { plan: parsePaidCampaign(response.text || "{}"), provider: 'Gemini' };
  };

  const generateWithOpenRouter = async (): Promise<AiPlanResult> => {
    const text = await fetchOpenRouterResponse(contents);
    return {
      plan: parsePaidCampaign(text),
      provider: 'OpenRouter',
      notice: 'Fallback ativado após quota do Gemini.'
    };
  };

  try {
    return await generateWithGemini();
  } catch (err) {
    if (shouldFallbackToOpenRouter(err)) {
      return await generateWithOpenRouter();
    }
    throw err;
  }
};

export const generateABVariation = async (sections: Section[], hypothesis: string, expert: Producer, product: ProductInfo): Promise<Section[]> => {
  const ai = createGenAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere variação baseada na hipótese: "${hypothesis}".`,
    config: { responseMimeType: "application/json" }
  });
  return postProcessGeneratedHTML(JSON.parse(cleanJsonResponse(response.text)), expert, product);
};

export const simulateHeatmap = async (sections: Section[]): Promise<Array<{ text: string, score: number, type: string }>> => {
  const ai = createGenAiClient();

  // Simplifica o HTML para reduzir tokens, enviando apenas texto e estrutura básica
  const simplifiedContent = sections.map(s => `[Section: ${s.type}] ${s.content.replace(/<[^>]+>/g, ' ').substring(0, 500)}...`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise este conteúdo de Landing Page e simule um Heatmap de Atenção (Eye-Tracking Prediction).
    Identifique os 5-10 elementos (textos, botões, imagens) que mais chamariam a atenção do usuário.
    Retorne um JSON: [{ "text": "trecho do texto ou descrição do elemento", "score": 0-100, "type": "headline|button|image|text" }]
    
    Conteúdo:
    ${simplifiedContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            score: { type: Type.NUMBER },
            type: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(cleanJsonResponse(response.text));
};

export const rewriteElementText = async (text: string, instruction: string): Promise<string> => {
  const ai = createGenAiClient();
  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Texto original: "${text}". Instrução: "${instruction}".`,
        config: {
          systemInstruction: "Reescreva apenas o texto solicitado em PT-BR. Retorne somente o texto final, sem aspas, sem markdown.",
        }
      }),
    2,
    600
  );
  return (response.text || '').trim();
};

export const generateSeoFromSections = async (sections: Section[], product: ProductInfo): Promise<SeoSettings> => {
  const ai = createGenAiClient();
  const text = sections
    .map(s => s.content.replace(/<[^>]+>/g, ' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);

  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere SEO para a landing page do produto "${product.name}". Conteúdo: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keywords: { type: Type.STRING }
            },
            required: ["title", "description", "keywords"]
          }
        }
      }),
    2,
    600
  );
  return JSON.parse(cleanJsonResponse(response.text || "{}"));
};
