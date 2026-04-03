#!/usr/bin/env bash
set -euo pipefail

BUILD_APP="${BUILD_APP:-0}"
BUILD_IMAGE="${BUILD_IMAGE:-0}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ "${BUILD_APP}" == "1" ]]; then
  npm run build
fi

if [[ "${BUILD_IMAGE}" == "1" ]]; then
  ./container/build.sh
fi

npm run serve
