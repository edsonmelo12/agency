# Planejamento para Dashboard de Campanhas Sugeridas

## Objetivo  
Construir um dashboard do módulo de marketing que funcione como gestor de tráfego experiente, apresentando estratégias completas (campanha, conjuntos, criativos) para topo/meio/fundo do funil, com linguagem clara, alertas de texto e ações ricas (salvar template, exportar, gerar variações).

## Fase 1 – Estratégias sugeridas (marketing-ideas + paid-ads)
- **Meta:** gerar 3–4 cartas táticas com justificativa, objetivo Meta, segmentação e métricas alvo. Cada carta deve trazer: título, narração do insight, tags de estilo (emocional/autoridade/direto) e badge de confiança.
- **Tarefas:**  
  1. Definir prompt que entregue múltiplas estratégias (explicitar topo/meio/fundo, canais, provas, CTAs).  
  2. Garantir que cada resultado contenha história curta, headline, corpo e CTA dentro dos limites (≤14 palavras headline, ≤90 corpo, ≤5 CTA).  
  3. Documentar as variações extras (ex.: vídeo curto, carrossel, imagem estática) e alinhar ao objetivo do funil.
- **Entregáveis:** API return com array de estratégias; protótipo dos cards de estratégia com CTAs (“Salvar”, “Copiar”, “Gerar variação”).

## Fase 2 – Camadas do funil + conjuntos (paid-ads + ui-ux-pro-max)
- **Meta:** mostrar colunas Topo/Meio/Fundo com conjuntos predefinidos (BROAD, LOOKALIKE, REMARKETING), budgets simulados, UTMs e alertas de texto.  
- **Tarefas:**  
  1. Criar esquema de budgets (ex.: R$20/dia) e simulações de CTA para cada conjunto.  
  2. Aplicar guidelines de contraste/texto (cards brancos, texto `text-ink`, badges de alerta).  
  3. Adicionar filtros por canal e formato (vídeo/imagem) e indicadores (CTR esperado).  
- **Entregáveis:** layout das colunas e sistemas de alerta de texto (texto longo, falta de prova) e filtros funcionais; simulações de budgets no Builder.

## Fase 3 – Criativos ricos + tags (marketing-ideas + copywriting)
- **Meta:** cada estratégia oferece 3 criativos completos com tags e validação textual; o usuário escolhe um e pode gerar variações automáticas.  
- **Tarefas:**  
  1. Definir prompt para gerar criativos (copy + prompt visual + tag de estilo).  
  2. Validar texto automaticamente (limites de palavras e CTA).  
  3. Criar UI para marcar criativo aprovado, salvar tag, exportar.  
- **Entregáveis:** lista de criativos por estratégia, botão “Gerar variação”, indicadores de texto e tags (emotional, authority, direct).

## Fase 4 – Ações finais e monitoramento (paid-ads + production-code-audit)
- **Meta:** permitir exportar campanha inteira, salvar template e acompanhar métricas (confiança Gemini/OpenRouter, fallback).  
- **Tarefas:**  
  1. Checklist final com pixel/UTM/segmentos.  
  2. Botões “Exportar campanha”, “Salvar como template”, “Gerar versão A/B”.  
  3. Logs de provider e indicadores de confiança; alertas de regeneração.  
- **Entregáveis:** painel com checklist e alertas, logs de provider, testes para parsing e persistência.

## Considerações finais  
- Use o DOCS de discussão como base para a sessão de alinhamento e registre decisões no kanban.  
- Após cada fase, valide com marketing/ads e atualize os prompts e documentos.  
- Próxima etapa: alinhar priortizações e timelines antes da implementação. Quer que eu ajude a montar esse cronograma em uma planilha?  
