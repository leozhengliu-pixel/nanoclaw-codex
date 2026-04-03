# Deployment

- `launchd/com.nanoclaw-multiruntime.plist` provides a macOS service template.
- `systemd/nanoclaw-multiruntime.service` provides a Linux service template.
- `container/Dockerfile` installs the host app dependencies and the official `@openai/codex` CLI inside the agent image.
- `container/build.sh` builds the runner image with either `docker` or `podman`.
- `scripts/start-host.sh` starts the long-running host process with the production `serve` command.

Replace `{{PROJECT_ROOT}}` and `{{NODE_PATH}}` before installation.

## Production Container Path

Set these environment variables before starting the host:

- `NANOCLAW_CONTAINER_EXECUTOR=engine`
- `NANOCLAW_CONTAINER_ENGINE_BINARY=docker` or `podman`
- `NANOCLAW_CONTAINER_IMAGE=nanoclaw-multiruntime-agent:latest`
- `NANOCLAW_AGENT_RUNNER_MODE=codex`
- `NANOCLAW_CODEX_HOME_PATH=<host path containing Codex auth state>`

At runtime the host will:

1. `run` a detached agent container from `NANOCLAW_CONTAINER_IMAGE`
2. bind-mount the group workspace, session directory, IPC directory, memory files, Codex home, and any allowlisted extra mounts
3. `exec` the agent-runner inside that container
4. stream events back through the IPC directory
5. `rm -f` the container when the task completes or is cancelled

Use `npm run test:container` to run the real container e2e path with the bundled fake Codex binary.
