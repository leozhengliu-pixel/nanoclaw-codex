import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { RuntimeEventEnvelope, ToolRequestEnvelope, ToolResponseEnvelope } from "../../../src/ipc/protocol.js";

type ToolName =
  | "schedule_task"
  | "list_tasks"
  | "get_task"
  | "pause_task"
  | "resume_task"
  | "cancel_task"
  | "send_message"
  | "register_group"
  | "list_groups"
  | "sync_groups"
  | "update_group_mounts";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function toolNames(): ToolName[] {
  return [
    "schedule_task",
    "list_tasks",
    "get_task",
    "pause_task",
    "resume_task",
    "cancel_task",
    "send_message",
    "register_group",
    "list_groups",
    "sync_groups",
    "update_group_mounts"
  ];
}

function applyDefaultArgs(name: ToolName, args: Record<string, unknown>, defaultGroupId: string): Record<string, unknown> {
  const next = { ...args };
  if (
    (name === "schedule_task" || name === "list_tasks" || name === "send_message" || name === "update_group_mounts") &&
    typeof next.groupId !== "string"
  ) {
    next.groupId = defaultGroupId;
  }
  return next;
}

async function appendEvent(eventsFile: string, taskId: string, event: RuntimeEventEnvelope["event"]): Promise<void> {
  const envelope: RuntimeEventEnvelope = { taskId, event };
  await fs.appendFile(eventsFile, `${JSON.stringify(envelope)}\n`);
}

async function requestTool(
  ipcDir: string,
  taskId: string,
  payload: ToolRequestEnvelope["payload"]
): Promise<ToolResponseEnvelope> {
  const id = randomUUID();
  const requestPath = path.join(ipcDir, "tool-requests", `${id}.json`);
  const responsePath = path.join(ipcDir, "tool-responses", `${id}.json`);
  const request: ToolRequestEnvelope = { id, taskId, payload };
  await fs.writeFile(requestPath, JSON.stringify(request, null, 2));

  while (true) {
    const exists = await fs
      .access(responsePath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      return JSON.parse(await fs.readFile(responsePath, "utf8")) as ToolResponseEnvelope;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

function printHelp(defaultGroupId: string): void {
  process.stdout.write(
    JSON.stringify(
      {
        command: "nanoclaw-tool",
        defaultGroupId,
        usage: 'nanoclaw-tool <tool_name> [json_args]',
        examples: [
          "nanoclaw-tool capabilities",
          'nanoclaw-tool list_tasks',
          'nanoclaw-tool send_message \'{\"text\":\"hello from tool\"}\'',
          'nanoclaw-tool schedule_task \'{\"prompt\":\"ping me later\",\"scheduleType\":\"once\",\"scheduleValue\":\"2026-04-05T09:00:00.000Z\"}\''
        ],
        toolNames: toolNames()
      },
      null,
      2
    ) + "\n"
  );
}

async function main(): Promise<void> {
  const ipcDir = requiredEnv("NANOCLAW_TOOL_IPC_DIR");
  const taskId = requiredEnv("NANOCLAW_TOOL_TASK_ID");
  const eventsFile = requiredEnv("NANOCLAW_TOOL_EVENTS_FILE");
  const defaultGroupId = requiredEnv("NANOCLAW_TOOL_DEFAULT_GROUP_ID");

  const [rawName, rawArgs] = process.argv.slice(2);
  if (!rawName || rawName === "--help" || rawName === "help" || rawName === "capabilities") {
    printHelp(defaultGroupId);
    return;
  }

  if (!toolNames().includes(rawName as ToolName)) {
    throw new Error(`Unsupported tool name: ${rawName}`);
  }

  const parsedArgs =
    rawArgs && rawArgs.trim()
      ? (JSON.parse(rawArgs) as Record<string, unknown>)
      : {};
  const args = applyDefaultArgs(rawName as ToolName, parsedArgs, defaultGroupId);

  await appendEvent(eventsFile, taskId, {
    type: "tool_call",
    name: rawName,
    payload: args
  });

  const response = await requestTool(ipcDir, taskId, {
    name: rawName as ToolName,
    args
  });

  if (!response.ok) {
    await appendEvent(eventsFile, taskId, {
      type: "tool_result",
      name: rawName,
      payload: { ok: false, error: response.error ?? "Tool request failed" }
    });
    throw new Error(response.error ?? "Tool request failed");
  }

  await appendEvent(eventsFile, taskId, {
    type: "tool_result",
    name: rawName,
    payload: response.result ?? null
  });

  if (typeof response.result === "string") {
    process.stdout.write(`${response.result}\n`);
    return;
  }

  process.stdout.write(`${JSON.stringify(response.result ?? null, null, 2)}\n`);
}

await main();
