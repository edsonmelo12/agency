# Template da Metodologia de Contexto

Use este guia quando quiser aplicar a mesma dinâmica (contexto → plano → execução) em outro repositório.

## 1. Estrutura mínima de artefatos
- `conductor/index.md`: hub com links e explicação do fluxo.
- `conductor/product.md` + `product-guidelines.md`: visão, regras de produto e tom de voz.
- `conductor/tech-stack.md`: modelos, variáveis, dependências e fallback.
- `conductor/workflow.md`: debug, QA, scripts e checklist operacional.
- `conductor/tracks/` ou `tracks.md`: registro de tracks/planos ativos.
- `task_plan.md`, `findings.md`, `progress.md`: arquivos de planejamento permanente (use `planning-with-files`).
- `scripts/context-checklist.sh`: validação obrigatória antes de qualquer execução.
- `DOCS/context-workflow-checklist.md`: resumo rápido com skills recomendadas e rotina de revisões.

## 2. Passo a passo de onboarding da metodologia
1. Copie o script `scripts/context-checklist.sh`, ajuste `ROOT_DIR` se necessário e torne-o executável.
2. Crie os artefatos do conductor com base no conteúdo do `CONTEXT.md` do projeto original.
3. Preencha `task_plan.md` com fases do trabalho e use `findings.md` para registrar decisões importantes.
4. Sempre que iniciar uma tarefa complexa, invoque `planning-with-files` para gerar/atualizar `task_plan.md`, `findings.md` e `progress.md`.
5. Antes de tocar qualquer código, execute `scripts/context-checklist.sh`; ele só deixa passar se os arquivos-A estiverem presentes.
6. Atualize `progress.md` e `tracks.md` ao longo do fluxo para manter o estado sincronizado.
7. Inclua em `DOCS/context-workflow-checklist.md` as skills-chave (context-driven, planning-with-files, debugger, etc.) e os gatilhos de revisão periódica.

## 3. Skills essenciais
- `context-driven-development`: para validar artefatos e manter o fluxo Context → Spec → Plan → Implement.
- `planning-with-files`: para registrar fases, descobertas (findings) e progresso.
- `debugging-strategies` / `debugger`: para blocos de troubleshooting.
- `frontend-design`, `copywriting`, `content-creator`: conforme o tipo de tarefa.

## 4. Automação e regras sugeridas
- Adapte `scripts/context-checklist.sh` como hook que roda antes de comandos de build/deploy.
- Registre no repositório uma `rule` (ou documentação) que exige a execução do script e a leitura dos artefatos antes de começar a implementar.
- Mantenha `findings.md` e `progress.md` versionados para que qualquer agente possa entender rapidamente o que foi feito.

## 5. Difusão em novos projetos
1. Copie a pasta `DOCS/`, o script e o trio `task_plan.md`, `findings.md`, `progress.md` para o novo repositório.
2. Adapte o conteúdo do conductor para refletir o contexto daquele projeto (produtos, modelos, workflows).
3. Raramente reescreva o script; preferir ajustar o caminho e as variáveis. Use o template de checklist e skills como base.
4. Certifique-se de que qualquer nova skill ou regra mencionada na metodologia esteja documentada no README do novo projeto.
