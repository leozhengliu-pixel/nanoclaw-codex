# /setup

Run the bootstrap and verification flow for NanoClaw MultiRuntime.

- Run `bash setup.sh` first if dependencies may be missing.
- Use `npm run setup -- --step environment` to verify the runtime prerequisites.
- Use `npm run setup -- --step groups` to ensure default `groups/global` and `groups/main` memory files exist.
- Use `npm run dev -- verify` before telling the operator the install is healthy.
