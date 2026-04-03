import type { HostTask } from "../types/host.js";

interface QueueEntry<T> {
  task: HostTask;
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

export class HostQueue {
  private readonly waiting = new Map<string, Array<QueueEntry<unknown>>>();
  private readonly runningGroups = new Set<string>();
  private runningCount = 0;

  public constructor(private readonly maxConcurrency: number) {}

  public enqueue<T>(task: HostTask, run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const entries = this.waiting.get(task.groupId) ?? [];
      entries.push({
        task,
        run: run as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject
      });
      this.waiting.set(task.groupId, entries);
      this.drain();
    });
  }

  private drain(): void {
    if (this.runningCount >= this.maxConcurrency) {
      return;
    }

    for (const [groupId, entries] of this.waiting) {
      if (this.runningCount >= this.maxConcurrency) {
        return;
      }

      if (this.runningGroups.has(groupId) || entries.length === 0) {
        continue;
      }

      const next = entries.shift();
      if (!next) {
        continue;
      }

      if (entries.length === 0) {
        this.waiting.delete(groupId);
      }

      this.runningGroups.add(groupId);
      this.runningCount += 1;

      void next
        .run()
        .then((result) => next.resolve(result))
        .catch((error) => next.reject(error))
        .finally(() => {
          this.runningGroups.delete(groupId);
          this.runningCount -= 1;
          this.drain();
        });
    }
  }
}
