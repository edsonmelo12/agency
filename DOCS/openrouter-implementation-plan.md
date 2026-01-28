# Implementação OpenRouter / Fallback AI

## 1. Visão geral
Objetivo: expandir o pipeline atual (digirido pelo `production-code-audit`) para suportar OpenRouter como provedor alternativo, mantendo Gemini como default e acionando fallback automático quando houver limite/quota estourado. A UI já mostra o banner/modal de fallback e loga o evento; agora precisamos implementar a camada de serviço, adaptadores e testes que executam o switch de provedor.

## 2. O que já foi feito
- Documentei a estratégia de fallback (DOCS/openrouter-fallback-strategy.md).  
- Implementei `FallbackAlert` + `FallbackDetailsModal` no marketing module, com botão “Tentar Gemini”.
- Registrei o log (`fallbackLog`) em `App.tsx`, liguei à UI e detectei 429/quotas no handler.  
- Documentei o plano de auditoria e criei templates + scanner (`npm run security-scan`).  
- O briefing em PDF (`DOCS/production-audit-briefing.pdf`) e o doc de exemplos (`DOCS/issue-examples.md`) já estão prontos para o time.

## 3. Pendências (próximos passos da implementação)
1. **Abstrair os providers (Gemini + OpenRouter)**  
   - Criar `services/aiProviderService.ts` com `createAiClient(provider)` que lê `AI_PROVIDER_MODE` + chaves (`GEMINI_API_KEY`, `OPENROUTER_KEY`).  
   - Todos os serviços atuais (`geminiService.ts`, VSL, PDF, etc.) consomem esse novo serviço e tratam fallback (retry com provider secundário).  
2. **Adaptadores de resposta**  
   - Implementar parser específico para OpenRouter (posíveis diferenças de JSON) e normalizar para `Section`/`PaidCampaignPlan`.  
3. **Infra e observabilidade**  
   - Logar cada fallback com metadata (provider anterior, erro, payload) e alimentar o modal/bannner.  
   - Atualizar `DOCS/production-audit-report.md` com esse novo fluxo e registrar no log de incidentes.  
4. **Testes**  
   - Escrever testes simulando quota do Gemini (mock 429) garantindo fallback e mensagem.  
5. **Configuração**  
   - Atualizar `.env.example`/README com `OPENROUTER_KEY` e instruções para `AI_PROVIDER_MODE=auto|gemini|openrouter`.

## 4. Cronograma sugerido
| Sprint | Ação principal |
|--------|----------------|
| Sprint 1 | Criar `aiProviderService` e abstrair chamadas existentes; adicionar config/env. |
| Sprint 2 | Implementar adaptador OpenRouter + integrar fallback e logs; atualizar docs. |
| Sprint 3 | Testes de fallback (429) e monitoramento (Sentry/log); final review. |

## 5. Próximo passo imediato
1. Criar a estrutura `aiProviderService.ts`.  
2. Refatorar `services/geminiService.ts` para delegar ao novo provedor.  
3. Atualizar `.env` e doc com instruções da OpenRouter.  

Depois disso, rodar os templates/issue para acompanhar implementação e executar o scanner para validar tokens/fallbacks.
