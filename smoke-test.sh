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
if [[ "$TOKEN" == "null" || -z "$TOKEN" ]]; then
  echo "Não foi possível extrair o accessToken."
  exit 1
fi

echo "2. Listando projetos com token..."
curl -s -H "Authorization: Bearer $TOKEN" "$API/api/projects" | jq

