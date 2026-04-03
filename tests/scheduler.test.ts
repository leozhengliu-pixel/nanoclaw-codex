import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { RunnerToolHandler } from "../src/runner/tool-handler.js";
import { MockRuntime } from "../src/runtime/mock/mock-runtime.js";
import { createTempDir, createTestConfig } from "./test-utils.js";

describe("scheduler and tool bridge", () => {
  it("executes one-shot jobs through the same host path", async () => {
    const root = await createTempDir("nanoclaw-v2-scheduler-");
    const app = await createApp(
      createTestConfig(root),
      new MockRuntime({ messagePrefix: "scheduler" })
    );

    try {
      const group = app.storage.getRegisteredGroupByAddress("local-dev", "local-dev:default");
      const job = app.scheduler.createOneShot(group!.id, "scheduled hello", new Date(Date.now() - 1));
      await app.scheduler.tick(new Date());

      const stored = app.storage.getScheduledJob(job.id);
      expect(stored?.active).toBe(false);
      expect(app.storage.listTasks(group!.id).length).toBe(1);
    } finally {
      await app.stop();
    }
  });

  it("runner tool handler can list tasks through the control plane", async () => {
    const root = await createTempDir("nanoclaw-v2-tools-");
    const app = await createApp(
      createTestConfig(root),
      new MockRuntime({ messagePrefix: "tool" })
    );

    try {
      const group = app.storage.getRegisteredGroupByAddress("local-dev", "local-dev:default");
      await app.host.enqueueScheduledPrompt(group!.id, "hello tools");

      const handler = new RunnerToolHandler(app.controlPlane, app.remoteControl);
      const response = await handler.handleToolRequest({
        id: "req-1",
        taskId: "task-1",
        payload: {
          name: "list_tasks",
          args: { groupId: group!.id }
        }
      });

      expect(response.ok).toBe(true);
      expect(Array.isArray(response.result)).toBe(true);
      expect((response.result as unknown[]).length).toBeGreaterThan(0);
    } finally {
      await app.stop();
    }
  });
});
