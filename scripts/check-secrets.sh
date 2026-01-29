#!/usr/bin/env bash
set -euo pipefail

echo "⚠️  Verificando se há secrets expostos nos arquivos rastreados..."

# Ensure .env files are not tracked
if git ls-files --error-unmatch .env >/dev/null 2>&1 || git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  echo "❌ Arquivos .env ou .env.local não devem estar rastreados."
  exit 1
fi

# Search only for tracked secrets with value patterns (sk- or AIza) 
if git grep -n --cached -E "(VITE_GEMINI_API_KEY|VITE_OPENROUTER_KEY|GEMINI_API_KEY|OPENROUTER_KEY)\\s*=\\s*(sk-|AIza)" -- '*.env*' >/dev/null 2>&1; then
  echo "❌ Referência a segredo real dentro de arquivos .env rastreados. Revise antes de commitar."
  git grep -n --cached -E "(VITE_GEMINI_API_KEY|VITE_OPENROUTER_KEY|GEMINI_API_KEY|OPENROUTER_KEY)\\s*=\\s*(sk-|AIza)" -- '*.env*'
  exit 1
fi

echo "✅ Nenhum segredo óbvio encontrado nas áreas rastreadas. Continue com segurança."
