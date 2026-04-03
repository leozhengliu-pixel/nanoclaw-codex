import { createApp } from "./app.js";
import { LocalDevChannel } from "./channels/local-dev-channel.js";
import { MainLocalChannel } from "./channels/main-local-channel.js";

function getFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help") {
    console.log(`Usage:
  npm run dev -- serve
  npm run dev -- send --channel <local-dev|main-local> --external-id <id> --message <text>
  npm run dev -- schedule-once --group-id <groupId> --message <text> [--delay-ms <ms>]
  npm run dev -- schedule-recurring --group-id <groupId> --message <text> --interval-ms <ms>`);
    return;
  }

  const app = await createApp();

  try {
    if (command === "send") {
      const channelName = getFlag(args, "--channel") ?? "local-dev";
      const externalId = getFlag(args, "--external-id") ?? (channelName === "main-local" ? "main-local:control" : "local-dev:default");
      const message = getFlag(args, "--message");
      if (!message) {
        throw new Error("--message is required");
      }

      const channel = app.channels.get(channelName);
      if (!channel) {
        throw new Error(`Unknown channel: ${channelName}`);
      }

      if (channel instanceof LocalDevChannel || channel instanceof MainLocalChannel) {
        await channel.emitInbound(externalId, message);
        console.log(JSON.stringify({ ok: true }, null, 2));
        return;
      }

      throw new Error(`Channel ${channelName} does not support local emit`);
    }

    if (command === "serve") {
      app.scheduler.start();
      console.log(JSON.stringify({ ok: true, mode: "serve" }, null, 2));
      await new Promise<void>((resolve) => {
        const shutdown = () => resolve();
        process.once("SIGINT", shutdown);
        process.once("SIGTERM", shutdown);
      });
      return;
    }

    if (command === "schedule-once") {
      const groupId = getFlag(args, "--group-id");
      const message = getFlag(args, "--message");
      if (!groupId || !message) {
        throw new Error("--group-id and --message are required");
      }

      const delayMs = Number.parseInt(getFlag(args, "--delay-ms") ?? "0", 10);
      const job = app.scheduler.createOneShot(groupId, message, new Date(Date.now() + delayMs));
      await app.scheduler.tick(new Date(job.nextRunAt));
      console.log(JSON.stringify(job, null, 2));
      return;
    }

    if (command === "schedule-recurring") {
      const groupId = getFlag(args, "--group-id");
      const message = getFlag(args, "--message");
      const intervalMs = Number.parseInt(getFlag(args, "--interval-ms") ?? "", 10);
      if (!groupId || !message || !Number.isFinite(intervalMs) || intervalMs <= 0) {
        throw new Error("--group-id, --message, and a positive --interval-ms are required");
      }

      const job = app.scheduler.createRecurring(groupId, message, intervalMs);
      console.log(JSON.stringify(job, null, 2));
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await app.stop();
  }
}

void main();
