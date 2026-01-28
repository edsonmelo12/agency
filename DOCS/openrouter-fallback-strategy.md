# Estratégia de fallback para OpenRouter

## 1. Objetivo
Preparar o sistema para alternar automaticamente entre Gemini e OpenRouter quando uma quota se esgota ou algum provedor fica indisponível, mantendo a UX e os dados do usuário intactos.

## 2. Componentes da solução (sem implementar)

### 2.1. Camada de abstração de cliente
- `createAiClient(provider?: 'gemini' | 'openrouter')`: encapsula `GoogleGenAI` e o cliente OpenRouter (SDK REST/custom) e retorna um objeto com `generateContent` comum.
- `AiProviderState`: module que decide dinamicamente (`env AI_PROVIDER=gemini|openrouter|auto`) e mantém flags de erro/quota.
- Cada generator (landing, marketing, VSL, etc.) usa `await aiClient.generate(...)` e trata erros de quota, chamando fallback.

### 2.2. Flow de fallback
- Primeiro tenta Gemini.
- Se receber 429/resource_exhausted, faz o **fallback**:  
  1. Loga o evento (tipo de erro, provider, payload).  
  2. Instancia o cliente OpenRouter e reprova o mesmo prompt (com timeout/backoff).
  3. Atualiza o estado (ex.: `setAiProvider('openrouter')`) e mostra mensagem (“Gemini atingiu a quota; usando OpenRouter automaticamente”).

### 2.3. Adaptadores de resposta
- Criar `parseAiResponse(providerResponse)` que alimenta `cleanJsonResponse`, `PaidCampaignPlan`, `Section`, etc.
- Cada provider devolve JSON diferente; o adaptador normaliza para o modelo interno.

### 2.4. Configuração e métricas
- Novas variáveis `.env`:  
  `GEMINI_API_KEY`, `OPENROUTER_KEY`, `AI_PROVIDER_MODE=auto|gemini|openrouter`.
- Métricas/logs: contador de chamadas por provider, número de quotas/retentativas, tempo de resposta.

### 2.5. UX/Feedback
- Banner ou toast no módulo de marketing (“Fallback para OpenRouter ativado; resultados podem variar”).
- Registro no relatório de auditoria para evidenciar o mecanismo de contingência.

## 3. Checklist para implementação futura
1. Adicionar client adapter para OpenRouter (API REST ou SDK).  
2. Refatorar `services/geminiService.ts` para `services/aiProviderService.ts` com fallback.  
3. Atualizar `DOCS/production-audit-report.md`/issues com essa nova camada de resiliência.  
4. Testes simulando quotas (mock 429) garantindo fallback e mensagens ao usuário.

