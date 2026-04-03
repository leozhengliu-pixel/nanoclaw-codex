import type { InboundMessage } from "../types/host.js";
import { registerChannel, type Channel, type ChannelOpts } from "./registry.js";

export class LocalDevChannel implements Channel {
  public readonly name = "local-dev";
  private connected = false;
  private readonly sentMessages: Array<{ externalId: string; text: string }> = [];

  public constructor(private readonly opts: ChannelOpts) {}

  public async connect(): Promise<void> {
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public ownsExternalId(externalId: string): boolean {
    return externalId.startsWith("local-dev");
  }

  public async sendMessage(externalId: string, text: string): Promise<void> {
    this.sentMessages.push({ externalId, text });
  }

  public async emitInbound(externalId: string, text: string, senderId = "local-user"): Promise<void> {
    const message: InboundMessage = {
      channel: this.name,
      externalId,
      text,
      senderId
    };
    await this.opts.onMessage(message);
  }

  public getSentMessages(): Array<{ externalId: string; text: string }> {
    return [...this.sentMessages];
  }
}

registerChannel("local-dev", (opts) => new LocalDevChannel(opts));
