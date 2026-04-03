import { randomUUID } from "node:crypto";

import { CronExpressionParser } from "cron-parser";

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
      const nextRunAt = this.computeNextRunAt(job, now);
      this.storage.markScheduledJobRun(job.id, nextRunAt, ranAt);
    }
  }

  public createOnce(groupId: string, prompt: string, runAt: Date): ScheduledJob {
    const job: ScheduledJob = {
      id: randomUUID(),
      groupId,
      prompt,
      kind: "once",
      nextRunAt: runAt.toISOString(),
      active: true,
      createdAt: new Date().toISOString()
    };
    this.storage.createScheduledJob(job);
    return job;
  }

  public createInterval(groupId: string, prompt: string, intervalMs: number): ScheduledJob {
    const job: ScheduledJob = {
      id: randomUUID(),
      groupId,
      prompt,
      kind: "interval",
      nextRunAt: new Date(Date.now() + intervalMs).toISOString(),
      intervalMs,
      active: true,
      createdAt: new Date().toISOString()
    };
    this.storage.createScheduledJob(job);
    return job;
  }

  public createCron(groupId: string, prompt: string, cronExpression: string, timezone: string): ScheduledJob {
    const job: ScheduledJob = {
      id: randomUUID(),
      groupId,
      prompt,
      kind: "cron",
      nextRunAt: this.getNextCronRunAt(cronExpression, timezone, new Date()),
      cronExpression,
      timezone,
      active: true,
      createdAt: new Date().toISOString()
    };
    this.storage.createScheduledJob(job);
    return job;
  }

  private computeNextRunAt(job: ScheduledJob, now: Date): string | null {
    if (job.kind === "interval" && job.intervalMs) {
      return new Date(now.getTime() + job.intervalMs).toISOString();
    }

    if (job.kind === "cron" && job.cronExpression) {
      return this.getNextCronRunAt(job.cronExpression, job.timezone ?? "UTC", now);
    }

    return null;
  }

  private getNextCronRunAt(expression: string, timezone: string, now: Date): string {
    const normalizedExpression = this.normalizeCronExpression(expression);
    const interval = CronExpressionParser.parse(normalizedExpression, {
      currentDate: now,
      strict: true,
      tz: timezone
    });
    const next = interval.next();
    return next.toISOString() ?? next.toDate().toISOString();
  }

  private normalizeCronExpression(expression: string): string {
    const trimmed = expression.trim();
    const fields = trimmed.split(/\s+/);
    if (fields.length === 5) {
      return `0 ${trimmed}`;
    }

    return trimmed;
  }
}
