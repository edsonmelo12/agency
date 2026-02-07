# Workflow & Debugging Runbook

## Fluxo operacional antes de codar
1. Execute `scripts/context-checklist.sh` para confirmar `CONTEXT.md`, `conductor/index.md`, `task_plan.md`, `findings.md`, `progress.md` e `tracks/<id>/plan.md` estão presentes.
2. Leia `product.md`, `tech-stack.md` e o plan atual e registre o que você entendeu em `findings.md`.
3. Atualize `progress.md` com a fase atual e qualquer descuido que precise ser revisado depois.

## Debugging e manutenção
- **Cursor que pula (PreviewPanel):** verifique o bloqueio `lastReceivedHtml` e o `tailwind.refresh()` no `PreviewPanel.tsx`.
- **Salvamento constante:** ajuste o `scheduleNotify` no mesmo arquivo para controlar o debounce de salvamento.
- **Seleção de imagens:** confirme o hit-test do `<img>` no preview; imagens como `background-image` exigem lógica adicional.
- **Links no preview:** o iframe injeta interceptores para `<a>` – não navegue; use a edição no menu contextual.
- **Lack of CSS:** reforce `tailwind.refresh()` após injetar HTML na visualização.
- **Áudio TTS:** garanta que `decodeAudioData` converta Int16 para Float32 antes de tocar.
- **JSON quebrado:** evite pedir explicações fora do JSON; use schema rígido e `responseMimeType: "application/json"`.

## Execução local & smoke test
1. `npm install`
2. Configure `.env.local` e `.env` com as variáveis citadas em `tech-stack.md`.
3. `npx prisma migrate dev --name init`
4. `npx prisma generate`
5. Inicie com `npm run dev:all` (ou backend `npm run server:start` + frontend `npm run dev`).
6. Use os `curl` do CONTEXT.md (`/api/auth/register`, `/api/projects`, etc.) para validar os endpoints.
7. Enquanto o cliente sincroniza, mantenha IndexedDB/localStorage e registre em `persistence_logs`.
8. Use a exportação/importação JSON para backups manuais quando necessário.

## Checklist automático
- [ ] Contexto validado (`product.md`, `tech-stack.md`, `workflow.md` lidos)
- [ ] Plano revisado (`tracks/<id>/plan.md` ou `task_plan.md` atualizado)
- [ ] Skills acionadas (`context-driven-development`, `planning-with-files` ativadas)
- [ ] Script de checklist executado (`./scripts/context-checklist.sh`)
- [ ] Progress log atualizado (`progress.md`)
