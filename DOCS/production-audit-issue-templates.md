# Templates de Issues de Auditoria

Use estes templates para abrir tickets no GitHub/Jira com escopo claro, contexto e critérios.

---

## 1. Segurança Crítica — Rotacionar chaves e monitorar quotas
**Título sugerido:** Auditoria de segurança: rotacionar Gemini API key e configurar alertas

**Descrição:**  
Contexto: a chave do Gemini foi exposta recentemente. Precisamos rotacionar a chave (revogar a anterior), garantir que `.env` não contenha segredos versionados e habilitar alertas de uso na plataforma da API. Isso reduz o risco de vazamentos futuros.

**Critérios de aceitação:**
1. Globo controlado: a chave exposta foi revogada no console do Gemini e a nova chave foi salva apenas em `.env`.
2. Pipeline/README documenta o processo de rotacionar secrets.
3. Configuramos alertas/monitoramento sobre quotas e chamadas caras (ex.: Sentry ou Logs).
4. O botão “Gerar plano” (MarketingModule) exibe feedback claro ao receber 429 e aplica debounce/backoff antes das novas tentativas.

---

## 2. Validação e sanitização de entradas
**Título sugerido:** Validar e sanitizar payloads do Marketing Studio e Preview

**Descrição:**  
Os módulos de geração (MarketingModule e PreviewPanel) consomem e exibem HTML/inputs que chegam da IA. Precisamos garantir validações/guardrails (Zod/Yup) para evitar XSS, dados inválidos ou HTML malformado no iframe.

**Critérios de aceitação:**
1. Todas as entradas críticas (segmento, promessa, payload de HTML) passam por validações.
2. Sanitização reforçada no shell do preview (remover `<path>` inválidos e atributos suspeitos).
3. Testes cobrem casos de dados malformados e garantem que o iframe não quebra.
4. Documentamos o fluxo de sanitização em `DOCS/production-audit-report.md`.

---

## 3. Cobertura de testes crítica
**Título sugerido:** Cobertura de testes do módulo Marketing e Preview

**Descrição:**  
A aplicação não possui testes automatizados. Precisamos priorizar cobertura crítica (>80%) para os processos da geração de planos, marketing e edição visual.

**Critérios de aceitação:**
1. Testes unitários cobrindo `handleGeneratePaidStrategy`, tratamento de erros (429, 500) e payload.
2. Testes de integração simulando o ciclo de gerar plano (UI → API → alertas).
3. Snapshot/UI test para PreviewPanel garantindo sanitização e posicionamento centralizado.
4. `npm test` ou `npm run lint` integrado ao pipeline (pre-merge).

---

## 4. Performance e readiness
**Título sugerido:** Otimizar bundlers e adicionar health checks

**Descrição:**  
O build gera chunks acima de 500 KB e não há health checks/monitoramento. Precisamos reduzir bundle size, aplicar code splitting e expor endpoints de estado.

**Critérios de aceitação:**
1. Aplicar React.lazy/dynamic import nos módulos pesados (MarketingModule, PreviewPanel).
2. Otimizar assets (compressão de imagens públicas, revisão de dependências).
3. Criar endpoints `/health` e `/ready` (mesmo mocks) e documentar para monitoramento.
4. Medir bundle antes/depois e registrar no relatório (target <500KB).

---

## 5. Monitoramento e documentação contínua
**Título sugerido:** Implantar monitoramento e documentar auditorias

**Descrição:**  
Para manter o padrão corporativo, adicionaremos monitoramento contínuo e registraremos incidentes/ações da auditoria.

**Critérios de aceitação:**
1. Configurar Sentry/LogRocket ou similar para capturar erros e quotas.
2. Documentar incidência da chave do Gemini e rota de resposta no log de auditoria.
3. Agendar revisões trimestrais do checklist `production-code-audit`.
4. Atualizar README/DOCS com procedimentos de incident response e monitoramento.
