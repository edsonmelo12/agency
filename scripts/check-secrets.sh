#!/usr/bin/env bash
set -euo pipefail

echo "⚠️  Verificando se há secrets expostos nos arquivos rastreados..."

# Ensure .env files are not tracked
if git ls-files --error-unmatch .env >/dev/null 2>&1 || git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  echo "❌ Arquivos .env ou .env.local não devem estar rastreados."
  exit 1
fi

# Search for explicit VITE_ keys in tracked files (excluding node_modules/dist)
if git grep -n --cached -E "(VITE_GEMINI_API_KEY|VITE_OPENROUTER_KEY|GEMINI_API_KEY|OPENROUTER_KEY)" -- ':!node_modules' ':!dist' >/dev/null 2>&1; then
  echo "❌ Encontrado valor de chave (VITE_*) em arquivos rastreados. Revise antes de commitar."
  git grep -n --cached -E "(VITE_GEMINI_API_KEY|VITE_OPENROUTER_KEY|GEMINI_API_KEY|OPENROUTER_KEY)" -- ':!node_modules' ':!dist'
  exit 1
fi

echo "✅ Nenhum segredo óbvio encontrado nas áreas rastreadas. Continue com segurança."
