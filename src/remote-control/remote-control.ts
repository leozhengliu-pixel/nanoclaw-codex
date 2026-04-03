import { randomUUID } from "node:crypto";

import type { SqliteStorage } from "../storage/sqlite-storage.js";
import type { RemoteControlEvent } from "../types/host.js";

export class RemoteControlService {
  public constructor(private readonly storage: SqliteStorage) {}

  public record(level: RemoteControlEvent["level"], message: string, details?: Record<string, unknown>): RemoteControlEvent {
    const event = {
      id: randomUUID(),
      level,
      message,
      createdAt: new Date().toISOString()
    } as RemoteControlEvent;
    if (details) {
      event.details = details;
    }
    this.storage.appendRemoteControlEvent(event);
    return event;
  }

  public status(): { recentEvents: RemoteControlEvent[] } {
    return {
      recentEvents: this.storage.listRemoteControlEvents()
    };
  }
}
