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
