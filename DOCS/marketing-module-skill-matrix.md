# Matriz de Skills e Responsabilidades por Fase — Módulo Marketing

Este quadro relaciona cada fase do plano do módulo de campanhas patrocinadas com as skills prioritárias, entregáveis esperados e próximas ações, garantindo que o time siga abordagens profissionais e reutilize os módulos existentes como fonte da verdade.

-## Fase 0 – Descoberta e alinhamento
-**Skills principais**: `marketing-ideas` (mapear táticas e benchmarking), `page-cro` (identificar gaps de UX e pontos de conversão), `paid-ads` (checagem de objetivos Meta e validações de compliance).  
-**Foco**: entender o que já existe (App.tsx, GeminiService, PreviewPanel), documentar dependências, priorizar indicadores de confiança e definir métricas de sucesso.  
-**Entregáveis**: notas de validação, lista de dependências, matriz de indicadores, conceitos iniciais de confiança e fallback.  
-**Próximos passos**: validar com produto/design, homologar regras de meta ads e definir formato das mensagens de erro/regeneração no Planner.  
-**Checklist por fase**
  1. Mapear fluxos atuais e dependências de dados (IndexedDB, GeminiService).  
  2. Confirmar quais campos dos módulos anteriores serão a fonte da verdade e sanitizar possíveis duplicidades.  
  3. Registrar indicadores de confiança/regeneração e exemplos de mensagens.  
  4. Documentar o backlog de prompts para o Planner e validar com marketing/ads.  

## Fase 1 – Planner Estratégico
- **Skills principais**: `copywriting` (prompts e justificativas mais humanas), `frontend-design` + `page-cro` (wireframes do painel PASSO 1), `paid-ads` (objetivos, segmentações, nomenclaturas).  
- **Foco**: construir prompts/schemas, validar objetivos Meta, criar blueprint padronizado e preparar interface com indicadores de confiança/sugestões de orçamento.  
- **Entregáveis**: prompt/schema do Planner, mockup do PASSO 1, blueprint persistido com campos oficiais, mensagens de feedback.  
- **Próximos passos**: alinhar com a base de dados de ofertas existentes e definir a API de consumo desse blueprint pelos demais agentes.
-**Checklist por fase**
  1. Entregar prompt/schema do Planner e garantir validações (objetivo permitido, orçamento mínimo).  
  2. Prototipar o PASSO 1 com contraste e badges de confiança claros (aplicando `ui-ux-pro-max`).  
  3. Registrar blueprint padronizado com metadados e gatilhos para regeneração.  
  4. Especificar mensagens amigáveis para erros (ex.: faltou pixel ou objetivo).  

## Fase 2 – Criativos (Copy + Imagem)
- **Skills principais**: `copywriting` (copys compactas, compliance), `canvas-design`/`frontend-design` (apresentação visual e cards), `marketing-ideas` (biblioteca de estilos vencedores e prompts inspiradores).  
- **Foco**: gerar 3 variações + estilos, validar termos proibidos, integrar prompts de imagem e permitir ações de regeneração.  
- **Entregáveis**: prompt/schema do Criativos, validador de compliance, interface PASSO 2 com ações, estrutura para armazenar variações e preferências.  
- **Próximos passos**: estabelecer tags de estilo (e.g., emocional vs. direto) e definir como armazenar o histórico de aprovação para alimentar recomendações futuras.
-**Checklist por fase**
  1. Especificar limites de palavras/CTA e validar textos via regra (sem termos proibidos do Meta).  
  2. Garantir que prompts de imagem estejam associados às variações recomendadas (carrossel, mockup, vídeo).  
  3. Criar UI para regenerar/alterar estilo e enviar ao gerador de imagens.  
  4. Registrar tags de estilo aprovadas para alimentar recomendações futuras.

## Fase 3 – Builder Técnico + Checklist Final
- **Skills principais**: `paid-ads` (estrutura técnica, simulações orçamentárias e nomenclaturas), `page-cro`/`frontend-design` (experiência final, checklist, ações de exportação), `marketing-ideas` (inspiração para versões A/B e templates).  
- **Foco**: montar hierarquia campanha/conjunto/anúncio, recalcular orçamentos ao ajustar valores, gerar exportáveis e checklist de publicação.  
- **Entregáveis**: schema do Builder, simulação orçamentária, interface dos PASSOS 3 e 4, log de provider/ confiança.  
- **Próximos passos**: definir como gerar UTMs automaticamente, permitir salvar templates e garantir consistência da nomenclatura padrão.
-**Checklist por fase**
  1. Consumir blueprint do Planner e criativos aprovados para montar Campanha → Conjunto → Anúncio.  
  2. Produzir simulações de budget e recalcular automaticamente ao ajustar valores.  
  3. Exibir checklist final (pixel, UTM, cronograma) com alertas de texto e badges de status.  
  4. Expor ações rápidas (exportar, salvar template, versão A/B) e logs de provider/ fallback.

## Fase 4 – Integração, QA e Documentação
- **Skills principais**: `production-code-audit` (verificação completa do fluxo), `marketing-ideas` (validação contínua das táticas), `pdf` (caso seja necessário documentar ou gerar material).  
- **Foco**: garantir que os prompts produzem campos esperados, testar fallback Gemini/OpenRouter, monitorar taxas de regeneração e documentar o módulo.  
- **Entregáveis**: testes de prompts e UI, documentação atualizada (DOCS + onboarding), dashboards de métricas, plano de rollback.  
- **Próximos passos**: criar checklists de QA, definir alertas de fallback e preparar treinamento para suporte/produto.
-**Checklist por fase**
  1. Cobrir prompts e fluxos com testes que garantam saídas válidas e sem duplicidade.  
  2. Verificar fallback Gemini/OpenRouter e mostrar banners/alerts com logs.  
  3. Atualizar documentação (DOCS, onboarding) e comunicar decisões ao time.  
  4. Monitorar métricas chave (tempo de geração, regenerações, confiança) e planejar ajustes rápidos.

## Considerações gerais
1. **Fonte da verdade**: cada fase deve aproveitar os módulos existentes (assets, BrandKit, persistência) e alinhar dados via IndexedDB/App.tsx.  
2. **Feedback contínuo**: indicadores de confiança, histórico de regeneração e banner/modal de fallback devem ser visíveis em toda a jornada.  
3. **Reutilização**: templates do Builder e variações de criativos aprovadas alimentam um repositório interno para aceleração futura.  
4. **Governança**: padronizar campos, validar termos e manter logs de provider garante qualidade e auditabilidade.
