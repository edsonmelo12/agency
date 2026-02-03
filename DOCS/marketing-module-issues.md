# Templates de Issue — Módulo de Marketing

Use estes modelos para abrir tarefas diretas nos sistemas de rastreamento (GitHub, Linear, Notion). Substitua os marcadores com detalhes reais antes de criar.

## Issue: Refinar prompts do Planner/Criativos/Builder
**Skill:** copywriting
**Descrição:**
- Revisar os prompts definidos para cada agente e garantir exemplos claros de input/output em JSON.
- Validar mensagens de erro/regeneração/fallback exibidas no `MarketingWorkflowPanel`.
- Confirmar compliance com termos proibidos e tom da marca.

**Checklist:**
- [ ] Capturar 3 exemplos (oferta forte, remarketing e isca digital).
- [ ] Documentar a estrutura de resposta (objetivo, justificativa, criativos, checklist). 
- [ ] Validar mensagens exibidas no painel em casos de quota, erro e regeneração.
- [ ] Aprovar linguagem com o time de marca.

**Critério de aceite:** Documento atualizado em `DOCS/marketing-module-plan.md` e validação com revisão por pares.

---

## Issue: Refinar layout e interações do painel de marketing
**Skill:** frontend-design / ui-ux-pro-max
**Descrição:**
- Ajustar contraste dos cards, estados de loading/regeneração e hierarquia visual dos passos 0–4.
- Registrar microinterações (hover, foco, tooltips de indicadores) e garantir acessibilidade.
- Finalizar protótipo responsivo e aprovar com o time de design.

**Checklist:**
- [ ] Contraste e tipografia revisados.
- [ ] Estados de loading/regeneração definidos e aplicados.
- [ ] Microinterações documentadas.
- [ ] Protótipo responsivo validado no figma/story.

**Critério de aceite:** Design aprovado e documentado em `DOCS/marketing-module-kanban.md` e `marketing-module-checklists.md`.

---

## Issue: Validar regras técnicas do Builder e checklist de exportação
**Skill:** paid-ads
**Descrição:**
- Garantir que o `builderPlan` segue objetivos suportados pela Meta e documentar nomenclaturas padrão.
- Criar checklist final incluindo segmentos, orçamento, UTMs e logs de provider.
- Preparar exemplos de exportação/cópia para o Ads Manager.

**Checklist:**
- [ ] Confirmar objetivos válidos e segmentos padrão.
- [ ] Definir estrutura de checklist (objetivo, canais, UTMs, logs).
- [ ] Documentar formato de exportação para o Ads Manager.

**Critério de aceite:** Checklist publicado e validado com especialista em tráfego.

---

## Issue: Documentar biblioteca de criativos vencedores
**Skill:** marketing-ideas
**Descrição:**
- Mapear quais estilos (emocional, autoridade, direto) foram aprovados\n  e registrar tags nas variações geradas.
- Criar repositório interno de templates/estilos que alimenta prompts futuros.

**Checklist:**
- [ ] Registrar variações aprovadas com tags de estilo.
- [ ] Criar campo ou documento compartilhado com modelos vencedores.
- [ ] Atualizar `DOCS/marketing-module-skill-matrix.md` ou criar seção dedicada.

**Critério de aceite:** Biblioteca acessível à equipe com tags explicadas.

---

## Issue: Testes e monitoramento do módulo de marketing
**Skill:** production-code-audit
**Descrição:**
- Criar testes automatizados para parsing dos prompts, fallback de provider e persistência do builder.
- Planejar dashboard/alertas com métricas chave (tempo de geração, regeneração, fallback).

**Checklist:**
- [ ] Testar parsing JSON em cada prompt com casos válidos e inválidos.
- [ ] Registrar fallback e exibir log no painel.
- [ ] Garantir que `Project.options` salva `marketingPlan`, `paidCampaignInput` e `builderPlan`.
- [ ] Definir métricas e alertas no dashboard de monitoramento.

**Critério de aceite:** Testes rodando em CI e dashboard com alertas configurados.
