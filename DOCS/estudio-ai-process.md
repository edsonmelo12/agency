# Estúdio AI: Processo de criação de imagens com referência

## Objetivo
a. Garantir que o módulo Estúdio AI gere artes alinhadas ao funil (orgânico, pago, genérico) usando a foto real do produto como ponto de partida com contexto novo e criativo.

## Entradas obrigatórias
1. *Imagem de referência* ou upload do produto (modo estrito ou flexível).
2. Prompt do cenário (campo “Cenário Sugerido / Detalhes”).
3. `creativeMode` selecionado: define o tom (história artesanal, prova social ou moodboard genérico).
4. Parametrizações (preset, estilo visual, qualidade, strictReference).

## Fluxo de geração
1. O `StudioModule` coleta os dados e chama `generateStudioImage` em `services/genaiClient.ts`.
2. O serviço constrói um prompt combinando: texto base (prompt ou fallback do `creativeGuidance`), instruções de integração e o modo criativo atual, além de garantir que o modelo conhece o preset e o tamanho desejado.
3. Quando há base64, a IA recebe instruções explícitas para preservar o produto e reconstruir um ambiente novo, ignorando o fundo original (modo estrito) ou mantendo a identidade enquanto cria um cenário totalmente novo (modo flexível).
4. Em caso de falhas (`NO_IMAGE`, quota, outros), o serviço aplica fallback automático e registra `fallbackReason` para análise posterior.

## Saídas e validação
a. A arte gerada deve parecer fotografia editorial: o produto integrado ao novo espaço com sombras, reflexos e luz coerente.
b. Se o resultado ainda estiver apenas colando a referência, revisar o prompt no `creativeGuidance` e aumentar a especificidade (reconstruir cenário, descartar fundo original, etc.).
c. Registrar incidentes e ajustes no `progress.md` e `findings.md` para manter a rastreabilidade.

## Skills que suportam o processo
- `planning-with-files`: mantém o plano de trabalho (task_plan/findings/progress) enquanto validamos ajustes no prompt.
- `context-driven-development`: garante que os artefatos principais foram lidos e o checklist de contexto foi cumprido.
- `frontend-design`/`ui-ux-pro-max`: usados indiretamente para definir os controles do Estúdio AI (presets, toggles, uploads) que orientam o usuário.
- `canvas-design`: guia as expectativas de saída visual (editorial, storytelling, composições alinhadas à marca).
- `content-creator`/`copywriting`: ajudam a escrever prompts e CTAs coerentes para acionadores orgânicos e pagos.
