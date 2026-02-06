<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PS-_vRmOOzyBjMZn4g0tkFHnjNqsCO5p

## Run Locally

**Pré-requisitos:** Node.js, npm


1. Instale as dependências:
   `npm install`
2. Crie `.env.local` copiando o [.env.example](.env.example) e preencha `VITE_GEMINI_API_KEY` (ou `VITE_API_KEY`) e, se necessário, `VITE_OPENROUTER_KEY`, `VITE_OPENROUTER_URL`, `VITE_OPENROUTER_MODEL` e `AI_PROVIDER_MODE=auto`. Nunca versionar esse arquivo.
3. Configure o backend da API:
   - Crie `.env` com `DATABASE_URL=file:./dev.db`, `BCRYPT_SALT_ROUNDS`, `JWT_SECRET`, `ACCESS_TOKEN_TTL` e `REFRESH_TOKEN_TTL`.
   - Execute `npx prisma migrate dev --name init` e `npx prisma generate` para preparar o SQLite local e o Prisma Client.
4. Inicie o servidor e o frontend juntos:
   `npm run dev:all`
5. Alternativamente, rode `npm run server:start` (API Prisma/Express/TS Node) e `npm run dev` em terminais separados, usando `API_PORT`/`API_HOST` via `.env.local` para escolher a porta se houver conflito.

## Segurança e resposta a alertas

1. Se o GitHub alertar sobre segredos expostos (como já ocorreu), revogue as chaves afetadas nos provedores (Google Cloud Console para `VITE_GEMINI_API_KEY` e dashboard da OpenRouter) e gere novas credenciais antes de reinstalar o `.env.local`.
2. Confirme que o `.env.local` está ignorado (`.gitignore` já inclui `.env` e `.env.local`) e use [.env.example](.env.example) como referência ao compartilhar instruções com o time.
3. Prefira armazenar as chaves no cofre/secret manager da infraestrutura (CI, VPS) e repasse ao build via variáveis de ambiente; nunca copie valores reais nos arquivos versionados.
4. Antes de dar push, execute `scripts/check-secrets.sh` para garantir que nenhuma chave `VITE_*` nem `.env` (.local) apareça nos arquivos rastreados e mantenha o repositório limpo.

## Backend & APIs

1. A API `server/index.ts` expõe rotas de autenticação `POST /api/auth/{register,login,refresh}`, gestão de projetos (`GET/POST /api/projects`, `POST /api/projects/:id/sync`, `GET /api/projects/:id/sync-status`), CRUD de usuários/Admin (`GET /api/users`, `GET/PUT/DELETE /api/users/:id`, com `name` editável) e criação de criativos (`POST /api/projects/:id/creatives`). Todas usam Prisma/SQLite com versionamento e `persistence_logs`.
2. Os tokens JWT são gerados com `jsonwebtoken` (CommonJS) e o prisma usa `String` para armazenar `context`, `payload` e `details` enquanto o cliente serializa JSON manualmente.
3. O servidor loga `AI proxy listening on http://...` (API externa) e registra ações no banco para auditoria. Ajuste `API_PORT`/`API_HOST` em `.env.local` se outra aplicação já ocupa a porta 5000.

## Testes e smoke test

1. Após o `npm run dev:all`, rode o script `./smoke-test.sh` (ou copie o conteúdo abaixo) para registrar um usuário e listar os projetos via token:
   ```sh
   #!/bin/bash
   set -euo pipefail
   API="http://127.0.0.1:5000"
   EMAIL="test@example.com"
   PASSWORD="senha123"

   echo "1. Registrando usuário..."
   RESPONSE=$(curl -s -X POST "$API/api/auth/register" \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

   echo "Resposta: $RESPONSE"
   TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
   echo "2. Listando projetos..."
   curl -s -H "Authorization: Bearer $TOKEN" "$API/api/projects" | jq
   ```
2. Para testar os endpoints manualmente:
   - `curl http://127.0.0.1:5000/api/health`
   - `curl -H "Authorization: Bearer <token>" http://127.0.0.1:5000/api/projects`
3. Depois que o cliente estiver sincronizando, cada `saveProject` deve chamar `POST /api/projects/:id/sync` com `version`/`context` e tratar conflitos (`409`) retornados pelo servidor; exportação/importação JSON continuam como fallback.
