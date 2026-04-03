# NanoClaw MultiRuntime

NanoClaw-style personal agent host with a pluggable runtime boundary. The current repository now includes a V2 parity-first shell around the original V1 core:

- channel registry with self-registration
- `local-dev` and `main-local` built-in channels
- registered group model with main-group privileges
- router and outbound dispatch
- file-based container-runner IPC scaffold
- `CodexRuntime` executed through the agent-runner path
- real container-engine execution via `docker`/`podman` compatible `run` + `exec`
- host control plane for tasks, groups, mounts, and outbound messaging
- skills-as-code scaffolding for future channel additions

## Current Shape

This repository is not a full `nanoclaw` clone, and it is not a plugin marketplace. It is a parity-first migration shell that preserves the original NanoClaw operating model while keeping the runtime boundary explicit.

Implemented now:

- `src/channels/registry.ts`: channel contract and self-registration
- `src/router/router.ts`: registered-group lookup, trigger handling, main-local commands, outbound routing
- `src/host/control-plane.ts`: built-in admin/tool bridge
- `src/runner/container-runner.ts`: file-based runner IPC
- `container/agent-runner/src/index.ts`: agent-runner scaffold
- `src/runtime/codex/codex-runtime.ts`: container-executed Codex runtime wrapper
- `src/security/mount-security.ts`: allowlist-based extra mount validation
- `.claude/skills/`: skills-as-code templates
- `container/build.sh` and `scripts/start-host.sh`: production build and startup scripts

Still intentionally out of scope:

- full dashboard UI
- dynamic runtime plugin marketplace
- bundled Slack/Telegram/Gmail SDK integrations in core
- multi-node orchestration or Kubernetes-style scheduling

## Built-in Channels

- `local-dev`
  Use for development and regression tests.
- `main-local`
  Acts as the control channel and supports a minimal command set.

Current main-local commands:

- `/register-group <channel> <externalId> <folder>`
- `/list-groups`
- `/remote-status`

## Configuration

See [`.env.example`](./.env.example) for defaults. Important variables:

- `NANOCLAW_DATA_ROOT`
- `NANOCLAW_GROUPS_ROOT`
- `NANOCLAW_SESSIONS_ROOT`
- `NANOCLAW_IPC_ROOT`
- `NANOCLAW_LOGS_ROOT`
- `NANOCLAW_MAX_CONCURRENCY`
- `NANOCLAW_SCHEDULER_POLL_INTERVAL_MS`
- `NANOCLAW_CODEX_BINARY_PATH`
- `NANOCLAW_RUNTIME_TIMEOUT_MS`
- `NANOCLAW_SANDBOX_PROVIDER`
- `NANOCLAW_CONTAINER_EXECUTOR`
- `NANOCLAW_CONTAINER_ENGINE_BINARY`
- `NANOCLAW_CONTAINER_IMAGE`
- `NANOCLAW_CONTAINER_RUNNER_ENTRYPOINT`
- `NANOCLAW_CONTAINER_RUNNER_PATH_IN_IMAGE`
- `NANOCLAW_AGENT_RUNNER_MODE`
- `NANOCLAW_CODEX_HOME_PATH`
- `NANOCLAW_ASSISTANT_NAME`
- `NANOCLAW_DEFAULT_TRIGGER`
- `NANOCLAW_MOUNT_ALLOWLIST_PATH`

Recommended modes:

- local regression: `NANOCLAW_CONTAINER_EXECUTOR=process` and `NANOCLAW_AGENT_RUNNER_MODE=mock`
- production container path: `NANOCLAW_CONTAINER_EXECUTOR=engine` and `NANOCLAW_AGENT_RUNNER_MODE=codex`

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run test
```

Build the runner image:

```bash
npm run build:image
```

Start the long-running host service:

```bash
npm run start:host
```

Send a local-dev message:

```bash
npm run dev -- send --channel local-dev --external-id local-dev:default --message "@Andy hello"
```

Use the control channel:

```bash
npm run dev -- send --channel main-local --external-id main-local:control --message "/list-groups"
```

Schedule a one-shot task:

```bash
npm run dev -- schedule-once --group-id <group-id> --message "Follow up" --delay-ms 0
```

Create a fixed-interval recurring task:

```bash
npm run dev -- schedule-recurring --group-id <group-id> --message "Recurring follow-up" --interval-ms 60000
```

## Container and Deployment Assets

- `container/Dockerfile`
- `container/build.sh`
- `container/test-bin/fake-codex`
- `container/agent-runner/`
- `scripts/start-host.sh`
- `launchd/com.nanoclaw-multiruntime.plist`
- `systemd/nanoclaw-multiruntime.service`
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

## Reference Docs

- [Technical Architecture](./docs/ARCHITECTURE.md)
- [V1 Development Breakdown](./docs/V1_TASKS.md)
- [Deployment](./docs/DEPLOYMENT.md)
