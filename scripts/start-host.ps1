$ErrorActionPreference = "Stop"

param(
  [switch]$BuildApp,
  [switch]$BuildImage
)

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $root

try {
  if ($BuildApp) {
    npm run build
  }

  if ($BuildImage) {
    & (Join-Path $root "scripts/build-agent-image.ps1")
  }

  npm run serve
}
finally {
  Pop-Location
}
