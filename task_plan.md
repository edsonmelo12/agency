# Remodelação da dinâmica de trabalho

**Objetivo:** reorganizar o contexto do projeto (`CONTEXT.md`) em artefatos padrão (conductor, produto, tech stack, workflow e tracks) e institucionalizar os hábitos de leitura/planejamento antes de implementar.

**Fonte da verdade:** `CONTEXT.md` serve como inventário inicial; cada bloco será redistribuído para o arquivo mais adequado antes de remover o documento único.

## Ferramentas e skills em uso
- `context-driven-development` para seguir o fluxo Context → Spec → Plan → Implement.
- `planning-with-files` para registrar fases, descobertas e decisões com `task_plan.md`, `findings.md` e `progress.md`.
- `scripts/context-checklist.sh` e `DOCS/context-workflow-checklist.md` para reforçar os lembretes de leitura/validação.

## Fases principais
1. **Diagnóstico e mapeamento do CONTEXT**
   - [ ] Catalogar cada seção do `CONTEXT.md` (arquitetura, IA, debug, checklist, roadmap) e decidir seu novo lar.
   - [ ] Registrar a distribuição no `findings.md`, associando cada bloco a artefatos-alvo (`product.md`, `tech-stack.md`, etc.).

2. **Criação do novo hub de contexto**
   - [ ] Gerar `conductor/index.md` com links para os artefatos principais e orientações de leitura.
   - [ ] Preencher `product.md` (visão, iscas, próximos passos) e `product-guidelines.md` (voz, CTA).
   - [ ] Documentar modelos Gemini/OpenRouter, env vars, fallback e `thinkingConfig` em `tech-stack.md`.
   - [ ] Consolidar o guia de debugging, smoke tests e checklists em `workflow.md` ou `workflow/code_styleguides/dev-env.md`.

3. **Tracks, scripts e automatismos**
   - [ ] Mapear os próximos passos (heatmap, webhooks, menu contextual, histórico) no `tracks.md` e em subdiretórios `tracks/<id>/plan.md`.
   - [ ] Criar scripts de validação e checklists (como `scripts/context-checklist.sh`) para garantir que o contexto seja lido antes de agir.

4. **Ritual de hábito e verificação contínua**
   - [ ] Formalizar o hábito no `DOCS/context-workflow-checklist.md` (skills recomendadas, triggers, RBI).
   - [ ] Atualizar `progress.md` após cada laboratório e registrar desvios no `findings.md`.
   - [ ] Planejar revisões periódicas do artefato (a cada sprint ou mudança significativa de dependência).

5. **Entrega e documentação final**
   - [ ] Garantir que `README.md` ou `conductor/index.md` contemplem o novo fluxo “ler contexto → planejar → implementar”.
   - [ ] Atualizar o `tracks.md` com o status final da remodelação e link para as skills usadas.
