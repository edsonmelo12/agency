# Context Brief

> Leia este documento antes de iniciar qualquer conversa com o modelo. Ele resume o fluxo e o checklist obrigatórios.

## 1. Fluxo resumido (contexto → plano → execução)
- **Contexto:** abra `product.md`, `tech-stack.md`, `workflow.md` e o track atual (`conductor/tracks/<id>/plan.md`). Esses artefatos são a única referência oficial para produto, stack, IA e processo.
- **Plano:** use `planning-with-files` para criar/atualizar `task_plan.md`, `findings.md` e `progress.md`. Registre metas, descobertas e próximos passos antes de pedir implementação.
- **Execução:** execute `./scripts/context-checklist.sh` (o hook já roda esse script para você). Ele garante que os artefatos existam e registra a verificação em `progress.md` + `reports/context-checklist-summary.md`.

## 2. Checklist obrigatório para cada sessão
1. Confirmar que o track atual descreve o que vamos fazer e está em `conductor/tracks/<id>/plan.md`.
2. Atualizar `findings.md` com dúvidas ou decisões rápidas.
3. Rodar `scripts/context-checklist.sh` para validar o ambiente e deixar o log no `progress.md`.
4. Repetir o fluxo sempre que a sessão reiniciar ou o escopo mudar.

## 3. Skills e gatilhos esperados
- **context-driven-development:** ativa automaticamente para validar artefatos. Verifique se o checklist foi marcado.
- **planning-with-files:** use para dividir o trabalho em fases, registrar descobertas e manter `progress.md` vivo.
- **docs/checklist:** o script `context-checklist.sh` e `rules/context-gate.md` são obrigatórios e devem rodar antes de qualquer commit/push.

## 4. Prompt que o modelo deve seguir
> "Baseado no Context Brief acima, descreva o próximo passo, cite quais artefatos precisam ser lidos/atualizados e confirme se o checklist foi considerado. Se houver dúvidas, liste-as antes de modificar qualquer arquivo." 

Sempre comece as conversas colando este documento ou pedindo explicitamente para o modelo segui-lo. Assim, ele já conhece o checklist e você pode pular várias leituras.
