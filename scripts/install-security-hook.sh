#!/usr/bin/env bash
set -euo pipefail

HOOK_PATH="$(git rev-parse --git-dir 2>/dev/null)/hooks/pre-commit"
# ensure git directory exists
if [ -z "${HOOK_PATH}" ] || [ ! -d "$(dirname "$HOOK_PATH")" ]; then
  echo "git directory not found. Run this script from the project root."
  exit 1
fi

cat <<'EOF' > "$HOOK_PATH"
#!/usr/bin/env bash

echo "Running security gate: verifying secrets..."
SCRIPTS_DIR="$(git rev-parse --show-toplevel 2>/dev/null)/scripts"

"$SCRIPTS_DIR/check-secrets.sh"
result=$?

if [ $result -ne 0 ]; then
  echo "🚨 Security gate failed: secrets detected. Aborting commit."
  exit $result
fi

exit 0
EOF

chmod +x "$HOOK_PATH"
echo "Security hook installed at $HOOK_PATH"
