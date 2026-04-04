# Deployment

This document describes how to run the NanoClaw-compatible core in development or integration environments. It does not describe a complete end-user product deployment, because this repository does not yet ship an official production channel implementation.

- `launchd/com.nanoclaw-multiruntime.plist` provides a macOS service template.
- `systemd/nanoclaw-multiruntime.service` provides a Linux service template.
- `container/Dockerfile` builds the core agent runtime image and installs the official `@openai/codex` CLI inside that image.
- `container/build.sh` builds the runner image with either `docker` or `podman`.
- `container/skills/` provides baseline in-container operator skills that are mounted read-only at runtime.
- `setup.sh` and `setup/index.ts` provide bootstrap, status, and verify checks.
- `scripts/start-host.sh` starts the long-running host process with the production `serve` command.

Replace `{{PROJECT_ROOT}}` and `{{NODE_PATH}}` before installation.

## Core Agent Container Path

Set these environment variables before starting the host:

- `NANOCLAW_CONTAINER_EXECUTOR=engine`
- `NANOCLAW_CONTAINER_ENGINE_BINARY=docker` or `podman`
- `NANOCLAW_CONTAINER_IMAGE=nanoclaw-multiruntime-agent:latest`
- `NANOCLAW_AGENT_RUNNER_MODE=codex`
- `NANOCLAW_DEFAULT_TIMEZONE=<iana timezone>`
- `NANOCLAW_CONTAINER_SKILLS_PATH=<host path to container skills>`

At runtime the host will:

1. `run` a detached agent container from `NANOCLAW_CONTAINER_IMAGE`
2. bind-mount the group workspace, session directory, IPC directory, memory files, and any allowlisted extra mounts
3. bind-mount `container/skills` into `/opt/nanoclaw/skills` inside the agent container
4. generate isolated Codex auth material from project-owned `provider_auth`
5. `exec` the agent-runner inside that container
6. stream events back through the IPC directory
7. `rm -f` the container when the task completes or is cancelled

The published GHCR artifact is this agent image. It is intended for a NanoClaw-compatible host or channel fork to launch, not as a standalone product container for end users.

## What Is Not Included

- No official production Web channel
- No official Slack, Telegram, or Feishu channel
- No host image or docker-compose bundle marketed as a complete product deployment

If a future channel repository needs a host image, that image should be treated as an integration artifact for that channel distribution rather than a change in this repository's core-release positioning.

## Verification

Run these commands after configuration changes:

```bash
bash setup.sh
npm run dev -- status
npm run dev -- verify
```

Use `npm run test:container` to run the real container e2e path with the bundled fake Codex binary.
