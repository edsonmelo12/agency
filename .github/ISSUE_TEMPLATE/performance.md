---
name: ⚡ Performance & readiness
about: Otimize bundles, crie endpoints de health e documente monitoramento.
title: Performance e readiness: code splitting e health checks
labels: performance, medium
assignees: []
---

## Contexto
Build de produção gera chunks acima de 1MB e não há health/readiness endpoints. Precisamos code splitting, otimização e endpoints simples.

## Checklist
- [ ] Aplicar React.lazy/dynamic import nos módulos pesados (MarketingModule, PreviewPanel).
- [ ] Otimizar assets (compressão, revisão de dependências) para reduzir bundle size.
- [ ] Criar endpoints `GET /health` e `GET /ready` (mesmo mocks) e documentar no README.
- [ ] Medir bundle/tamanho antes/depois e registrar no briefing.
