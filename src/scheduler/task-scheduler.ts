import { randomUUID } from "node:crypto";

import type { HostService } from "../host/host-service.js";
import type { SqliteStorage } from "../storage/sqlite-storage.js";
import type { ScheduledJob } from "../types/host.js";

export class TaskScheduler {
  private timer: NodeJS.Timeout | undefined;

  public constructor(
    private readonly storage: SqliteStorage,
    private readonly host: HostService,
    private readonly pollIntervalMs: number
  ) {}

  public start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.tick();
    }, this.pollIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  public async tick(now = new Date()): Promise<void> {
    const dueJobs = this.storage.getDueScheduledJobs(now.toISOString());
    for (const job of dueJobs) {
      await this.host.enqueueScheduledPrompt(job.groupId, job.prompt, job.id);
      const ranAt = new Date().toISOString();
      const nextRunAt =
        job.kind === "recurring" && job.intervalMs
          ? new Date(now.getTime() + job.intervalMs).toISOString()
          : null;
      this.storage.markScheduledJobRun(job.id, nextRunAt, ranAt);
    }
  }

  public createOneShot(groupId: string, prompt: string, runAt: Date): ScheduledJob {
    const job: ScheduledJob = {
      id: randomUUID(),
      groupId,
      prompt,
      kind: "one-shot",
      nextRunAt: runAt.toISOString(),
      active: true,
      createdAt: new Date().toISOString()
    };
    this.storage.createScheduledJob(job);
    return job;
  }

  public createRecurring(groupId: string, prompt: string, intervalMs: number): ScheduledJob {
    const job: ScheduledJob = {
      id: randomUUID(),
      groupId,
      prompt,
      kind: "recurring",
      nextRunAt: new Date(Date.now() + intervalMs).toISOString(),
      intervalMs,
      active: true,
      createdAt: new Date().toISOString()
    };
    this.storage.createScheduledJob(job);
    return job;
  }
}
