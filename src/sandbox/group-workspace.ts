import fs from "node:fs/promises";
import path from "node:path";

export interface GroupPaths {
  rootPath: string;
  workspacePath: string;
  memoryPath: string;
  sessionsPath: string;
}

export async function ensureGroupPaths(dataRoot: string, groupId: string): Promise<GroupPaths> {
  const rootPath = path.join(dataRoot, "groups", groupId);
  const workspacePath = path.join(rootPath, "workspace");
  const memoryPath = path.join(rootPath, "memory");
  const sessionsPath = path.join(rootPath, "sessions");

  await Promise.all([
    fs.mkdir(workspacePath, { recursive: true }),
    fs.mkdir(memoryPath, { recursive: true }),
    fs.mkdir(sessionsPath, { recursive: true })
  ]);

  return {
    rootPath,
    workspacePath,
    memoryPath,
    sessionsPath
  };
}

export async function listMemoryFiles(memoryPath: string): Promise<string[]> {
  const entries = await fs.readdir(memoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(memoryPath, entry.name))
    .sort();
}
