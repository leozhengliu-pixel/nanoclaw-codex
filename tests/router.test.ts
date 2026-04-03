import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { MainLocalChannel } from "../src/channels/main-local-channel.js";
import { createTempDir, createTestConfig } from "./test-utils.js";

describe("router", () => {
  it("ignores unregistered groups and records a remote control event", async () => {
    const root = await createTempDir("nanoclaw-router-");
    const app = await createApp(createTestConfig(root));

    try {
      await app.router.handleInbound({
        channel: "local-dev",
        externalId: "local-dev:missing",
        text: "@Andy hello"
      });
      expect(app.remoteControl.status().recentEvents[0]?.message).toContain("Ignoring message");
    } finally {
      await app.stop();
    }
  });

  it("main-local remote-status command replies on the same channel", async () => {
    const root = await createTempDir("nanoclaw-router-main-");
    const app = await createApp(createTestConfig(root));

    try {
      const channel = app.channels.get("main-local") as MainLocalChannel;
      await channel.emitInbound("main-local:control", "/remote-status");
      expect(channel.getSentMessages().length).toBeGreaterThan(0);
    } finally {
      await app.stop();
    }
  });
});
