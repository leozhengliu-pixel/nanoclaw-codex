$ErrorActionPreference = "Stop"

$EngineBin = if ($env:ENGINE_BIN) { $env:ENGINE_BIN } else { if ($env:NANOCLAW_CONTAINER_ENGINE_BINARY) { $env:NANOCLAW_CONTAINER_ENGINE_BINARY } else { "docker" } }
$ImageName = if ($env:IMAGE_NAME) { $env:IMAGE_NAME } else { if ($env:NANOCLAW_CONTAINER_IMAGE) { $env:NANOCLAW_CONTAINER_IMAGE } else { "nanoclaw-multiruntime-agent:latest" } }
$CodexPackage = if ($env:CODEX_NPM_PACKAGE) { $env:CODEX_NPM_PACKAGE } else { "@openai/codex" }

& $EngineBin build `
  --build-arg "CODEX_NPM_PACKAGE=$CodexPackage" `
  -t $ImageName `
  -f "container/Dockerfile" `
  .
