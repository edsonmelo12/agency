## Production Audit Issues

### 1. Segurança crítica (1 semana)
- [ ] Rotacionar todas as chaves da Gemini e validar revogação da chave exposta.
- [ ] Garantir que `.env` e qualquer arquivo de configuração sigam `.gitignore` e não contenham credenciais.
- [ ] Criar alertas/monitoramento no console do Gemini (uso anômalo e quotas) e configurar logs estruturados para cada chamada.
- [ ] Tratar mensagens de erro da API (por exemplo, 429) com feedback claro e debounced retries no UI (MarketingModule).

### 2. Validação e sanitização (1–2 semanas)
- [ ] Reforçar validações (Zod/Yup) dos inputs em MarketingModule, PreviewPanel e BuilderModule antes de enviar payloads.
- [ ] Adicionar sanitização no shell do preview (reinforçar `removeInvalidSvgPaths`) e documentar o comportamento.
- [ ] Inserir testes que validem o tratamento de HTML malformado e inputs vazios (especialmente `PreviewPanel` e `MarketingModule`).

### 3. Testes e cobertura (2 semanas)
- [ ] Criar testes unitários cobrindo `handleGeneratePaidStrategy`, validação do payload e fallback de erros.
- [ ] Escrever testes de integração simulando a geração de plano e respostas da API (incluindo quotas e erros 429).
- [ ] Estabelecer meta de cobertura ≥80%; documentar gap antes/depois.
- [ ] Automatizar execução de testes no pipeline (p. ex. `npm test` antes do build).

### 4. Performance e readiness (2–4 semanas)
- [ ] Aplicar code splitting (React.lazy/dynamic import) para módulos pesados (MarketingModule, PreviewPanel).
- [ ] Otimizar assets (compressão de imagens, revisão de `public/assets/`) e reduzir tamanho do bundle (meta 200–400KB gzipped).
- [ ] Criar endpoints simples `GET /health` e `GET /ready` (mesmo que mocks) e documentar no README.
- [ ] Monitorar bundle size e dependências (`npm audit`, `npm outdated`) regularmente.

### 5. Monitoramento e documentação
- [ ] Implantar Sentry/LogRocket ou equivalente para capturar erros da UI/serviços.
- [ ] Documentar incidentes (leak da chave do Gemini) e ações tomadas no log de auditoria (arquivo ou changelog).
- [ ] Agendar revisões trimestrais do checklist de auditoria (usar `production-code-audit` como referência).
