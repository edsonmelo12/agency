# Product Context

## Visão geral
LandingBuilder AI gera funis completos a partir de dados do Expert e do produto: landing page, e-book, roteiro de VSL e criativos de anúncios. O objetivo é transformar autoridade em conversão com um ecossistema "full-stack" que combina copywriting, visual e operacionalização.

## Componentes principais
- **Landing Page:** construções HTML/Tailwind persistidas como arrays de seções com edição visual no `PreviewPanel`.
- **Book Builder:** e-books gerados com `thinkingBudget` (2 a 3 mil tokens) para manter método e profundidade.
- **VSL Studio:** scripts com suporte a teleprompter e TTS (Gemini-2.5-flash-preview-tts).
- **Estúdio AI:** imagens contextuais com fallback de modelo e registro de `fallbackReason`.

## Regras editoriais
- **Isca (lead magnet):** introdução limitada a 1 página, exercícios a cada 2 capítulos, CTA suave, consistência com a promessa.
- **Produto principal:** exercícios a cada capítulo, CTA direto e método fluido em todo o e-book.
- Evitar itálico/asteriscos/blocks e preferir blocos de Gatilho → Reação → Comportamento.
- Todas as tabelas de gatilho são convertidas automaticamente; mantenha o conteúdo textual simples.

## Próximos passos do produto
1. Exportar e-books para PDF via jsPDF ou solução similar.
2. Adicionar "Heatmap Simulado" para previsões de atenção na LP.
3. Integrar webhooks para enviar leads a CRMs automaticamente.
4. Evoluir o menu contextual para painel de propriedades plus histórico de versões.
