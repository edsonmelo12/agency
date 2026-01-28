---
name: 📊 Monitoramento e documentação
about: Adicione observabilidade e registre incidentes.
title: Monitoramento contínuo e log de incidentes
labels: monitoring, low
assignees: []
---

## Contexto
Precisamos capturar erros, quotas e incidentes de fallback em ferramentas como Sentry e documentar cada auditoria.

## Checklist
- [ ] Configurar Sentry/LogRocket (ou equivalente) para capturar erros/quotas do AI provider.
- [ ] Documentar no log de auditoria o incidente da chave Gemini e a resposta adotada.
- [ ] Agendar revisões trimestrais do checklist `production-code-audit`.
- [ ] Atualizar README/DOCS com o playbook de incident response.
