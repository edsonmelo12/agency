#!/usr/bin/env bash
set -eu

ROOT_DIR=$(dirname "$0")/..
REQUIRED=(
  "CONTEXT.md"
  "conductor/index.md"
  "task_plan.md"
  "findings.md"
  "progress.md"
)

missing=()
for path in "${REQUIRED[@]}"; do
  if [[ ! -f "$ROOT_DIR/$path" ]]; then
    missing+=("$path")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  cat <<MSG
[context-checklist] Atenção: os seguintes artefatos não foram encontrados:
${missing[@]/#/  - }
→ Atualize o plano e garanta que você tem o contexto atualizado antes de executar.
MSG
  exit 1
fi

echo "[context-checklist] Tudo pronto: leia product.md/tech-stack.md/workflow.md antes de avançar." 

# registra a execução no progress.md
PROGRESS_FILE="$ROOT_DIR/progress.md"
if [[ -f "$PROGRESS_FILE" ]]; then
  printf "\n- [ ] Checklist rodado em %s por %s\n" "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$(whoami)" >> "$PROGRESS_FILE"
fi

REPORTER="$ROOT_DIR/scripts/context-checklist-report.sh"
if [[ -x "$REPORTER" ]]; then
  "$REPORTER" >/dev/null 2>&1 || true
fi
