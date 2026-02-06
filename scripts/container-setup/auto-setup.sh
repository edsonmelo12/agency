#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

SERVICE_PATTERN="${SERVICE_PATTERN:-burzo}"
SETUP_CMD="${SETUP_CMD:-node dist/index.js setup}"
CHECK_INTERVAL="${CHECK_INTERVAL:-1}"
TIMEOUT="${TIMEOUT:-0}"
RUN_ONCE="${RUN_ONCE:-false}"
STATE_FILE="${STATE_FILE:-$SCRIPT_DIR/.last-setup-container}"

print_help() {
  cat <<'EOF'
Usage: auto-setup.sh [options]

Monitors a Docker container by name and runs a setup command as soon as the container starts.

Options:
  -s, --service   Target container name or pattern (default: burzo)
  -c, --command   Command to run inside the container (default: node dist/index.js setup)
  -i, --interval  Poll interval in seconds (default: 1)
  -t, --timeout   Exit if no container starts within the timeout (seconds, default: 0 = never)
  -r, --run-once  Exit after successfully running the setup command once
  -h, --help      Show this help message
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -s|--service)
        SERVICE_PATTERN="$2"
        shift 2
        ;;
      -c|--command)
        SETUP_CMD="$2"
        shift 2
        ;;
      -i|--interval)
        CHECK_INTERVAL="$2"
        shift 2
        ;;
      -t|--timeout)
        TIMEOUT="$2"
        shift 2
        ;;
      -r|--run-once)
        RUN_ONCE="true"
        shift
        ;;
      -h|--help)
        print_help
        exit 0
        ;;
      *)
        printf 'Unknown option: %s\n' "$1" >&2
        print_help
        exit 1
        ;;
    esac
  done
}

log() {
  local level="$1"
  shift
  printf '%s %s\n' "$(date --iso-8601=seconds)" "[$level] $*"
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log ERROR "docker CLI not found in PATH"
    exit 2
  fi
}

find_container() {
  docker ps --filter "name=$SERVICE_PATTERN" --format '{{.ID}}' | head -n 1 || true
}

run_setup() {
  local container_id="$1"
  log INFO "Preparing to run setup in container $container_id"
  docker logs --tail 20 "$container_id" || true
  if docker exec "$container_id" sh -c "$SETUP_CMD"; then
    log INFO "Setup command succeeded inside $container_id"
    echo "$container_id" > "$STATE_FILE"
    return 0
  else
    log ERROR "Setup command failed inside $container_id"
    return 1
  fi
}

main() {
  parse_args "$@"

  ensure_docker

  local start_ts
  start_ts=$(date +%s)

  log INFO "Watching for container matching '$SERVICE_PATTERN'"

  while true; do
    if [[ "$TIMEOUT" -gt 0 ]]; then
      local elapsed=$(( $(date +%s) - start_ts ))
      if [[ "$elapsed" -ge "$TIMEOUT" ]]; then
        log WARN "Timeout ($TIMEOUT s) exceeded while waiting for container"
        exit 3
      fi
    fi

    local container_id
    container_id=$(find_container)

    if [[ -n "$container_id" ]]; then
      local last_id=""
      if [[ -f "$STATE_FILE" ]]; then
        last_id=$(cat "$STATE_FILE")
      fi

      if [[ "$container_id" != "$last_id" ]]; then
        if run_setup "$container_id"; then
          if [[ "$RUN_ONCE" == "true" ]]; then
            log INFO "Run-once mode: exiting after successful setup"
            exit 0
          fi
        fi
      else
        log DEBUG "Container $container_id already had setup applied"
      fi
    fi

    sleep "$CHECK_INTERVAL"
  done
}

main "$@"
