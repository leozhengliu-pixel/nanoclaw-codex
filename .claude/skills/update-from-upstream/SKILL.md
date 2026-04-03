# /update-from-upstream

Review upstream NanoClaw changes and port only the required behavior into this repository without overwriting runtime-neutral contracts.

- Compare `reference/nanoclaw` against the current host/runtime boundary before porting changes.
- Preserve MultiRuntime-specific provider abstractions and container IPC contracts.
- Re-run `npm run typecheck` and `npm test` after each imported behavior slice.
