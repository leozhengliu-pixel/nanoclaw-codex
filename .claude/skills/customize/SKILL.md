# /customize

Apply focused code changes while preserving the channel registry, container IPC, and skills-as-code conventions.

- Prefer adding new channel capabilities through self-registering channel modules and matching skills.
- Keep scheduled task semantics aligned with `once`, `interval`, and `cron`.
- When changing container behavior, update both `container/skills/` and the host runner path.
