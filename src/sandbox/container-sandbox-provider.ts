import type { GroupManager } from "../host/group-manager.js";
import type { RegisteredGroup } from "../types/host.js";
import type { SandboxExecutionContext, SandboxProvider } from "./provider.js";

export class ContainerSandboxProvider implements SandboxProvider {
  public readonly name = "container";

  public constructor(private readonly groupManager: GroupManager) {}

  public async prepare(group: RegisteredGroup): Promise<SandboxExecutionContext> {
    const managed = await this.groupManager.ensureGroup(group);
    return {
      workingDirectory: managed.workspacePath,
      globalMemoryFile: managed.globalMemoryFile,
      groupMemoryFile: managed.groupMemoryFile,
      sessionsPath: managed.sessionsPath
    };
  }
}
