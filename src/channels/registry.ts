import type { InboundMessage } from "../types/host.js";

export interface Channel {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  ownsExternalId(externalId: string): boolean;
  sendMessage(externalId: string, text: string): Promise<void>;
  setTyping?(externalId: string, isTyping: boolean): Promise<void>;
  syncGroups?(force: boolean): Promise<void>;
}

export interface ChannelOpts {
  onMessage: (message: InboundMessage) => Promise<void>;
}

export type ChannelFactory = (opts: ChannelOpts) => Channel | null;

const registry = new Map<string, ChannelFactory>();

export function registerChannel(name: string, factory: ChannelFactory): void {
  registry.set(name, factory);
}

export function getRegisteredChannelNames(): string[] {
  return [...registry.keys()];
}

export function getChannelFactory(name: string): ChannelFactory | undefined {
  return registry.get(name);
}
