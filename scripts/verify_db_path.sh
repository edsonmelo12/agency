#!/usr/bin/env bash
set -euo pipefail
ENV_FILE=".env"
if [[ ! -f $ENV_FILE ]]; then
  echo "[verify-db] .env não encontrado"
  exit 1
fi
DB_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d'=' -f2-)
if [[ -z $DB_URL ]]; then
  echo "[verify-db] DATABASE_URL não definido"
  exit 1
fi
DB_URL=${DB_URL#\"}
DB_URL=${DB_URL%\"}
if [[ $DB_URL =~ ^file:(.*)$ ]]; then
  DB_PATH=${BASH_REMATCH[1]}
else
  echo "[verify-db] DATABASE_URL não usa file: esquema"
  exit 2
fi
if [[ ! -f $DB_PATH ]]; then
  echo "[verify-db] Arquivo de banco não encontrado: $DB_PATH"
  exit 3
fi
if python3 - <<'PY' >/dev/null 2>&1
import sqlite3, sys
try:
    conn = sqlite3.connect("$DB_PATH")
    conn.execute("PRAGMA schema_version;")
    conn.close()
except Exception as exc:
    print(f"[verify-db] erro python: {exc}")
    sys.exit(1)
PY
then
  echo "[verify-db] Banco acessível: $DB_PATH"
else
  echo "[verify-db] Erro ao abrir banco: $DB_PATH"
  exit 4
fi
