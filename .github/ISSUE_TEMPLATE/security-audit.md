---
name: 🚨 Segurança crítica
about: Rotacione chaves sigilosas e fortaleça validações no Marketing Module e serviços AI.
title: Segurança crítica: rotacionar chaves do Gemini e reforçar validações
labels: security, high
assignees: []
---

## Contexto
A chave do Gemini foi exposta recentemente. Precisamos rotacionar a chave e implementar proteção extra (debounce, sanitização, alertas de quota).

## Checklist
- [ ] Revogar a chave antiga no painel Gemini e atualizar `.env` com `GEMINI_API_KEY`.
- [ ] Garantir que nenhuma chave aparece em arquivos versionados (`services/geminiService.ts`, `vite.config.ts`).
- [ ] Adicionar alertas/monitoramento sobre quotas 429 (Sentry, LogRocket, console).
- [ ] Garantir `MarketingModule` lida com 429 e aplica debounce/backoff.
