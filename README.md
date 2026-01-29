<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PS-_vRmOOzyBjMZn4g0tkFHnjNqsCO5p

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` (ou `VITE_API_KEY`) em [.env.local](.env.local). Copie o conteúdo de [.env.example](.env.example) e preencha os valores reais. Nunca versionar esse arquivo.
3. (Opcional) Configure `VITE_OPENROUTER_KEY`, `VITE_OPENROUTER_URL`, `VITE_OPENROUTER_MODEL` e `AI_PROVIDER_MODE=auto` para ativar fallback automático no OpenRouter.
4. Run the app:
   `npm run dev`

## Segurança e resposta a alertas

1. Se o GitHub alertar sobre segredos expostos (como já ocorreu), revogue as chaves afetadas nos provedores (Google Cloud Console para `VITE_GEMINI_API_KEY` e dashboard da OpenRouter) e gere novas credenciais antes de reinstalar o `.env.local`.
2. Confirme que o `.env.local` está ignorado (`.gitignore` já inclui `.env` e `.env.local`) e use [.env.example](.env.example) como referência ao compartilhar instruções com o time.
3. Prefira armazenar as chaves no cofre/secret manager da infraestrutura (CI, VPS) e repasse ao build via variáveis de ambiente; nunca copie valores reais nos arquivos versionados.
4. Antes de dar push, execute `scripts/check-secrets.sh` para garantir que nenhuma chave `VITE_*` nem `.env` (.local) apareça nos arquivos rastreados e mantenha o repositório limpo.
