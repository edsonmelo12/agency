# Kanban do Módulo de Marketing para Campanhas Patrocinadas

**Objetivo**: acompanhar cronograma das fases e garantir que cada skill seja acionada no momento certo para entregar valor incremental.

| Coluna | Itens | Skills-chave | Próximo passo imediato |
| --- | --- | --- | --- |
| **Backlog** | - Definir dependências com App.tsx, services e DB.<br>- Validar regras de compliance e objetivos Meta.<br>- Documentar indicadores de confiança. | `marketing-ideas`, `paid-ads`, `page-cro` | Revisar requisitos com produto e IA. |
| **Planejamento (Fase 0–1)** | - Prompt/schema do Planner.<br>- Wireframe PASSO 1.<br>- Blueprint persistido.<br>- Mensagens de regeneração. | `copywriting`, `frontend-design`, `paid-ads` | Refinar prompt com base nos assets existentes. |
| **Criativos (Fase 2)** | - Geração de 3 variações + estilos.<br>- Validador anti-proibições.<br>- Interface de cards + ações.<br>- Biblioteca de estilos vencedores. | `copywriting`, `canvas-design`, `marketing-ideas` | Prototipar cards que mostram texto e conceito visual. |
| **Builder + Resumo (Fase 3–4)** | - Hierarquia campanha/conjunto/anúncio.<br>- Simulação orçamentária.<br>- Exportar/salvar template/versão A/B.<br>- Checklist final + log de provider. | `paid-ads`, `page-cro`, `frontend-design`, `marketing-ideas` | Mapear estado de checkout da Builder e o checklist final. |
| **QA & Documentação** | - Testes de prompts e UI.<br>- Documentação atualizada + onboarding.<br>- Monitoramento de métricas.
| **Skills**: `production-code-audit`, `marketing-ideas`, `pdf` | Preparar roteiros de QA e planilhas de métricas. |

## Observações
1. **Skill de design**: escolhi `frontend-design` porque o foco inicial era desenhar interfaces consistentes e funcionais para cada PASSO. A `ui-ux-pro-max` entra naturalmente nas próximas versões detalhadas de layout e microinterações (como o painel de confiança e o checklist do Builder), então podemos migrar para ela assim que definirmos os componentes principais ou quando formos prototipar animações/fluxos de alto nível.  
2. **Kanban vivo**: este quadro serve como base para acompanhamento em reuniões de squad e pode ser exportado no Notion/Trello para rastrear avanços.  
3. **Reutilização**: use as colunas como checkpoints para garantir que cada nova camada (Prompts, UI, QA) consome o que já está implementado nos módulos existentes.
