# Findings iniciais para remodelagem

1. **CONTEXT.md dividido naturalmente**
   - Visão e regras de produto → `product.md` + `product-guidelines.md`.
   - IA (modelos Gemini/OpenRouter, env vars, fallback) e integrações → `tech-stack.md`.
   - Debug, smoke tests e processos operacionais → `workflow.md` e `workflow/code_styleguides/dev-env.md`.
   - Próximas iniciativas e roadmap → `tracks.md` e `tracks/<id>/plan.md`.
   - Checklists de execução local e segurança → `README.md`/`conductor/index.md` com atalhos claros.

2. **Padrão de skills recomendado**
   - Leitura inicial: `context-driven-development` com validação de artefatos.
   - Planejamento: `planning-with-files` para registrar o que foi pensado e descoberto.
   - Debug: `debugging-strategies` ou `debugger` conforme o tipo de erro.
   - UI e conteúdo: `frontend-design`, `copywriting` e `content-creator` para cada respects.

3. **Automação desejada**
   - Script `scripts/context-checklist.sh` reforça a leitura obrigatória antes de qualquer implementação.
   - `DOCS/context-workflow-checklist.md` descreve triggers, skills preferidas e a rotina de revisões.

4. **Medidas de controle de tokens**
   - Equacionar o uso de `progress.md` e `findings.md` para evitar recontextualizações repetidas.
   - Sempre apontar os prompts para os arquivos específicos em vez de reenviar o `CONTEXT.md` inteiro.
5. **Estúdio AI e integração de referência**
   - Ajustamos o prompt interno (`creativeGuidance`) para instruções mais claras sobre ignorar o fundo original, reconstruir sombras e colocar o produto em um novo cenário alinhado ao modo criativo escolhido.
 - Documentar esse processo em `DOCS/estudio-ai-process.md` e garantir o registro no `progress.md` antes da próxima fase.
6. **Plano “Estúdio AI Clássico”**
  - Renomear o módulo atual para “Estúdio AI Clássico” e manter o escopo limitado a ele, copiando o componente/prompt do `landingbuilder-ai`.
  - O prompt legado (prompt direto + `base64`) deve substituir apenas o `services/geminiService.ts` associado ao Estúdio AI; nenhum outro módulo será tocado.
 - Registrar em `progress.md`/`findings.md` que estamos aguardando a substituição e que os testes manuais devem focar apenas nesse módulo (render com/sem imagem e toggle “Preservar Produto”).
  - Observação operacional: atualmente o `baseImage` só é enviado ao backend quando “Preservar Produto (Estrito)” está ativo (`shouldUseReference = strictRef && creativeMode === 'organic'`). Isso explica por que, com o estrito desligado, o modelo não recebe a referência (logo reproduz só o cenário) e, com o estrito ligado, acabamos compostando manualmente a imagem. Precisamos alterar essa lógica para enviar a referência sempre que houver um `baseImage` disponível e deixar o prompt do servidor cuidar do blending suave, reduzindo a dependência do modo estrito.

7. **Contexto da sessão (12/02/2026)**
  - Lidos `conductor/product.md`, `conductor/tech-stack.md`, `conductor/workflow.md` e `conductor/tracks/000-remodelacao/plan.md` antes da análise do bug no módulo Marketing.
  - Solicitação atual: card de Criativos vem vazio após reabrir app; só carrega após clicar em “Selecionar Estratégia” no card de Estratégias Sugeridas. Precisamos revisar fluxo esperado e persistência.
