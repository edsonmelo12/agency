# Checklist Operacional por Fase — Módulo de Marketing

Documentos anteriores definem o plano, a matriz de skills e o kanban. Este checklist resume as ações concretas que o time deve validar antes de avançar para cada fase. Use-o como pauta em reuniões de refinamento e para validar readiness antes da execução.

## Fase 0 – Descoberta
- [ ] Revisar requisitos com stakeholders principais e alinhar dependências (App.tsx, GeminiService, PreviewPanel).  
- [ ] Confirmar quais ofertas/ativos precisam estar disponíveis na seleção inicial.  
- [ ] Mapear regras Meta Ads (objetivos válidos, termos proibidos, pixel, UTM) e documentar em um guia rápido.  
- [ ] Identificar métricas de confiança e fallback (ex.: nível de certeza do Planner, provider atual).  
- [ ] Validar as métricas de sucesso da fase (tempo de geração, regenerações manuais, clareza do resumo).  
- [ ] Registrar informações em DOCS/marketing-module-plan.md para manter histórico.

## Fase 1 – Planner Estratégico
- [ ] Construir e revisar o prompt/schema do Planner; garantir que ele exige inputs obrigatórios e retorna blueprint padronizado.  
- [ ] Definir mensagens de feedback (regenerar planejamento, ajustar orçamento) e gatilhos de confiança.  
- [ ] Prototipar PASSO 1 com `frontend-design` (ou `ui-ux-pro-max`, se já em uso) mostrando resumo da oferta, resultado do agente, indicadores, botões de ação.  
- [ ] Validar blueprint com a camada de dados existente (IndexedDB, App.tsx) para persistência e leitura pelos próximos agentes.  
- [ ] Garantir que o objetivo sugerido só pertence ao conjunto de objetivos suportados pelo Meta.  
- [ ] Documentar o blueprint e os campos de confiança no plano.

## Fase 2 – Criativos
- [ ] Revisar prompts do Agente Criativos garantindo coerência com o Planner e compliance de Meta; incluir estilos alternativos.  
- [ ] Construir cards de copy/visual usando `canvas-design` ou `frontend-design`, com ações claras (regenerar, alterar estilo, enviar ao gerador).  
- [ ] Montar validador anti-proibições (lista de termos bloqueados, limites de comprimento, CTA).  
- [ ] Definir sistema de tags de estilo (emocional, direto, autoridade) e registrar qual variante o usuário aprovou.  
- [ ] Mapear integração com gerador de imagens (prompts, mockups, prompts base) e salvar referências.  
- [ ] Atualizar documentação com as regras de entrada/saída do Agente 2.  
- [ ] Confirmar que a geração de novas copies/prompts utiliza o funil/objetivo ativo (stage + métricas) e que o modal “Adicionar copy/prompt” registra esses campos antes de acionar a IA.  

## Fase 3 – Builder Técnico + Resumo
- [ ] Consumir blueprint e criativos aprovados para montar campanha → conjunto → anúncios; documentar hierarquia.  
- [ ] Implementar simulação orçamentária dinâmica (parâmetros ajustáveis) e recalcular alocações.  
- [ ] Definir nomenclatura padrão e posicionamento automático default.  
- [ ] Projetar checklist final com `page-cro`/`frontend-design` incluindo objetivo, público, criativos, orçamento e UTMs.  
- [ ] Criar ações de exportação (copy/paste), salvar template e gerar versão A/B.  
- [ ] Capturar logs de provider/fallback para o resumo final e banner informativo.

## Fase 4 – Integração, QA e documentação
- [ ] Validar fallback Gemini/OpenRouter com indicadores visíveis e botão “Tentar Gemini” pós-rotacionar chave.  
- [ ] Criar testes automatizados de prompts (parsing, presença de campos) e testes end-to-end para o fluxo completo.  
- [ ] Verificar persistência (IndexedDB) e performance das chamadas IA.  
- [ ] Atualizar DOCS, onboarding e FAQs com o novo módulo e suas regras.  
- [ ] Preparar dashboard/planilha de métricas (tempo de geração, regenerações, confiança) e plano de rollback.  
- [ ] Treinar produto/marketing/suporte para explicar a experiência e lidar com falhas.

## Checkpoints de governança
- [ ] Cada agente deve expor metadata padronizada (objetivo, público, estilo, provider) para ser lida pelos demais.  
- [ ] Sempre mostrar no UI qual provider (Gemini/OpenRouter) respondeu e se houve fallback/regeneração.  
- [ ] Manter um repositório de templates e variações aprovadas para acelerar futuras campanhas.  
- [ ] Revisar e aprovar o plano com as skills necessárias antes de qualquer refatoração.
