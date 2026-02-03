# Próximos Passos Após MVP do Módulo de Marketing

Este documento resume as ações e skills necessárias que combinam com as sugestões anteriores, servindo como roteiro para o time (produto, IA, design, QA) antes de avançar para a implementação completa e QA.

## 1. Copywriting — Refinamento de prompts e mensagens
- Revisar e testar os prompts do Planner, Criativos e Builder para garantir que:
  - Os campos obrigatórios sejam preenchidos corretamente e retornem JSON sem ruído.
  - A linguagem utilitize a voz da marca e evite termos proibidos pela Meta.
  - As mensagens de erro/regeneração exibidas no `MarketingWorkflowPanel` explicam o que aconteceu e o que o usuário pode fazer.
- Documentar no mesmo arquivo exemplos de entradas/saídas para cada prompt.

## 1a. Copywriting — Sanitização de conteúdo
- Analisar o painel atual e garantir que informações repetidas (ex.: contexto duplicado, text overlaps) sejam eliminadas.
- Padronizar textos para evitar descrições redundantes e garantir que cada card (Passos 0–4) entregue insights únicos.

## 2. Frontend-design + ui-ux-pro-max — Validação visual e acessibilidade
- Revisar o layout do `MarketingWorkflowPanel`: contraste dos cards, hierarquia visual entre os passos, estados de loading e botões de ação.
- Mapear microinterações (hover, foco, loading) especialmente para os botões “Regenerar criativos” e ações do Builder (exportar/template/A-B).
- Garantir responsividade e acessibilidade (textos legíveis, foco via teclado, cores high-contrast).

## 3. Paid-ads — Validação técnica e checklist de exportação
- Conferir se o `builderPlan` gera segmentação/objetivos válidos no Meta Ads e documentar as regras (ex.: doar conversao somente com checkout ativo).
- Detalhar o checklist final com campos obrigatórios (objetivo, orçamento diário, UTMs, logs de provider) e como exportar/copiar para o Ads Manager.
- Avaliar se é necessário adaptar cenários específicos (remarketing, lookalike tops) e registrar no documento.

## 4. Production-code-audit — QA e monitoramento
- Criar testes automatizados para:
  - Parsing dos prompts (JSON válido com todos os campos esperados).
  - Fallback de provider (detectar quotas e registrar log + display no painel).
  - Persistência de `marketingPlan`, `paidCampaignInput`, `builderPlan` e `marketingPlanProvider` no `Project.options`.
- Planejar métricas e dashboards pós-lançamento (tempo médio de geração, taxa de regeneração, uso de fallback). Documentar alertas para problemas recorrentes.

## 5. Marketing-ideas — Biblioteca de estilos vencedores
- Registrar quais estilos (emocional, autoridade, direto) tiveram melhor aceitação durante os primeiros testes.
- Criar tags para os criativos gerados e armazenar as variantes aprovadas para alimentar futuros prompts.
- Garantir que o repositório de templates recoge insights do Builder e pode ser usado para recomendar variações automáticas.

## Extras
- Marcar no kanban/issue tracker (ex.: Notion, Trello) os responsáveis e prazos para cada ponto acima.
- Validar com o time de produto/design antes de abrir o módulo para QA e forneça os critérios de aceite.

Quando quiser, posso transformar essas etapas em tasks individuais (issue template) ou elaborar a pauta para a sessão de alinhamento. Deseja que eu faça isso? 
