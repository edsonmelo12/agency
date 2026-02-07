#!/usr/bin/env bash
set -eu
ROOT_DIR=$(dirname "$0")/..
PROGRESS="$ROOT_DIR/progress.md"
REPORT_DIR="$ROOT_DIR/reports"
REPORT="$REPORT_DIR/context-checklist-summary.md"
if [[ ! -f "$PROGRESS" ]]; then
  echo "[context-report] progresso ausente" >&2
  exit 1
fi
mkdir -p "$REPORT_DIR"
declare -A user_count date_count
while IFS= read -r line; do
  if [[ $line =~ Checklist[[:space:]]rodado[[:space:]]em[[:space:]]([0-9T:Z-]+)[[:space:]]por[[:space:]](.+)$ ]]; then
    ts=${BASH_REMATCH[1]}
    who=${BASH_REMATCH[2]}
    date=${ts%%T*}
    user_count[$who]=$(( ${user_count[$who]:-0} + 1 ))
    date_count[$date]=$(( ${date_count[$date]:-0} + 1 ))
  fi
done < <(grep -E "Checklist rodado" "$PROGRESS" || true)
{
  echo "# Checklist Contextual"
  echo "_gerado em $(date -u +'%Y-%m-%dT%H:%M:%SZ') UTC_"
  echo
  set +u
  date_len=${#date_count[@]}
  set -u
  if [[ "$date_len" -gt 0 ]]; then
    echo "## Execuções por data"
    echo "| Data | Execuções |"
    echo "| --- | --- |"
    for d in "${!date_count[@]}"; do
      printf "| %s | %s |\n" "$d" "${date_count[$d]}"
    done | sort
    echo
  fi
  set +u
  user_len=${#user_count[@]}
  set -u
  if [[ "$user_len" -gt 0 ]]; then
    echo "## Execuções por usuário"
    echo "| Usuário | Execuções |"
    echo "| --- | --- |"
    for u in "${!user_count[@]}"; do
      printf "| %s | %s |\n" "$u" "${user_count[$u]}"
    done | sort
  else
    echo "*Nenhuma execução de checklist registrada ainda.*"
  fi
} > "$REPORT"
