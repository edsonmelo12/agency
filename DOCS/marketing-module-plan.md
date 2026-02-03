# Planejamento do Módulo de Marketing para Campanhas Patrocinadas

## Objetivo do documento
Registrar a visão, fases e entregáveis necessários para transformar o fluxo do novo módulo de marketing e os três agentes (Planner, Criativos, Builder) em funcionalidades operacionais do produto. Este plano foca em planejamento e alinhamento; a implementação virá depois.

## Visão geral do produto
O LandingBuilder AI já gera funis completos a partir de dados de expert e produto. Atualmente queremos expandir esse ecossistema com um módulo dedicado a campanhas patrocinadas que guie o usuário de forma modular: Planejamento estratégico, Geração de criativos e Construção técnica (Builder). O módulo precisa manter transparência sobre decisões de IA, respeitar regras de compliance de Meta Ads e integrar-se aos assets existentes (copy, imagens e estruturas de campanha).

---

## Fase 0 – Descoberta e alinhamento (pré-implementação)
**Objetivo:** entender contexto atual, validar premissas e priorizar requisitos.

### Atividades
1. Revisar o fluxo proposto (PASSO 0 a PASSO 4) e identificar gaps em dados e UX. Marcar dependências com o App.tsx e serviços existentes (geminiService, dbService, PreviewPanel).  
2. Validar com stakeholders quais ofertas e assets precisam estar disponíveis no momento da seleção inicial.  
3. Mapear regras de negócio do Planner, Criativos e Builder (inputs/outputs, limites e validações Meta).  
4. Priorizar indicadores de confiança/sinalização de fallback (ex.: “Planner 82% confiante no objetivo em Purchase”).  
5. Definir métricas de sucesso (tempo para gerar campanha, clareza do resumo final, taxa de regeneração manual). 

### Entregáveis
- Documento de alinhamento (este arquivo + notas de revisão).  
- Lista de dependências técnicas (IA, DB, front).  
- Aprovação das regras de compliance para copy/imagens.

---

## Fase 1 – Core estratégico (Agente Planner + interface inicial)
**Objetivo:** construir o backend do planejamento (inputs, classificação e blueprint) e prototipar a interface do PASSO 1.

### Atividades
1. Definir prompts e schemas para o Planner: extração de avatar, consciência do funil, objetivo Meta Ads, justificativa e blueprint de campanha.  
2. Implementar camada de validação para garantir que objetivos só venham de conjuntos suportados (ex.: apenas conversão, tráfego e conversão com catálogo).  
3. Criar mockups do painel de PASSO 1 com componentes: resumo da oferta, resultado do agente (objetivo, estrutura, justificativa, orçamento), ícones de confiança, e botões de ação.  
4. Instrumentar coleta de metadados (pixel existente, tipo de produto) para alimentar o Planner.  
5. Definir como salvar a proposta do Planner (armazenar blueprint com campos padronizados para leitura rápida pelos outros agentes).  
6. Ensaiar a camada de “feedback” (ex.: “regenerar planejamento com ajuste de orçamento”).

### Entregáveis
- Prompt/schema do Planner + teste de parsing.  
- Protótipo de interface de PASSO 1 (wireframe ou story).  
- Blueprint persistido em IndexedDB e/ou backend.  
- Lista de regras de validação e mensagens de erro amigáveis.

---

## Fase 2 – Geração de Criativos (Agente Criativos)
**Objetivo:** automatizar a criação de textos, prompts e sugestões visuais, mantendo consistência de tom e compliance.

### Atividades
1. Estabelecer prompts para o Agente 2 que usem as saídas do Planner (público, objetivo, justificativa) e inputs de copy (headline, subheadline, dores, desejos).  
2. Criar mecanismos de “variantes inteligentes”: gerar 3 versões iniciais + 2 estilizações (emocional, autoridade) e marcar a que se encaixa melhor com o público.  
3. Integrar regras de compliance do Meta para evitar termos sensíveis; construir checkers automáticos antes de mostrar os criativos.  
4. Projetar interface de PASSO 2: cards de copy, carrosséis, prompts visuais e ações (regenerar, alterar estilo, enviar ao gerador de imagens).  
5. Garantir que imagens geradas mantenham link com a biblioteca visual (referências e mockups).  
6. Registrar métricas de preferências (qual estilo o usuário aprovou) para futuro aprendizado.

### Entregáveis
- Prompt/schema do Agente Criativos.  
- Validador de compliance e limites de texto.  
- Interface de PASSO 2 com ações contextualizadas.  
- Estrutura de dados para armazenar variações aprovadas.

---

## Fase 3 – Builder técnico (Agente Builder + checklist final)
**Objetivo:** montar a campanha pronta para copy/paste no Ads Manager, incluindo simulações orçamentárias e checklist final.

### Atividades
1. Consumir blueprint do Planner e criativos aprovados para gerar hierarquia campanha → conjunto → anúncio.  
2. Incorporar simulação de orçamento com variações (ex.: R$20→R$40/dia) e recalcular orçamentos e alocações.  
3. Gerar nomenclatura padronizada e campo de posicionamento automático default.  
4. Criar ações auxiliares: exportar, salvar template, gerar versão A/B.  
5. Desenvolver checklist final com indicadores (objetivo, público, criativos, orçamento, UTMs).  
6. Registrar estados de confiança e fallback (ex.: quando OpenRouter foi usado) e expor no resumo final e banner modal.

### Entregáveis
- Schema do Builder com estruturas de campanha e simulações.  
- Checklist e ações de exportação/template/A-B.  
- Interface do PASSO 3 + resumo final (PASSO 4) com métricas e alertas.  
- Log de provider e confiança para auditoria.

---

## Fase 4 – Integração, QA e documentação operacional
**Objetivo:** garantir consistência em todo o fluxo, preparar documentação e testes.

### Atividades
1. Verificar integrações com GeminiService/OpenRouter (fallback, indicadores de quota, tentativas “Tentar Gemini”).  
2. Criar testes automatizados de prompts (ex.: as saídas contêm os campos esperados) e cobrir a UI com testes end-to-end.  
3. Validar persistência (IndexedDB) e performance (latência das chamadas IA).  
4. Atualizar documentação de onboarding (e.g., CONTEXT, DOCS) com o novo módulo.  
5. Preparar planos de rollback e métricas de sucesso (taxa de campanhas aprovadas, tempo médio de geração, número de regenerações).  
6. Treinar equipe (produto, marketing, suporte) para explicar o funcionamento e lidar com falhas de IA.

### Entregáveis
- Testes de prompts e fluxos críticos.  
- Documentação final sobre uso e troubleshooting.  
- Dashboard ou métricas de monitoramento.  
- Planos de acompanhamento pós-lançamento.

---

## Considerações adicionais
* **Governança de dados:** cada agente deve expor metadata (objetivos, públicos, estilos aprovados) em campos padrão para evitar ruído entre os passos.  
* **Transparência:** sempre exibir qual provider (Gemini/OpenRouter) produziu o conteúdo e se houve fallback ou regeneração.  
* **Re-usabilidade:** templates gerados pela Builder devem poder voltar ao pool de ofertas para acelerar novas campanhas.  
* **Próximos investimentos:** Heatmaps AI, exportação de e-books, CRM webhooks e versionamento também podem ser alinhados com a nova arquitetura.
