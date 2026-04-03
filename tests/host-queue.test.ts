import { describe, expect, it } from "vitest";

import { HostQueue } from "../src/host/host-queue.js";
import type { HostTask } from "../src/types/host.js";

function createTask(id: string, groupId: string): HostTask {
  return {
    id,
    groupId,
    kind: "message",
    prompt: id,
    messages: [{ role: "user", content: id }],
    createdAt: new Date().toISOString()
  };
}

describe("HostQueue", () => {
  it("serializes tasks within a group", async () => {
    const queue = new HostQueue(2);
    const order: string[] = [];

    const first = queue.enqueue(createTask("a", "g1"), async () => {
      order.push("start-a");
      await new Promise((resolve) => setTimeout(resolve, 50));
      order.push("end-a");
      return "a";
    });

    const second = queue.enqueue(createTask("b", "g1"), async () => {
      order.push("start-b");
      order.push("end-b");
      return "b";
    });

    await Promise.all([first, second]);
    expect(order).toEqual(["start-a", "end-a", "start-b", "end-b"]);
  });

  it("enforces global max concurrency across groups", async () => {
    const queue = new HostQueue(2);
    let current = 0;
    let maxSeen = 0;

    const run = async () => {
      current += 1;
      maxSeen = Math.max(maxSeen, current);
      await new Promise((resolve) => setTimeout(resolve, 30));
      current -= 1;
    };

    await Promise.all([
      queue.enqueue(createTask("a", "g1"), run),
      queue.enqueue(createTask("b", "g2"), run),
      queue.enqueue(createTask("c", "g3"), run)
    ]);

    expect(maxSeen).toBe(2);
  });
});
