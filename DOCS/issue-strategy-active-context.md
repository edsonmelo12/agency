# Issue: Estratégia ativa como fonte única

**Descrição:**  
Selecionar uma carta em "Estratégias sugeridas" deve destacar essa carta, expor seus segmentos, CTA e objetivo e garantir que os criativos exibidos + `builderPlan` sejam gerados exclusivamente com esse contexto (`StrategySuggestion`).

**Critérios de aceitação:**
1. O clique define `selectedStrategyId` e destaca visualmente a carta ativa no dashboard.
2. `generateCreativeCampaign` recebe a carta completa (segmentos, tags, CTA, headline).
3. Os criativos exibidos e o `builderPlan` são consistentes com os dados da carta selecionada.

**Skills envolvidas:** `marketing-ideas`, `paid-ads`, `ui-ux-pro-max`

**Observações:**  
O estado global (`selectedStrategyId`) deve controlar o Builder e o prompt usado pelo serviço de IA.
