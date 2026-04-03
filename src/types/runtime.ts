import type { RegisteredGroup } from "./host.js";

export type RuntimeMessageRole = "system" | "user" | "assistant";
export type RuntimeExecutionMode = "host" | "container";

export interface RuntimeMessage {
  role: RuntimeMessageRole;
  content: string;
}

export interface RuntimeToolSpec {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface PersistedRuntimeSession {
  id: string;
  runtimeName: string;
  groupId: string;
  externalSessionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeSessionInput {
  groupId: string;
  group?: RegisteredGroup;
  workingDirectory: string;
  memoryFiles: string[];
  runtimeTimeoutMs: number;
  systemInstructions?: string;
  sessionHint?: PersistedRuntimeSession | null;
}

export interface RuntimeSession {
  id: string;
  externalSessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface RuntimeTurnInput {
  taskId?: string;
  sessionId: string;
  group?: RegisteredGroup;
  workingDirectory: string;
  messages: RuntimeMessage[];
  memoryFiles: string[];
  sessionsPath?: string;
  tools?: RuntimeToolSpec[];
}

export interface RuntimeCapabilities {
  executionMode: RuntimeExecutionMode;
  structuredToolEvents: boolean;
  supportsSessionResume: boolean;
  supportsToolEvents: boolean;
  supportsHardCancel: boolean;
  streamingText: boolean;
}

export type RuntimeEvent =
  | { type: "status"; value: string }
  | { type: "message"; text: string }
  | { type: "tool_call"; name: string; payload: unknown }
  | { type: "tool_result"; name: string; payload: unknown }
  | { type: "error"; error: string }
  | { type: "done"; usage?: unknown };

export interface AgentRuntime {
  readonly name: string;
  createSession(input: RuntimeSessionInput): Promise<RuntimeSession>;
  runTurn(input: RuntimeTurnInput): AsyncIterable<RuntimeEvent>;
  cancel(sessionId: string): Promise<void>;
  close(sessionId: string): Promise<void>;
  capabilities(): RuntimeCapabilities;
}
