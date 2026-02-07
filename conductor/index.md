# Conductor Hub

Este hub é o ponto de entrada para a metodologia de contexto. Cada arquivo abaixo responde a um ângulo específico do projeto e deve ser lido antes de iniciar qualquer tarefa nova.

## Artefatos principais

- **product.md**: captura a missão, as ofertas (landing, e-book, VSL) e as regras editoriais importantes (lead magnet vs. produto principal).
- **product-guidelines.md**: define a voz da marca, padrões de copy e CTAs consistentes para todos os ativos.
- **tech-stack.md**: documenta os modelos Gemini/OpenRouter, as variáveis de ambiente obrigatórias e a arquitetura de fallback.
- **workflow.md**: descreve o fluxo de trabalho (debug, smoke test, e integração com Prisma/Express) e inclui a rotina de checklist para antes de codar.
- **tracks/**: cada diretório representa um track ativo. Em `tracks/000-remodelacao/plan.md` está o plano atual para migrar o CONTEXT.md; futuros trabalhos devem ganhar novos diretórios.

## Fluxo obrigatório

1. Leia `product.md` para entender o "quê" e o "por quê" do produto.
2. Consulte `tech-stack.md` e `workflow.md` para saber "com o quê" e "como" executar o trabalho.
3. Abra `tracks/<id>/plan.md` antes de colocar as mãos no código e registre descobertas em `findings.md`.
4. Sempre execute `scripts/context-checklist.sh` antes de qualquer comando de implementação ou deploy.

## Ferramentas de apoio

- `task_plan.md`, `progress.md` e `findings.md` (via planning-with-files) mantêm um histórico serializado da remodelação.
- `DOCS/context-workflow-checklist.md` resume o checklist rápido e as skills recomendadas.
- `scripts/context-checklist.sh` garante que os artefatos essenciais estejam presentes antes de avançar.
