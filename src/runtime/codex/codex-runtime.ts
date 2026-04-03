import { randomUUID } from "node:crypto";

import type { ContainerRunner } from "../../runner/container-runner.js";
import type {
  AgentRuntime,
  RuntimeCapabilities,
  RuntimeEvent,
  RuntimeSession,
  RuntimeSessionInput,
  RuntimeTurnInput
} from "../../types/runtime.js";

export class CodexRuntime implements AgentRuntime {
  public readonly name = "codex";
  private readonly cancelled = new Set<string>();

  public constructor(
    private readonly binaryPath: string,
    private readonly defaultTimeoutMs: number,
    private runner?: ContainerRunner
  ) {}

  public attachRunner(runner: ContainerRunner): void {
    this.runner = runner;
  }

  public async createSession(input: RuntimeSessionInput): Promise<RuntimeSession> {
    const sessionId = randomUUID();
    if (input.sessionHint?.externalSessionId) {
      return {
        id: sessionId,
        externalSessionId: input.sessionHint.externalSessionId,
        metadata: { resumedFromHint: true }
      };
    }

    return {
      id: sessionId,
      metadata: { executionMode: "container" }
    };
  }

  public async *runTurn(input: RuntimeTurnInput): AsyncIterable<RuntimeEvent> {
    if (!input.group) {
      throw new Error("CodexRuntime requires group context for container execution");
    }
    if (!this.runner) {
      throw new Error("CodexRuntime runner is not attached");
    }

    for await (const event of this.runner.run({
      taskId: input.taskId ?? input.sessionId,
      sessionId: input.sessionId,
      group: input.group,
      workingDirectory: input.workingDirectory,
      globalMemoryFile: input.memoryFiles[0] ?? "",
      groupMemoryFile: input.memoryFiles[1] ?? "",
      sessionsPath: input.sessionsPath ?? "",
      messages: input.messages,
      codexBinaryPath: this.binaryPath,
      runtimeTimeoutMs: this.defaultTimeoutMs,
      mode: process.env.NANOCLAW_AGENT_RUNNER_MODE === "mock" ? "mock" : "codex",
      containerConfig: input.group.containerConfig
    })) {
      if (this.cancelled.has(input.sessionId)) {
        yield { type: "error", error: "cancelled" };
        yield { type: "done" };
        return;
      }

      yield event;
    }
  }

  public async cancel(sessionId: string): Promise<void> {
    this.cancelled.add(sessionId);
    await this.runner?.cancel(sessionId);
  }

  public async close(sessionId: string): Promise<void> {
    this.cancelled.delete(sessionId);
  }

  public capabilities(): RuntimeCapabilities {
    return {
      executionMode: "container",
      structuredToolEvents: false,
      supportsSessionResume: false,
      supportsToolEvents: true,
      supportsHardCancel: false,
      streamingText: false
    };
  }
}
