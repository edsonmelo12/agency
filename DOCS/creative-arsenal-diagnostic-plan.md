## Diagnóstico e próximos passos para arsenal completo de copies

### Contexto
Apesar das melhorias no prompt (1 hero + 4 variantes, limitador de 70 palavras, prompts múltiplos), a geração atual ainda retorna apenas duas copies. O objetivo é ter variações suficientes para testar e escalar os melhores criativos.

### Diagnóstico proposto
1. **Capturar resposta bruta da IA** — registrar o JSON retornado por `generateCreativeCampaign` no log (ou mock) para ver quantas entradas reais chegam. Pode ser necessário imprimir o `response.text` antes da normalização.
2. **Comparar com prompt enviado** — confirmar que o conteúdo enviado ao Gemini inclui o novo texto com “Teste #1... #4” e instruções de quantidade e stage.  
3. **Entender limitações do modelo** – avaliar se o modelo responde menos de 5 itens por limitação de tokens ou se o cliente corta a resposta ao obedecer o schema (talvez a resposta seja mais extensa e seja truncada).  
4. **Planejar fallback manual** – permitir um botão “Gerar variações extras” que pede explicitamente “retorne 2 copies adicionais focadas em CTA”, armazenando esses extras no arsenal.

### Pontos de discussão (skill `marketing-ideas`)
- Use a visão de testes da skill: hero + 3 variações já é o mínimo, mas o ideal é 5+ combos. Compare com a matriz de prompts para garantir cada variante tenha visão distinta (autoridade, urgência, curiosidade).
- Pode-se elaborar um plano de testes onde cada copy gera 2 prompts (promises earlier) para ter 10 combos e medir que copy/prompt performa melhor antes de escalar.

### Próximos passos sem implementação
1. Registrar no doc `marketing-module-creative-outputs-plan.md` um campo “status da resposta” com indicadores (ex.: `received 2/5`, `response truncated`).  
2. Preparar uma sessão de review com o time de IA para validar se os prompts estão sendo enviados com tamanhos adequados (talvez dividir em 2 chamadas).  
3. Deixar pronto o botão “Gerar variações extras” (promise), que poderia disparar a IA com `focus: missingVariants` e depois anexar os novos resultados ao arsenal.

Essa abordagem garante que, antes de implementar alterações grandes, entendemos o comportamento atual e temos um plano para completar o arsenal. Deseja que eu coordene esse diagnóstico com logs e instruções prontas pro time de IA?  
