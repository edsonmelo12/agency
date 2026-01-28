# Relatório de Auditoria Produção

**Projeto:** LandingBuilder AI  
**Data:** {{DATA}}  
**Overall Grade:** B (estrutura sólida, mas atenção em segurança e cobertura)

## Executive Summary
Auditoria guiada pela skill `production-code-audit`: o stack React/Vite com integração Gemini está funcional, porém o incidente do leak da API expôs lacunas em secrets management, monitoramento e cobertura de testes. A aplicação já possui controles iniciais (debounce, sanitização do preview), mas precisa de rotina estruturada para atingir padrão corporativo.

### Pontos críticos detectados
- Gestão de secrets: chaves da Gemini expostas exigem rotação e controles de acesso.
- Monitoramento e alertas: ausência de logging estruturado e endpoints simples de health/readiness.
- Testes: ausência quase total de testes automatizados para marketing e preview.

## Findings por categoria

### 1. Segurança (Grade: C)
- Verificamos que `services/geminiService.ts` consome diretamente a API e o fallback usa `.env` sem validações adicionais; precisamos garantir que nenhuma chave esteja versionada (`rg -n API_KEY`, histórico git).  
- O leak recente da chave do Gemini reforça o checklist: rotacione credenciais, configure auditoria de uso no console e proteja logs para detectar acessos anômalos.  
- Input validation: módulos `MarketingModule`, `PreviewPanel` e `BuilderModule` recebem HTML confiavel? Aplicar validações (Zod/Yup) para sanitizar payloads antes de enviar para a API.  
- Recomendação: adicionar `npm audit` rotineiro e monitoramento (Sentry/LogRocket) para alertas de 429 ou erros críticos.

### 2. Performance e Qualidade (Grade: B-)
- O build já alerta chunks >500KB. Recomendado code splitting (React.lazy) para `MarketingModule`, `PreviewPanel` e outras rotas pesadas.  
- Sanitize do iframe reduz riscos de HTML malformado (já aplicado).  
- Bundle size 1,3MB; meta corporativa 200–400KB. Priorizar tree-shaking e otimizar imagens (ex.: `public/assets/estudio-ai-visual.png`).  
- Dependências: rodar `npm audit` e alinhar versões `react`, `vite`, `tailwind` e `@google-ai/generativelanguage`.

### 3. Testes e Readiness (Grade: D)
- No momento não há testes automatizados. Foco inicial: teste unitário de `handleGeneratePaidStrategy` (payload e fallback de erro), teste de integração simulando o fluxo de gerar plano e lidar com 429, e teste de snapshot/UX para `PreviewPanel`.  
- Cobertura alvo >80%. Criar pasta `tests/` com mocks de serviços Gemini e simulações de API.  
- Health/readiness: adicionar endpoints (mesmo que mocks) e exibir status no UI/console da auditoria.

### 4. Infraestrutura de produção (Grade: C+)
- Logging: `setSaveMessage` já fornece feedback UX, mas faltam logs estruturados. Introduzir camada de logging (console estruturado ou backend).  
- Monitoramento: configurar tracking de quotas que geram 429 e alertas se chamadas excedem thresholds.  
- Checklist de readiness: health check, monitoramento de erros, pipeline/CI (não detectado no repo).  

## Priority Actions
1. **Segurança crí­tica (1 semana)**  
   - Rotacionar todas as chaves da Gemini e validar que `.env` não está versionado.  
   - Configurar alertas de uso e logs estruturados para detectar vazamentos.  
2. **Proteção e sanitização (1-2 semanas)**  
   - Adicionar validações com Zod/Yup em todos os inputs que atingem a API/iframe.  
   - Garantir tratamento de erros de quota (429) com mensagens claras e retry/backoff.  
3. **Testes e cobertura (2 semanas)**  
   - Criar testes unitários para modules críticos (MarketingModule, PreviewPanel).  
   - Escrever testes de integração para geração de plano e resposta da Gemini.  
4. **Performance e readiness (2 semanas)**  
   - Aplicar code-splitting e otimizar imagens/assets.  
   - Adicionar health/readiness endpoints e documentar monitoramento.

## Timeline
- **Críticos** (tempo estimado 1 semana): Secrets & monitoring, tratamento de quotas;  
- **Altas prioridades** (1–2 semanas): validação de inputs, testes, logs e health;  
- **Ready for production** (3–4 semanas): bundles otimizados, cobertura>80%, documentação de auditoria com métricas.

## Métricas principais
- Bundle atual: 1,3MB (meta <500KB).  
- Test coverage: não existente (meta 80%+).  
- Segurança: zero indicação de SQL Injection/XSS no front, mas dependente da sanitização e rotas da API.  
- Logs/monitoramento: ausentes, implementar Sentry/console.  
- Incident response: rotacionou a chave do Gemini, mas falta playbook e alertas.

## Observações finais
Use o template acima para registrar cada auditoria futura. Documentar evidências no backlog (issues + tickets) garante que o próximo sprint acompanhe as ações críticas. Se quiser, posso transformar esse checklist em issues organizadas por prioridade. Deseja essa transformação? 
