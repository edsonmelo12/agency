# Skills por Módulo

Este documento define o mapeamento recomendado de skills por módulo para manter consistência e acelerar implementações.

## Gerador (Builder)
- **page-cro**: Layout, estrutura, hierarquia visual e otimização de conversão.
- **copywriting**: Headlines, CTAs, estrutura persuasiva e refinamento de copy.
- **ui-ux-pro-max** (opcional): Direção visual baseada em design system multi‑segmento (paleta, tipografia, efeitos, anti‑padrões).
**Quando NAO usar**: se o pedido for apenas bugfix ou refatoracao tecnica sem impacto em conversao/copys, siga o fluxo de engenharia padrao.

## Estúdio AI (Studio)
- **canvas-design**: Arte estática (posters, banners, peças visuais).
- **paid-ads**: Estratégia e variações de criativos para anúncios.
- **content-creator**: Legendas, textos de apoio e variações curtas.
**Quando NAO usar**: se a tarefa for ajuste de pipeline de imagem, integracoes ou performance do estúdio, prefira ajustes tecnicos no codigo.

## Analytics / SEO
- **programmatic-seo**: Páginas em escala e templates SEO.
- **content-creator**: Meta titles, descriptions e ajustes de SEO on-page.
- **page-cro**: Otimização de conversão baseada em métricas.
**Quando NAO usar**: se a solicitacao for apenas instrumentacao, tracking ou bugs de UI, trate como engenharia.

## VSL Studio
- **copywriting**: Roteiros, estrutura narrativa e CTAs.
**Quando NAO usar**: se o foco for ajuste de audio, TTS, ou sincronizacao, trate como engenharia.

## BookBuilder
- **content-creator**: Estrutura editorial, outlines e capítulos.
- **copywriting**: Ajustes de clareza e tom persuasivo.
- **page-cro** (opcional): quando o e-book estiver em destaque na PV e precisarmos otimizar a seção de conversão (headline, provas, CTA, hierarquia visual).
  - *Exemplo de aplicação*: “Reescrever a seção ‘Conheça o E-book’ com prova + CTA direto para aumentar conversão”.
**Quando NAO usar**: se a tarefa envolver apenas exportacao, formatacao ou render do e-book, trate como engenharia.

## Captura & Popups
- **form-cro**: Otimização de formulários (título, campos, microcopy, taxa de conversão).
- **popup-cro**: Otimização de popups/modais (gatilhos, oferta, timing, CTA).
**Quando NAO usar**: se for apenas ajuste técnico do modal ou bug de layout.
