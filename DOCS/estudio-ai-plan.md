# Plano de Melhoria — Módulo Estúdio AI

Data: 2026-01-28  
Responsável: Codex (análise técnica)  
Escopo: Estúdio AI (geração de imagens, sync de criativos, biblioteca de ativos)

## Objetivos
- Garantir consistência visual dos ativos por preset (aspect ratio correto).
- Organizar ativos por expert/oferta (biblioteca escalável).
- Reduzir fricção de uso (UX clara, erros explicativos).
- Melhorar performance e escalabilidade do acervo.
- Conectar estratégia/campanhas com geração de criativos.
- Elevar qualidade estética das artes (alinhado à skill `canvas-design`).
- Garantir alinhamento dos ativos com cada etapa do funil do app.

## Diretrizes UX/UI (via skills)
Notas:
- Skill `ui-ux-pro-max` exige geração de design system via script, porém o script não está disponível no ambiente.
- Abaixo aplico as diretrizes manualmente a partir do guia.

Princípios a aplicar:
- Acessibilidade: contraste 4.5:1, foco visível, labels claras, navegação por teclado.
- Interação: alvos de toque ≥ 44x44px, botões com estados de loading/desabilitado.
- Performance: lazy loading no grid, evitar layout shift.
- Layout: evitar scroll horizontal, z-index consistente, responsivo 375/768/1024/1440.
- Ícones: usar SVG consistente, evitar emoji.

Direção visual (skill `frontend-design`):
- Definir estética explícita do Estúdio (ex.: "editorial técnico" ou "laboratório criativo").
- Definir fonte display + fonte body (evitar Inter/Roboto).
- Paleta com 1 dominante + 1 acento + neutros.
- Um elemento memorável (ex.: cards com recortes diagonais ou “fitas” de preset).

## Alinhamento Funil x Estúdio AI
Objetivo: garantir que cada asset gerado tenha função clara no funil e que a estética siga uma filosofia visual consistente (skill `canvas-design`), com execução de nível editorial.

Mapa de ativos por etapa:
- Aquisição (Ads/Display/Meta/LinkedIn/TikTok): foco em impacto visual + rápida compreensão.
- Conversão (Landing Page): assets de confiança, consistência visual com LP.
- Ativação (E-book/Lead Magnet): capas editoriais e imagens que reforçam promessa.
- Conversão (VSL/Thumbnail): alta legibilidade, foco no rosto/benefício e contraste.
- Retenção (Conteúdo/Posts): versões consistentes para social e e-mail.

Regras de qualidade por etapa:
- Aquisição: contraste alto, composição simples, foco no produto.
- Conversão LP: estética alinhada ao layout e paleta do site.
- E-book: linguagem editorial e sistêmica (aura de “artefato”).
- VSL: legibilidade e narrativa visual clara.

## Plano por Fases — Canvas-Design + Funil
### Fase A — Diagnóstico Estético e Funil
Entregáveis:
- Lista de gaps visuais por preset/etapa do funil.
- Definição de “Funil Style Map” (estética por etapa).

Tarefas:
- Mapear presets atuais para etapas do funil.
- Auditar o “Canvas Editorial Story” (canvas) vs. filosofia visual.
- Identificar pontos de ruído: tipografia genérica, grid fraco, baixa resolução.

### Fase B — Filosofias Visuais por Etapa
Entregáveis:
- 3–5 filosofias visuais (MD) alinhadas ao funil.
- Guia rápido de paleta/tipografia/ritmo por etapa.

Tarefas:
- Adaptar `DOCS/estudio-ai-visual-philosophy.md` e `canvas_story_editorial.md`.
- Criar filosofia “editorial” para E-book e “impacto” para Ads.

### Fase C — Engine Canvas Editorial (Qualidade Mestre)
Entregáveis:
- Render em alta resolução com downscale.
- Grid editorial, texturas sutis, marcadores sistêmicos.
- Tipografia real via `canvas-fonts` e carregamento com `FontFace`.

Tarefas:
- Implementar canvas em 2x/3x com `imageSmoothingQuality="high"`.
- Definir grid/margens fixas e regras de hierarquia visual.
- Introduzir padrões repetitivos discretos (linhas, círculos, labels).

### Fase D — Prompts Contextuais e Regras de Preset
Entregáveis:
- Prompt enrichers por preset (funil + filosofia visual).
- Regras de compatibilidade com referência (modo estrito vs. livre).

Tarefas:
- Adicionar “prompt composer” por etapa.
- Incluir cláusulas de direção estética (sem texto na imagem).

### Fase E — QA Visual e Biblioteca
Entregáveis:
- Checklist visual por preset.
- Selo de qualidade/fallback no asset.

Tarefas:
- Guardar metadados de filosofia/etapa em `StudioImage`.
- Mostrar no painel informações de etapa/funil e estilo aplicado.

### Fase F — Integração com Campanhas e Performance
Entregáveis:
- Ideias de marketing viram presets e estilos.
- Vínculo automático com LP/E-book/VSL.

Tarefas:
- Gerar conceitos visuais com base em persona/objetivo do funil.
- Botão “Aplicar ao Estúdio” com preset/estilo/filosofia.

## Plano por Fases — Social Studio (Posts e Coleções)
### Fase S0 — Diagnóstico Social
Entregáveis:
- Mapa de formatos prioritários por plataforma (feed/story/reels/cover).
- Regras de safe area por canal.

Tarefas:
- Definir presets sociais (IG 1:1, 4:5, 9:16, TikTok 9:16, YT 16:9, LinkedIn 1.91:1).
- Inventariar necessidades de copy (headline/subhead/tag/CTA).

## Mapa de Presets e Safe Areas — Social Studio
Obs: safe areas em % do menor lado para facilitar padronização no canvas.

### Instagram
- Feed 1:1 (1080x1080): safe area 8% geral; texto principal até 70% da altura.
- Portrait 4:5 (1080x1350): safe area 8%; manter headline acima de 65% da altura.
- Story 9:16 (1080x1920): safe area 12% topo/baixo; evitar texto no topo/botões no rodapé.
- Reels Cover 9:16: igual ao Story, com foco central (safe area 15%).

### TikTok
- 9:16 (1080x1920): safe area 14% topo/baixo; foco central 70% da altura.

### YouTube
- Thumbnail 16:9 (1280x720): safe area 7%; texto curto, contraste alto.

### LinkedIn
- 1.91:1 (1200x628): safe area 8%; headline compacta à esquerda.

### Facebook
- Feed 1.91:1 (1200x628): safe area 8%.

### Regras de Texto (Social)
- Headline: 3–8 palavras, 1–3 linhas.
- Subhead: 1 linha curta (opcional).
- Tag: 1–2 palavras em caps.
- CTA: opcional e discreto.

## Mapeamento Filosofias x Presets
- Editorial Calm: IG 1:1, IG 4:5, LinkedIn 1.91:1.
- Impact Bold: TikTok 9:16, IG Story/Reels, YouTube 16:9.
- Tech Minimal: LinkedIn 1.91:1, YouTube 16:9, IG 1:1.

## Regras de Layout por Preset (Wireframes Textuais)
Obs: usar grid editorial com margens = safe area. Coordenadas em porcentagem.

### IG 1:1 (1080x1080)
- Zonas: topo 20% (tag), meio 55% (headline), base 25% (subhead/CTA).
- Headline centralizada, 1–2 linhas; tag no canto superior esquerdo.
- Elemento visual principal ocupa 45–60% do canvas.

### IG 4:5 (1080x1350)
- Zonas: topo 18% (tag), meio 55% (headline), base 27% (subhead).
- Headline alinhada à esquerda; bloco visual à direita.
- Ritmo vertical forte com respiros longos.

### IG Story / Reels (1080x1920)
- Zonas: topo 18% vazio; meio 64% conteúdo; base 18% vazio.
- Headline no terço médio, tag acima, subhead abaixo.
- Elemento visual principal central (foco seguro).

### TikTok 9:16 (1080x1920)
- Zonas: topo 20% vazio; meio 60% conteúdo; base 20% vazio.
- Headline em bloco central; usar contraste alto.

### YouTube 16:9 (1280x720)
- Zonas: esquerda 60% (headline + tag), direita 40% (visual).
- Headline grande e curta; tag acima, subhead mínima.

### LinkedIn 1.91:1 (1200x628)
- Zonas: esquerda 60% (headline), direita 40% (visual/selo).
- Tag pequena no topo esquerdo; subhead discreta no rodapé esquerdo.

### Facebook 1.91:1 (1200x628)
- Layout semelhante ao LinkedIn; foco em headline curta.

### Fase S1 — Filosofias Visuais para Social
Entregáveis:
- 3 filosofias visuais para social (ex.: Editorial Calm, Impact Bold, Tech Minimal).
- Paletas e tipografias recomendadas por filosofia.

Tarefas:
- Criar arquivos MD com direção estética e regras de composição.
- Mapear cada filosofia a 2–3 presets sociais.

### Fase S2 — Engine Social Canvas
Entregáveis:
- Motor de composição com grid, hierarquia e elementos sistêmicos.
- Render hi-res (2x/3x) com downscale.

Tarefas:
- Implementar grid editorial com margens/safe areas por preset.
- Camadas opcionais (tag, headline curta, subhead curta).
- Texturas sutis e padrões repetitivos discretos.

### Fase S3 — Modo Coleção (Carrossel)
Entregáveis:
- Geração de 3–6 variações consistentes (paleta + estilo fixos).
- Layouts alternados mantendo hierarquia.

Tarefas:
- Sistema de “collection variants” para carrossel.
- Troca de layout sem quebrar branding (mesmos tokens visuais).

### Fase S4 — Controles Rápidos e Export
Entregáveis:
- Toggles para “sem texto”, “texto minimal”, “alto contraste”.
- Export presets por canal (PNG/JPEG com compressão ideal).

Tarefas:
- Controles no StudioModule para presets sociais.
- Metadados em `StudioImage`: etapa, filosofia, plataforma.

## Design System Proposto (aplicado ao Estudio AI)
Nome da direcao: "Laboratorio Editorial"
Racional: mistura de rigor tecnico (controle e qualidade) com aura criativa (exploracao visual).

Tipografia:
- Display: "Bebas Neue" (titulos curtos, presets, badges)
- Body: "Source Sans 3" (leitura longa e controles)
- Escala: 12/14/16/20/28/36 (mobile-first)

Paleta (CSS vars):
- --color-ink: #0B0F14 (texto principal)
- --color-slate: #374151 (texto secundario)
- --color-paper: #F6F7FB (fundo claro)
- --color-panel: #FFFFFF (cards)
- --color-primary: #2563EB (acao principal)
- --color-accent: #F59E0B (destaques/alertas)
- --color-success: #10B981
- --color-danger: #EF4444
- --color-border: #E5E7EB

Texturas e destaque:
- Fundo com leve noise/grain (5-8% opacidade).
- Badges com "fita" diagonal para presets (elemento memoravel).
- Sombra unica e consistente (0 10px 30px rgba(15,23,42,0.12)).

Layout e espacamento:
- Ritmo 4/8/12/16/24/32/40.
- Sidebar com cards full-width; grid responsivo no acervo.
- Nao usar densidade excessiva em mobile.

Interacao e estados:
- Buttons com estados: default/hover/disabled/loading.
- Alvos de toque >= 44px.
- Focus ring visivel (2px, --color-primary).

Motion:
- Transicoes 180-240ms (opacity/transform).
- Um unico efeito de entrada no grid (stagger leve).

## Fase 0 — Diagnóstico (rápido)
Entregáveis:
- Lista final de gaps e prioridades.
- Decisão de escopo por sprint.

Tarefas:
- Validar fluxo de geração/armazenamento em `App.tsx`.
- Validar comportamento de ratio e formato em `services/geminiService.ts`.
- Validar render e ações de biblioteca em `components/StudioPanel.tsx`.
- Confirmar dependências do sidebar em `components/sidebar/StudioModule.tsx`.

## Fase 1 — Dados e Organização
Entregáveis:
- Ativos vinculados a expert/oferta.
- Filtros por oferta no Estúdio.

Tarefas:
- Adicionar `expertId` e `productId` em `StudioImage` (`types.ts`).
- Preencher esses campos no salvamento (`App.tsx`).
- Filtrar/segmentar assets no `StudioPanel` (por oferta atual).
- Ajustar migração leve: carregar imagens antigas sem vínculo (fallback).

## Fase 2 — Qualidade de Geração e Consistência Visual
Entregáveis:
- Preset com ratio garantido mesmo com imagem de referência.
- Formato de arquivo consistente e compatível.

Tarefas:
- Pós-processar (crop/contain) no client para atingir ratio (canvas).
- Persistir o resultado já no ratio desejado.
- Normalizar mime real do `data:` (evitar mismatch de `format`).
- Ajustar UI do botão principal (label conforme referência).

## Fase 3 — UX e Erros
Entregáveis:
- Mensagens de erro acionáveis.
- Fluxo de sync com validação de contexto.

Tarefas:
- Bloquear Sync se `activeExpert`/`activeProduct` estiverem ausentes.
- Mensagens claras para modo estrito sem referência.
- Indicar quando uso de fallback ocorreu (badge no asset).

## Fase 4 — Performance e Biblioteca
Entregáveis:
- Biblioteca escalável com paginação/virtualização.
- Melhor responsividade do grid.

Tarefas:
- Paginação simples (ex.: 50 itens por página) ou virtualização.
- Avaliar troca de data URL por Blob + `URL.createObjectURL`.
- Lazy load de imagens no grid.

## Fase 5 — Integração com Campanhas
Entregáveis:
- Ideias e plano pago gerando conceitos clicáveis para o Estúdio.

Tarefas:
- Transformar ideias de marketing em “conceitos” (prompt/estilo/preset).
- Converter plano de campanhas em sugestões por canal.
- Botão “Aplicar ao Estúdio” para preencher campos.

## Riscos e Observações
- Mudança no schema de `StudioImage` exige compatibilidade retroativa.
- Pós-processamento de ratio pode cortar conteúdo se não houver safe area.
- Conversão de formatos via canvas pode alterar qualidade.
- Fontes custom via canvas exigem carregamento assíncrono.

## Critérios de Aceite
- Ativos exibidos filtrados por oferta atual.
- Presets como Story (9:16) sempre saem em ratio correto.
- Assets gerados sem referência exibem label apropriado.
- Sync bloqueia corretamente sem contexto (mensagem clara).
- Biblioteca permanece responsiva com >500 assets.

## Checklist de Validação
- [ ] Gerar com e sem referência (standard/ultra).
- [ ] Verificar ratio final por preset.
- [ ] Exportar PNG/JPEG/WEBP e abrir em navegador.
- [ ] Sync de criativos sem expert/oferta.
- [ ] Navegação rápida no acervo com muitos itens.
