import type { RegisteredGroup } from "../types/host.js";

export interface SandboxExecutionContext {
  workingDirectory: string;
  globalMemoryFile: string;
  groupMemoryFile: string;
  sessionsPath: string;
}

export interface SandboxProvider {
  readonly name: "container" | "local";
  prepare(group: RegisteredGroup): Promise<SandboxExecutionContext>;
}
