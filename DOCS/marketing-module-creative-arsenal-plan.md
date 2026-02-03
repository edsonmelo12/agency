# Planejamento: Arsenal de Estratégias e Criativos do Módulo de Marketing

## Contexto
Com base no fluxo atual do `MarketingWorkflowPanel`, temos cards de estratégias sugeridas para topo/meio/fundo e uma sidebar que define o foco (ex. Venda direta). Mas o painel não deixa claro como a seleção impacta os criativos nem oferece um arsenal suficiente para testes. Precisamos alinhar a interface (cards, step cards) com as melhores práticas de campanhas patrocinadas, criando foco ativo e kit de testes.

## Objetivo
Garantir que a estratégia ativa (selecionada no sidebar ou no card) determine o tom, o nível de consciência e o conjunto principal de criativos, enquanto mantemos um arsenal rico de variações categorizadas por função (copy dominante, variações de prompt, testes de CTA). O fluxo deve servir como um gestor de tráfego experiente, explicando o que foi entregue à campanha e quais variações explorar.

## Fases do plano

### Fase 1 – Alinhar a definição de estratégia ativa
- Entrada: estratégia escolhida no sidebar (`Venda direta`, `Engajamento`, etc.) e card ativo selecionado. 
- Saída: badge/Bloco “Estratégia ativa” com título, objetivo, CTA sugerido, métricas e badge de stage. O stage determina o texto/mensagem e o statement “Lead em nível de consciência X”.
- Ações: sincronizar o filtro `stageFilter` com `selectedStrategyId`, destacar o card e mostrar resumo (headline + CTA + UTM). Documentar no painel qual é o foco principal versus variações secundárias.

### Fase 2 – Expandir o arsenal de criativos por card
- Criar payload de `strategy` para o gerador de criativos (stage, objective, tags, awarenessLevel). 
- Solicitar ao serviço 1 copy principal + 3–5 variações secundárias com prompts visuais distintos (prova, urgência, lifestyle), seguindo práticas de Short Form Video e Cross-Platform Retargeting. Cada variação traz: headline, corpo, CTA, visual style, prompt, métrica alvo.
- Mostrar esse arsenal no Step 2: um painel principal com copy hero e uma seção abaixo (“Variações de teste”) com cards/copy-lists. Botões rápidos para copiar CTA/prompt.

### Fase 3 – Orquestrar builder + checklist + exportação
- Garantir que o Builder (Passo 3) mostra os criativos correspondentes ao stage da estratégia ativa (ex.: se stage=Fundo, os cards Topo/Meio ainda aparecem mas com tag “variação”). Use `creativeIdeas` para mapear e exibir meta/CTA e marcar quais fazem parte do foco atual.
- Manter checklist, orçamento e simulações alinhados ao kit principal e às variações. Documentar no resumo final (Passo 4) quais variações foram sugeridas para testes.

### Fase 4 – Comunicação e documentação
- Atualizar doc de skills (marketing-workflow plan) com a nova dinâmica: cards sincronizados, arsenal de variações e badges de foco. 
- Incluir legendas/callouts no painel explicando “Card ativo = campanha principal” e “Variações = testes sugeridos por IA”.

## Métricas de sucesso
1. O card ativo mostra headline/CTA/dados que refletem o objetivo definido (ex: Flood of CTA em conversão). 
2. Cada card entrega 4+ variações que o usuário consegue copiar rapidamente. 
3. O Builder referencia explicitamente quais criativos estão sendo testados versus quais são foco. 
4. Usuário entende, sem sair da dashboard, qual a proposta enviada ao Ads Manager.

## Dependências
- Service de IA precisa aceitar metadata de `stage` e retornar variações. (Mockar temporariamente se necessário.)
- Tipagem `CreativeIdea` pode precisar de campos extras (`cta`, `awarenessLevel`).
- Comunicar ao backend ou ia? possivel script degrade.

## Próximos passos
1. Validar as novas propriedades esperadas do serviço de criativos ou mock local. 
2. Atualizar `components/MarketingWorkflowPanel.tsx` com nova UI e estado para arsenal. 
3. Ajustar `App.tsx` para passar `strategy` completo ao `fetchCreativeIdeas`. 
4. Rever `MarketingStrategyPanel` para incluir resumos dos kits de teste, se aplicável.

> Obs.: Esta proposta usou a skill `marketing-ideas` para embasar as recomendações de teste (Short Form Video, Retargeting, Copy para cada stage). As fases seguem o pedido de planejamento detalhado antes da implementação.
