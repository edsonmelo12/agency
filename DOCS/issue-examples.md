# Exemplos de Issues Baseadas nos Templates

## 1. Segurança crítica
**Título:** Segurança crítica: rotacionar chaves do Gemini e reforçar validações  
**Descrição:**  
Contexto: a chave do Gemini foi exposta, precisamos aproveitar o fallback e blindar o pipeline com validações extra.  
**Checklist:**  
- [ ] Revogar a chave antiga e garantir `.env` e `services/geminiService.ts` não expõem segredos.  
- [ ] Registrar alertas de quota (Sentry/console).  
- [ ] Validar e aplicar debounce/backoff no `MarketingModule` quando cair quota.

## 2. Validação & sanitização
**Título:** Validação e sanitização dos inputs do Marketing/Preview  
**Checklist:**  
- [ ] Adicionar Zod/Yup nos campos críticos e garantir `renderEditorialMarkdown` sanitiza scripts/atributos.  
- [ ] Cobrir sanitização com testes de HTML malformado.  
- [ ] Documentar fluxo `DOCS/openrouter-fallback-strategy.md`.

## 3. Cobertura crítica
**Título:** Cobertura de testes para Marketing Module e Preview  
1. Testes unitários cobrindo payload/e toque de erro.  
2. Integração simulando fallback (Gemini 429 → OpenRouter).  
3. Snapshot para `PreviewPanel` e sanitização.  
- [ ] Automatizar `npm test` no pipeline.

## 4. Performance & readiness
**Título:** Performance e readiness: code splitting e health checks  
**Checklist:**  
- [ ] Aplicar `React.lazy` nos módulos pesados.  
- [ ] Criar endpoints `/health` e `/ready`.  
- [ ] Registrar bundle size antes/depois no briefing.

## 5. Monitoramento & documentação
**Título:** Monitoramento contínuo e log de incidentes  
Checklist:  
- [ ] Configurar Sentry/LogRocket para Quotas/429.  
- [ ] Registrar logs do fallback no documento de auditoria.  
- [ ] Agendar revisões trimestrais e Atualizar README.
