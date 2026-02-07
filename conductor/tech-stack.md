# Tech Stack & AI Configuration

## Modelos e fallback
- **Modelo principal:** `gemini-3-pro-preview` para copywriting de alta complexidade (landing pages, e-books, VSLs). Use `thinkingConfig` com budget entre 2000 e 4000 tokens quando estiver pedindo resultados aprofundados.
- **Consulta rápida/data:** `gemini-3-flash-preview` para SEO, análise de URLs, criativos simples.
- **Imagens:** priorize `gemini-3-pro-image-preview`; caia para `gemini-2.5-flash-image` quando houver 429 ou `resource_exhausted` e registre `fallbackReason` no ativo.
- **TTS:** use `gemini-2.5-flash-preview-tts` para scripts de vídeo e teleprompter.

## Variáveis de ambiente obrigatórias
```env
VITE_GEMINI_API_KEY=sk-...
VITE_OPENROUTER_KEY=sk-...
VITE_OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
VITE_OPENROUTER_MODEL=gpt-4o-mini
AI_PROVIDER_MODE=auto
```
- Para o backend (Prisma/Express): `DATABASE_URL=file:./dev.db`, `BCRYPT_SALT_ROUNDS=10`, `JWT_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`.
- Todas as chaves vivem no `.env.local` (ignoradas), use `.env.example` como referência.

## Arquitetura e ferramentas
- Frontend: Vite + Tailwind + IndexedDB/LocalStorage + `PreviewPanel` (Tailwind CDN) para edição visual.
- Backend: Express + Prisma + SQLite local; `server/index.ts` expõe auth JWT, CRUD de users/projetos e `persistence_logs`.
- Sincronização híbrida: IndexedDB como fallback e log serializado em `persistence_logs` para auditoria.

## Controles adicionais
- Sempre passe `genai` responses por `cleanJsonResponse` antes do `JSON.parse()` para evitar ruídos.
- Banner editorial alerta quando fallback para OpenRouter ocorre; use o modal para tentar Gemini após rotação de chave.
