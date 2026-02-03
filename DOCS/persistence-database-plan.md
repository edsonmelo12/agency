## Planejamento de Persistência com Banco de Dados para o módulo de Marketing

### Contexto
Hoje o LandingBuilder AI salva ofertas, estratégias e criativos diretamente no IndexedDB/localStorage do navegador. Isso entrega uma boa performance local, porém gera ambientes isolados por navegador/perfil, tornando difícil replicar campanhas, compartilhar contextos entre dispositivos ou controlar versões das campanhas. Para elevar o módulo de marketing ao nível de um gestor de tráfego profissional, precisamos acrescentar persistência centralizada com banco de dados.

### Objetivo
Criar uma camada de persistência central onde o estado completo do módulo de marketing (produto, plano, criativos, estratégias, histórico de testes) seja salvo em um banco de dados persistente e sincronizado via APIs. Isso dá mobilidade entre navegadores, suporta auditoria e habilita trabalho em equipe.

### Fase 1 – Análise e modelagem
- **Entradas**: mapear todas as entidades que já existem no cliente (Expert, Produto, MarketingSettings, PaidCampaignPlan, BuilderPlan, CreativeIdea, StrategySuggestion, projetos salvos).  
- **Saída**: modelo lógico/table definitions para um banco relacional (ex.: PostgreSQL) e definição de campos obrigatórios (IDs, timestamps, meta de stage, variáveis de IA, status de sincronização).  
- **Ações**:
  1. Desenhar esquema: `experts`, `products`, `marketing_projects`, `paid_campaign_plans`, `builder_plans`, `creative_variants`, `strategy_suggestions`, `persistence_logs`.
  2. Definir relacionamentos (um projeto tem muitos criativos, um expert tem vários projetos).
  3. Incluir campos de versionamento (`version`, `updatedAt`, `syncedAt`) e `userId`/`projectId`.
  4. Mapear operações críticas (salvar projeto, atualizar plano, gerar criativos, exporter).

### Fase 2 – API de sincronização
- **Entrada**: esquema e operações levantados na fase 1.  
- **Saída**: rotas REST/GraphQL para CRUD completo + endpoints de backup e restauração.  
- **Ações**:
  1. Construir endpoints (`GET /projects`, `POST /projects`, `PUT /projects/:id`, `POST /projects/:id/creatives`, `GET /projects/:id/sync-status`).
  2. Scripts no server (`server/index.ts`) para persistir no banco (Postgres + Prisma/Drizzle/TypeORM).
  3. Validação de payloads (usando Zod) para proteger contra dados inválidos.
  4. Estratégia de merge: cliente envia diff (state + version); servidor aplica merge e retorna estado atualizado com `etag`.

### Fase 3 – Cliente + fluxo offline-first
- **Entrada**: API pronta + esquema.  
- **Saída**: sincronização híbrida (local + remoto).  
- **Ações**:
  1. `App.tsx` detecta usuário autenticado e aplica trigger para `saveProject` tanto em IndexedDB quanto via `fetch('/api/projects')`.
  2. Implementar camada `syncQueue` que tenta enviar mudanças quando houver rede. Em caso de conflito, mostrar opção “Merge automático” / “Revisar”.  
  3. Sincronizar creativos: cada geração chama API e armazena o `id` do creative no DB para evitar duplicação.
  4. Exportar/importar continua existindo como fallback manual e para uso off-line/sincronização entre equipes que não usam conta.

### Fase 4 – Segurança, identificação e testes
- **Entrada**: infraestrutura, endpoints e requisitos de acesso.  
- **Saída**: deploy com autenticação/permissões, auditoria e políticas de segurança.  
- **Ações**:
  1. Implementar sistema de login/senha com `users`, hashing (bcrypt) e políticas de senha forte; oferecer MFA como opcional.  
  2. Autenticação baseada em JWT + refresh tokens, middleware que valida cada request e associa `userId`/`projectId` ao payload.  
  3. `persistence_logs` com `userId`, ação, timestamp e contexto (Gerar criativo, exportar estratégia, sync).  
  4. Monitoramento de falhas (alertas, análise de retries) e fila de sync (Redis) para aplicar mudanças offline.  
  5. Backups noturnos e testes de contrato (API + UI) cobrindo reconciliação e resolução de conflitos.

### Indicadores de sucesso
1. O usuário pode abrir o mesmo projeto em qualquer navegador/perfil e continuar de onde parou.  
2. Mudanças geradas no painel são refletidas no banco em < 5 segundos, com feedback visual de sincronização.  
3. Histórico/versionamento rastreia quem alterou qual copy/criativo.  
4. Planos e criativos podem ser exportados/importados como JSON mesmo com a camada central (backup + rollback).

### Observações
- Essa camada pode evoluir para um “workspaces” multi-usuário, com colaborações e permissões entre organizações.  
- Use ferramentas como Prisma, PostgreSQL e Redis (fila de sincronização) para garantir desempenho e confiabilidade, documentando tudo com OpenAPI/Swagger.  
- Mantenha exportação/importação como fallback e registre os webhooks/integrations que disparam ações externas ao salvar projetos.

### Comercialização e go-to-market
1. **Camadas pagas**: limite recursos por plano (projetos ativos, chamadas IA, exportações) e desbloqueie features premium (histórico completo, alertas, templates corporativos).  
2. **Onboarding guiado**: disponibilize templates de campanha (venda direta, webinar, lançamento) clonáveis do banco, acelerando a adoção de clientes pagos.  
3. **Monitoramento + SLA**: exponha métricas de sync/falha e tempo de geração para comunicar nível de serviço e facilitar upsells para planos Growth/Enterprise.  
4. **Segurança como diferencial**: destaque login/senha + MFA, auditoria e backups automáticos ao vender para times de tráfego profissional.  
5. **Integrações**: ofereça webhooks (CRM/BI) e mantenha exportação manual como opção para compliance, aumentando o valor percebido.
