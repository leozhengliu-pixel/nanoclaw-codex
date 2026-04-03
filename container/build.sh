#!/usr/bin/env bash
set -euo pipefail

ENGINE_BIN="${ENGINE_BIN:-docker}"
IMAGE_NAME="${IMAGE_NAME:-nanoclaw-multiruntime-agent:latest}"
CODEX_NPM_PACKAGE="${CODEX_NPM_PACKAGE:-@openai/codex}"
NPM_CONFIG_REGISTRY="${NPM_CONFIG_REGISTRY:-https://registry.npmjs.org/}"

"${ENGINE_BIN}" build \
  --build-arg "CODEX_NPM_PACKAGE=${CODEX_NPM_PACKAGE}" \
  --build-arg "NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY}" \
  -t "${IMAGE_NAME}" \
  -f container/Dockerfile .
