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
2. Set the `VITE_GEMINI_API_KEY` (ou `VITE_API_KEY`) em [.env.local](.env.local).
3. (Opcional) Configure `VITE_OPENROUTER_KEY`, `VITE_OPENROUTER_URL`, `VITE_OPENROUTER_MODEL` e `AI_PROVIDER_MODE=auto` para ativar fallback automático no OpenRouter.
3. Run the app:
   `npm run dev`
