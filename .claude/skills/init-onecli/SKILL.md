# /init-onecli

Prepare the repository for a host-side secret broker integration.

- Verify provider auth status first with `/auth-status` or the storage-backed auth service.
- Keep raw credentials on the host side; do not pass them directly into mounted workspaces.
- When adding a broker, update deployment docs and runtime/provider auth tests together.
