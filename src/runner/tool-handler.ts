import type { RemoteControlRecorder } from "../control-events.js";
import type { ToolRequestEnvelope, ToolResponseEnvelope } from "../ipc/protocol.js";

export interface ToolRequestContext {
  sourceGroupId: string;
  isMainGroup: boolean;
}

export interface ToolHandlerControlPlane {
  resolveRequestContext(taskId: string): ToolRequestContext;
  getGroup(groupId: string): {
    id: string;
    isMain: boolean;
    folder: string;
  } | null;
  scheduleJob(input: {
    sourceGroupId: string;
    groupId: string;
    prompt: string;
    scheduleType: "once" | "interval" | "cron";
    scheduleValue: string;
    timezone?: string;
    contextMode?: "group" | "isolated";
    script?: string;
  }): unknown;
  scheduleTask(input: {
    sourceGroupId: string;
    groupId: string;
    prompt: string;
    intervalMs?: number;
    runAt?: string;
    contextMode?: "group" | "isolated";
    script?: string;
  }): unknown;
  listTasks(sourceGroupId: string, groupId?: string): unknown;
  getTask(sourceGroupId: string, taskId: string): unknown;
  pauseTask(sourceGroupId: string, taskId: string): void;
  resumeTask(sourceGroupId: string, taskId: string): void;
  cancelTask(sourceGroupId: string, taskId: string): void;
  sendMessage(sourceGroupId: string, groupId: string, text: string): Promise<void>;
  registerGroup(input: {
    sourceGroupId: string;
    channel: string;
    externalId: string;
    folder: string;
    trigger: string;
    requiresTrigger?: boolean;
  }): unknown;
  listGroups(sourceGroupId: string): unknown;
  syncGroups(sourceGroupId: string, force: boolean): Promise<void>;
  updateGroupMounts(sourceGroupId: string, groupId: string, containerConfig: {
    additionalMounts: Array<unknown>;
  }): void;
}

export class RunnerToolHandler {
  public constructor(
    private readonly controlPlane: ToolHandlerControlPlane,
    private readonly remoteControl: RemoteControlRecorder
  ) {}

  public async handleToolRequest(request: ToolRequestEnvelope): Promise<ToolResponseEnvelope> {
    try {
      const result = await this.dispatch(request);
      this.remoteControl.record("info", `Handled tool request ${request.payload.name}`, {
        taskId: request.taskId
      });
      return {
        id: request.id,
        ok: true,
        result
      };
    } catch (error) {
      return {
        id: request.id,
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async dispatch(request: ToolRequestEnvelope): Promise<unknown> {
    const { name, args } = request.payload;
    const context = this.controlPlane.resolveRequestContext(request.taskId);
    switch (name) {
      case "schedule_task":
        if (typeof args.scheduleType === "string" && typeof args.scheduleValue === "string") {
          return this.controlPlane.scheduleJob({
            sourceGroupId: context.sourceGroupId,
            groupId: String(args.groupId),
            prompt: String(args.prompt),
            scheduleType: args.scheduleType as "once" | "interval" | "cron",
            scheduleValue: args.scheduleValue,
            ...(typeof args.timezone === "string" ? { timezone: args.timezone } : {}),
            ...(args.context_mode === "group" || args.context_mode === "isolated" ? { contextMode: args.context_mode } : {}),
            ...(typeof args.script === "string" ? { script: args.script } : {})
          });
        }

        return this.controlPlane.scheduleTask({
          sourceGroupId: context.sourceGroupId,
          groupId: String(args.groupId),
          prompt: String(args.prompt),
          ...(typeof args.intervalMs === "number" ? { intervalMs: args.intervalMs } : {}),
          ...(typeof args.runAt === "string" ? { runAt: args.runAt } : {}),
          ...(args.context_mode === "group" || args.context_mode === "isolated" ? { contextMode: args.context_mode } : {}),
          ...(typeof args.script === "string" ? { script: args.script } : {})
        });
      case "list_tasks":
        return this.controlPlane.listTasks(context.sourceGroupId, typeof args.groupId === "string" ? args.groupId : undefined);
      case "get_task":
        return this.controlPlane.getTask(context.sourceGroupId, String(args.taskId ?? args.id));
      case "pause_task":
        this.controlPlane.pauseTask(context.sourceGroupId, String(args.taskId));
        return { ok: true };
      case "resume_task":
        this.controlPlane.resumeTask(context.sourceGroupId, String(args.taskId));
        return { ok: true };
      case "cancel_task":
        this.controlPlane.cancelTask(context.sourceGroupId, String(args.taskId));
        return { ok: true };
      case "send_message":
        await this.controlPlane.sendMessage(context.sourceGroupId, String(args.groupId), String(args.text));
        return { ok: true };
      case "register_group":
        return this.controlPlane.registerGroup({
          sourceGroupId: context.sourceGroupId,
          channel: String(args.channel),
          externalId: String(args.externalId),
          folder: String(args.folder),
          trigger: String(args.trigger),
          ...(typeof args.requiresTrigger === "boolean" ? { requiresTrigger: args.requiresTrigger } : {})
        });
      case "list_groups":
        return this.controlPlane.listGroups(context.sourceGroupId);
      case "sync_groups":
        await this.controlPlane.syncGroups(context.sourceGroupId, args.force !== false);
        return { ok: true };
      case "update_group_mounts":
        this.controlPlane.updateGroupMounts(context.sourceGroupId, String(args.groupId), {
          additionalMounts: Array.isArray(args.additionalMounts) ? (args.additionalMounts as never[]) : []
        });
        return { ok: true };
      default:
        throw new Error(`Unsupported tool request: ${String(name)}`);
    }
  }
}
