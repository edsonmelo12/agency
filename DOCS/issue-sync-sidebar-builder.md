# Issue: Sincronização sidebar → builder

**Descrição:**  
As alterações no painel lateral (objetivo, orçamento, pixel) devem recalcular `marketingPlan`/`paidCampaignInput`, disparar nova geração de criativos e atualizar o `builderPlan` em tempo real, mantendo os badges do dashboard alinhados com o que foi configurado.

**Critérios de aceitação:**
1. Toda modificação no sidebar atualiza `marketingPlan`/`paidCampaignInput` e dispara `generateCreativeCampaign`.
2. O `builderPlan` é recalculado antes que o usuário avance para o Builder técnico.
3. Badges como “Objetivo:” e “Pixel ativo?” refletem o estado atual do sidebar.

**Skills envolvidas:** `paid-ads`, `production-code-audit`, `ui-ux-pro-max`

**Observações:**  
Use `buildProjectOptions`/`saveProject` para inserir os dados no projeto e reative a sincronização sempre que um projeto for carregado.
