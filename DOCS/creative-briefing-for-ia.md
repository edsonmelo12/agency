## Briefing para o time de IA — arsenal completo de criativos

### Objetivo
Conseguir que o `generateCreativeCampaign` entregue 5 variações (1 hero + 4 variantes) e para cada copy pelo menos 2 prompts visuais distintos alinhados ao stage do funil selecionado pelo usuário.

### Componentes do briefing
1. **Prompt consolidado**
   - Utilizar o template já documentado em `DOCS/marketing-module-creative-outputs-plan.md`.
   - Incluir instruções explícitas:
     * “Retorne exatamente 5 itens numerados (1 hero + 4 variantes).”
     * “Para cada item, entregue: `type`, `angle`, `headline`, `adCopy`, `cta`, `visualStyle`, `imagePrompt`.”
     * “Limite o corpo do anúncio a 70 palavras e destaque qual é hero (stage ativo).”
     * “Associe 2 prompts visuais por copy (metadado `visualPrompts`) com foco em storytelling e urgência.”
2. **Checklist de qualidade**
   - Confirmar se o retorno JSON está completo (5 entradas). Se retornar menos, retornar flag `responseStatus: 'incomplete'`.
   - Garantir que cada copy traga CTA e word count (máximo 70 palavras).  
   - Validar que `visualPrompts` seja um array com pelo menos 2 itens por copy (podemos colher do prompt de fallback).
3. **Fluxo de fallback**
   - Se `responseStatus` for `incomplete`, gerar chamada adicional com instrução “Faltam {n} variações adicionais focadas em {missingStages}”.
   - Os prompts extras seriam anexados ao `customCreatives` ou `variationCreatives`.

### Dados obrigatórios fornecidos ao modelo
* Estratégia ativa (`strategy.title`, `stage`, `objective`, `segments`, `tags`).  
* Plano do funil (`plan.funnel`, `plan.angles`).  
* Informação do builder (budget, CTA).  
* Meta do painel (ex.: “funil de venda direta” ou “lançamento”).  

### Métricas monitoradas
1. Quantidade de variações retornadas vs. prometidas (até 5).  
2. Word count por copy (≤70).  
3. Qualidade dos prompts (2+ variações).  

Com esse briefing, o time de IA pode ajustar o prompt/fallback antes de mexer no código cliente. Quer que eu integre esse doc ao Kanban como próxima tarefa para o squad?  
