import {
  Block,
  ScriptEventCommandMessageAfterEvent,
  Entity,
  system,
  world,
  BlockPermutation,
  PlayerJoinAfterEventSignal,
} from "@minecraft/server";
import { Hasher } from "../type";
import { RandomUtils } from "../RandomUtils";
import { id, Identifier } from "./Identifier";

export class PacketData {
  constructor(data?: {}) {
    this.data = data ?? {};
  }

  readonly data: { [key: string]: any };

  isEmpty(): boolean {
    return Object.keys(this.data).length === 0;
  }

  writeBlockPermutation(
    blockPermutation: BlockPermutation,
    key: string = "blockPermutation"
  ): void {
    this.data[key] = {
      blockName: blockPermutation.type.id,
      states: blockPermutation.getAllStates(),
    };
  }
  readBlockPermutation(key: string = "blockPermutation"): BlockPermutation | undefined {
    const blockPerm = this.data[key];
    if (!blockPerm) return;
    return BlockPermutation.resolve(blockPerm.blockName, blockPerm.states);
  }

  writeDate(date: Date, key: string = "date"): void {
    this.data[key] = date.getTime();
  }
  readDate(key: string = "date"): Date | undefined {
    const date = this.data[key];
    if (!date) return;
    return new Date(date);
  }

  writeBlock(block: Block, key: string = "block"): void {
    this.data[key] = `${block.dimension.id},` + Hasher.stringify(block.location);
  }
  readBlock(key: string = "block"): Block | undefined {
    const block = this.data[key];
    if (!block) return;
    const args = block.split(",");
    const x = Number.parseInt(args.slice(-3, -1)[0]);
    const y = Number.parseInt(args.slice(-2, -1)[0]);
    const z = Number.parseInt(args.slice(-1)[0]);
    const dim = args.slice(-4, -1)[0];
    return world.getDimension(dim).getBlock({ x, y, z });
  }

  writeEntity(entity: Entity, key: string = "entity"): void {
    this.data[key] = entity.id;
  }
  readEntity(key: string = "entity"): Entity | undefined {
    const id = this.data[key];
    if (!id) return;
    return world.getEntity(id);
  }

  read(key: string): string {
    return this.data[key];
  }

  write(key: string, value: any): void {
    this.data[key] = value;
  }
}

export class PacketEvent {
  readonly id: string;
  readonly data: PacketData;

  constructor(id: string, data: PacketData) {
    this.id = id;
    this.data = data;
  }
}

export class PacketReceiveEvent extends PacketEvent {
  response: any;

  constructor(id: string, data: PacketData, response?: any) {
    super(id, data);
    this.response = response ?? null;
  }
}

export interface PacketOptions {
  namespaces?: string[];
}

export interface PacketListener {
  callback: (event: PacketReceiveEvent) => void;
  options?: PacketOptions;
}

export abstract class Packet {
  private static responses = new Map<string, PacketData>();
  private static listeners = new Set<PacketListener>();

  static send(identifier: id, packetData: PacketData, timeout: number = 40): Promise<PacketData> {
    const id = Identifier.parse(identifier).suffix(`.${RandomUtils.id(5)}`);
    const payload = JSON.stringify(packetData.data);
    system.sendScriptEvent(id.toString(), payload);
    return new Promise((resolve, reject) => {
      let c = 0;
      const quit = () => {
        system.clearRun(func);
      };
      const func = system.runInterval(() => {
        c++;
        if (c >= timeout) {
          reject(`Packet '${id}' timed out!`);
          return quit();
        }
        const data = Packet.responses.get(id.toString());
        if (data !== undefined) {
          Packet.responses.delete(id.toString());
          resolve(data);
          return quit();
        }
      });
    });
  }

  static scriptEventReceive(event: ScriptEventCommandMessageAfterEvent): void {
    const args = event.id.split(".");
    if (args.length < 2) return;
    const id = Identifier.parse(args.slice(0, -1).join("."));
    const data = new PacketData(JSON.parse(event.message));
    for (const listener of Packet.listeners) {
      if (
        listener.options &&
        listener.options.namespaces &&
        !listener.options.namespaces.includes(id.namespace)
      )
        continue;
      const pEvent = new PacketReceiveEvent(id.toString(), data);
      listener.callback(pEvent);
      Packet.responses.set(event.id, pEvent.response);
    }
  }

  // TODO: Test in-game
  static subscribe(callback: (event: PacketReceiveEvent) => void, options?: PacketOptions): void {
    Packet.listeners.add({ callback, options });
  }

  // TODO: Test in-game
  static unsubscribe(callback: (event: PacketReceiveEvent) => void, options?: PacketOptions): void {
    Packet.listeners.delete({ callback, options });
  }
}

function setup() {
  system.afterEvents.scriptEventReceive.subscribe(Packet.scriptEventReceive);
}

setup();
