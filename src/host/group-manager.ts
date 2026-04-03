import fs from "node:fs/promises";
import path from "node:path";

import { ensureDefaultGroupAssets } from "../groups/default-groups.js";
import type { RegisteredGroup } from "../types/host.js";

export interface ManagedGroupPaths {
  id: string;
  createdAt: string;
  workspacePath: string;
  memoryPath: string;
  sessionsPath: string;
  globalMemoryFile: string;
  groupMemoryFile: string;
  logsPath: string;
}

export class GroupManager {
  public constructor(
    private readonly groupsRoot: string,
    private readonly sessionsRoot: string,
    private readonly logsRoot: string
  ) {}

  public async ensureGroup(group: RegisteredGroup): Promise<ManagedGroupPaths> {
    await ensureDefaultGroupAssets(this.groupsRoot);

    const workspacePath = path.join(this.groupsRoot, group.folder);
    const sessionsPath = path.join(this.sessionsRoot, group.folder);
    const logsPath = path.join(this.logsRoot, group.folder);
    const globalMemoryFile = path.join(this.groupsRoot, "global", "CLAUDE.md");
    const groupMemoryFile = path.join(workspacePath, "CLAUDE.md");

    await Promise.all([
      fs.mkdir(workspacePath, { recursive: true }),
      fs.mkdir(sessionsPath, { recursive: true }),
      fs.mkdir(logsPath, { recursive: true })
    ]);

    await Promise.all([
      this.ensureFile(globalMemoryFile),
      this.ensureGroupMemory(groupMemoryFile, group)
    ]);

    return {
      id: group.id,
      createdAt: group.createdAt,
      workspacePath,
      memoryPath: workspacePath,
      sessionsPath,
      globalMemoryFile,
      groupMemoryFile,
      logsPath
    };
  }

  private async ensureFile(filePath: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "", { flag: "a" });
  }

  private async ensureGroupMemory(filePath: string, group: RegisteredGroup): Promise<void> {
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      return;
    }

    const templatePath =
      group.isMain || group.folder === "main"
        ? path.join(this.groupsRoot, "main", "CLAUDE.md")
        : path.join(this.groupsRoot, "global", "CLAUDE.md");
    const contents = await fs.readFile(templatePath, "utf8").catch(() => "");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, "utf8");
  }
}
