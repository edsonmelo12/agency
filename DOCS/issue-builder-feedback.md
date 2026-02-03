# Issue: Feedback visual completo do Builder técnico

**Descrição:**  
O grid Topo/Meio/Fundo deve mostrar segmentos/budgets/CTAs reais da estratégia ativa, as simulações de budget devem refletir o orçamento calculado e o checklist deve expor alertas (pixel, confiança do provider). Os botões de exportação/ template/ A/B trabalham sobre a estrutura atual.

**Critérios de aceitação:**
1. Cada coluna mostra o segmento/budget e o criativo correspondente (filtro de `creativeIdeas` por ângulo).
2. As simulações e checklist exibem valores do `builderPlan` e revelam alertas quando faltar pixel ou confiança.
3. Botões “Exportar campanha”, “Salvar template”, “Gerar versão A/B” funcionam sobre o builder atual e mostram feedback visual (toast ou badge).

**Skills envolvidas:** `ui-ux-pro-max`, `paid-ads`, `marketing-ideas`

**Observações:**  
Use badges e contrastes para deixar claras as condições (alertas de falta de pixel ou de confiança baixa).
