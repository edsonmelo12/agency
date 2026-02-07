# Regra: Gatilho de Contexto Obrigatório

Esta regra garante que qualquer agente ou ser humano seguindo o projeto passa pelo ritual "contexto → plano → execução" automaticamente.

## Procedimento
1. Antes de executar `npm`, `npm run`, `git`, ou qualquer comando que altere `src/`, rode `./scripts/context-checklist.sh`. O script falha se `CONTEXT.md`, `conductor/index.md`, `task_plan.md`, `findings.md` ou `progress.md` estiverem ausentes.
2. Caso o script indique artefatos faltando, pause o trabalho, atualize os arquivos mencionados (crie o track correspondente se não existir) e revalide.
3. Atualize `progress.md` com a fase atual e registrar o comando verificado pelo script — isso impede desvios silenciosos.

## Objetivo
- Forçar a leitura dos artefatos do conductor antes de qualquer implementação.
- Transformar o script em um pré-gatilho oficial, idealmente ligado a hooks (pre-commit, pre-push ou pré-tool hooks das skills).
- Manter rastreabilidade: quem executou o script e quando está registrado no `progress.md` e nos `tracks/<id>/plan.md`.

## Continuidade em outros projetos
Copie este arquivo junto ao template `DOCS/context-methodology-template.md` para deixar o gatilho pronto em novos repositórios. Sempre indique no README que a regra existe e é parte do workflow.
