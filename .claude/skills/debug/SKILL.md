# /debug

Diagnose host, scheduler, and container-runner issues in NanoClaw MultiRuntime.

- Start with `npm run dev -- status` and `npm run dev -- verify`.
- Inspect recent remote-control events and scheduled jobs before changing code.
- If the issue is container-only, verify `container/skills/` is mounted and visible to the runner.
