# Checklist da dinâmica de contexto

Este documento reforça os hábitos sugeridos anteriormente. Use-o como referência rápida antes de iniciar qualquer implementação.

## Passos obrigatórios antes de agir
1. **Contexto**: abra `conductor/index.md` (ou `CONTEXT.md` enquanto o hub não existir) e confirme que entendeu: produto, IA e workflow. Marque no script `scripts/context-checklist.sh`.
2. **Plano**: atualize o `tracks/<id>/plan.md` ou `task_plan.md` (quando trabalhar em uma feature maior) e registre descobertas em `findings.md`.
3. **Execução**: confirme em `progress.md` a fase atual e rode `scripts/context-checklist.sh` para verificar dependências/artefatos.

## Skills recomendadas por padrão
| Tipo de trabalho | Skill principal | Alternativa/apoio |
|------------------|------------------|------------------|
| Diagnóstico/contexto | `context-driven-development` | - |
| Planejamento multi-fase | `planning-with-files` | `doc-coauthoring` (resumos) |
| Debug complexo | `debugging-strategies` / `debugger` | `systematic-debugging` |
| Frontend/UI | `frontend-design` / `ui-ux-pro-max` | `frontend-developer` |
| Copy e conteúdo | `copywriting` / `content-creator` | `marketing-ideas` |

> Use o script (`scripts/context-checklist.sh`) para garantir que esses arquivos-chave existem e que você está operando com base no contexto mais recente.

## Rotina de revisões
- Ao terminar uma sprint ou entregar um track: atualize `tracks.md`, mova o track para `concluded`, e registre o aprendizado em `findings.md`.
- A cada 2 semanas: revise `tech-stack.md` e `workflow.md` para capturar mudanças de dependências (env vars, Gemini/OpenRouter, caches, fallback).
- Se detectar uma violação da metodologia (ex.: código sem contexto atualizado), registre no `progress.md` e atualize a documentação antes de seguir.
