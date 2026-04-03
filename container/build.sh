#!/usr/bin/env bash
set -euo pipefail

ENGINE_BIN="${ENGINE_BIN:-docker}"
IMAGE_NAME="${IMAGE_NAME:-nanoclaw-multiruntime-agent:latest}"
CODEX_NPM_PACKAGE="${CODEX_NPM_PACKAGE:-@openai/codex}"

"${ENGINE_BIN}" build \
  --build-arg "CODEX_NPM_PACKAGE=${CODEX_NPM_PACKAGE}" \
  -t "${IMAGE_NAME}" \
  -f container/Dockerfile .
