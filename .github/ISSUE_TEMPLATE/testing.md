---
name: 🧪 Cobertura crítica
about: Adicione testes unitários e de integração aos fluxos de AI.
title: Cobertura de testes para Marketing Module e Preview
labels: testing, high
assignees: []
---

## Contexto
Não há testes automatizados cobrindo os fluxos de geração de plano e sanitização do preview; precisamos alcançar >80% de cobertura nas áreas críticas.

## Checklist
- [ ] Criar testes unitários para `handleGeneratePaidStrategy`, validando payload e tratamento de erros.
- [ ] Escrever testes de integração simulando a geração de plano e resposta de quota 429.
- [ ] Adicionar snapshot/UI test para `PreviewPanel` com HTML sanitizado.
- [ ] Integrar `npm test`/`npm run lint` aos pipelines.
