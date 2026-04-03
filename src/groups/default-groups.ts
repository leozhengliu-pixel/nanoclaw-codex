import fs from "node:fs/promises";
import path from "node:path";

const GLOBAL_TEMPLATE = `# Global Memory

This file stores shared operating context for every group.

- Keep durable preferences and policies here.
- Put group-specific memory in that group's own CLAUDE.md.
`;

const MAIN_TEMPLATE = `# Main Group

This is the private control group for NanoClaw MultiRuntime.

- Use it for admin commands and operational checks.
- Register new groups and inspect auth, status, and scheduled tasks here.
`;

async function ensureFile(filePath: string, contents: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    return;
  }

  await fs.writeFile(filePath, contents, "utf8");
}

export async function ensureDefaultGroupAssets(groupsRoot: string): Promise<void> {
  await Promise.all([
    ensureFile(path.join(groupsRoot, "global", "CLAUDE.md"), GLOBAL_TEMPLATE),
    ensureFile(path.join(groupsRoot, "main", "CLAUDE.md"), MAIN_TEMPLATE)
  ]);
}
