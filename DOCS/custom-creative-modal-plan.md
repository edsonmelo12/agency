## Planejamento: Modal de Custom Creative e Persistência Pendente

### Objetivo
Desenhar e implementar um modal dedicado para cadastrar manualmente uma copy + prompts de mídia, preservando o arsenal de testes e deixando espaço para persistência futura.

### Etapas

1. **UX do modal (versão atualizada)**
   - Modal mantém copy, CTA e prompts extras, adicionando badges “Objetivo ativo + funil (Topo/Meio/Fundo)” e uma lista de instruções/resumo do funil para guiar a escrita manual.
   - Inclui campos de metadados: intenção (Conversão/Lead magnet/Prova), formato sugerido (Reels, Stories, Feed etc.) e tags de estilo (emocional, autoridade, urgência, prova, benefício, curiosidade).
   - O modal oferece “Gerar IA com o funil atual”, “Salvar copy/prompt” e um novo botão “Salvar e adicionar outro” para alimentar múltiplas copies sem fechar o modal.
2. **Estado e comportamento**
   - `MarketingWorkflowPanel` continua expondo `customCreatives` mas agora o modal envia `intention`, `format` e `tags`; o card principal do Step 2 usa o kit combinado (IA + manuais) e exibe stage/origem para cada variação.
   - Ao salvar, cada entrada vira um `CreativeIdea` com `objective`, `awarenessLevel`, `intent`, `format`, `tags` e permanece disponível no kit para testes.
3. **Persistência e exportação**
   - O array `customCreatives` é guardado em `Project.options`/backup e restaurado no import, garantindo que várias copies/prompt criados manualmente sobrevivam a reloads e restore.
4. **Mensuração**
   - O painel de Marketing agora mostra quantas variações estão ativas (badge “Kit de testes alinhado”) e as instruções/informações salvas ajudam a fiscalizar se o manual segue o funil.

Esse plano orienta a implementação imediata do modal, mantendo espaço para evoluir a persistência na próxima sprint. Deseja que eu descreva também o layout necessário para a versão futura com templates e saving?  
