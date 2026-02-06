## Kanban - Arsenal Completo de Criativos

### Objetivo
Transformar os diagnósticos e briefing em tarefas acionáveis para o squad (IA + frontend) até o arsenal atingir 5+ copies com 2+ prompts por copy, mais fallback “Gerar variações extras” e persistência de custom creatives.

### Tarefas
1. **Diagnóstico da resposta atual**
   - Capturar log JSON bruto do `generateCreativeCampaign`.
   - Registrar `responseStatus` (ex.: `complete`, `hitLimit`, `truncated`, `incomplete`).
   - Validar quantidade real de entradas e se o modelo obedecia às instruções (5 variações).
2. **Prompt & fallback IA**
   - Revisar prompt conforme `creative-briefing-for-ia.md` (hero + 4 variantes, word count, stage).
   - Criar fallback “Gerar variações extras” que solicita diretamente “retorne {missing} variações adicionais para o stage {stage}”.
   - Confirmar que a resposta inclui `visualPrompts` (mínimo 2 itens) e CTA por copy.
3. **UX para fallback & templates**
   - No painel, adicionar badge quando `variationCreatives.length < 5` com botão “Gerar variações extras”.
   - Permitir salvar kits visuais completos (hero + prompts) como templates ou exportá-los.
4. **Persistência de custom creatives**
   - Mapear `customCreatives` para `Project.options`/backend.
   - Garantir exportação/importação os recupere e sejam reaproveitáveis.
5. **Monitoramento & métricas**
   - Criar gráfico ou log no console indicando `wordCount` e `prompts` recebidos por copy.
   - Auditar quantas variações chegam completas por mês para justificar tier pago.

Use esses itens para atualizar o quadro Kanban (Notion/Trello) e acompanhar em reuniões. Deseja que eu gere cartões para cada item?  
