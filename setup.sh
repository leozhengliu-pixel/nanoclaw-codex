#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo '{"step":"bootstrap","ok":false,"reason":"node-missing"}'
  exit 1
fi

if [ ! -d node_modules ]; then
  npm install
fi

npx tsx setup/index.ts --step environment
