# Issue: Persistência e transparência da estratégia ativa

**Descrição:**  
Salvar `selectedStrategyId` e `builderNote` em `Project.options`, reaplicá-los ao abrir um projeto e mostrar no dashboard qual estratégia/nota e qual provider (Gemini/OpenRouter) geraram o plano atual.

**Critérios de aceitação:**
1. `handleSaveProject` grava os campos extras e `applyProject` os restaura automaticamente.
2. O dashboard informa qual estratégia está ativa e exibe a nota (se houver).
3. Ao carregar outro projeto, o sistema restaura a carta correta e o provider responsável pela versão.

**Skills envolvidas:** `production-code-audit`, `marketing-ideas`, `paid-ads`

**Observações:**  
Documentar o fluxo no `marketing-module-plan.md` e garantir que a persistência não quebre projetos antigos.
