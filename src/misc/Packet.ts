import {
  Block,
  Entity,
  world,
  BlockPermutation,
  system,
  ScriptEventCommandMessageAfterEvent,
} from "@minecraft/server";
import { Hasher } from "../type";
import { RandomUtils } from "../RandomUtils";
import { id, Identifier } from "./Identifier";
import { EventSignal } from "../event";

export class PacketData {
  constructor(data?: {}) {
    this.data = data ?? {};
  }

  readonly data: { [key: string]: any };

  isEmpty(): boolean {
    return Object.keys(this.data).length === 0;
  }

  toString(): string {
    return JSON.stringify(this.data);
  }

  static fromString(data: string): PacketData {
    let res = JSON.parse(data);
    if (typeof res !== "object") {
      res = { value: res };
    }
    return new PacketData(res);
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
  readonly body: PacketData;

  constructor(id: string, body: PacketData) {
    this.id = id;
    this.body = body;
  }
}

export class PacketReceiveEvent extends PacketEvent {
  response: any;

  constructor(id: string, data: PacketData, response?: any) {
    super(id, data);
    this.response = response ?? null;
  }
}

// TODO: Add namespace options
export interface PacketReceiveEventOptions {
  namespaces?: string[];
}

export class PacketReceiveEventSignal extends EventSignal<PacketReceiveEvent> {}

export class PacketEvents {
  /**
   * This event fires when a packet is received.
   */
  static readonly receive = new PacketReceiveEventSignal();
}

export class Packet {
  private static responses = new Map<string, any>();

  static send(identifier: id, data: PacketData, timeout: number = 20): Promise<any> {
    const id = Identifier.parse(identifier);
    const pId = `packet:${RandomUtils.uuid()}`;
    const payload = JSON.stringify({
      headers: { id: id.toString(), type: "request" },
      body: data instanceof PacketData ? data.data : data,
    });
    const k = pId.toString();
    system.sendScriptEvent(pId, payload);
    return new Promise((resolve, reject) => {
      let c = 0;
      const runId = system.runInterval(() => {
        c++;
        if (c >= timeout) {
          reject(`Packet '${id}' timed out!`);
          return system.clearRun(runId);
        }

        if (Packet.responses.has(k)) {
          const data = Packet.responses.get(k);
          Packet.responses.delete(k);
          resolve(data);
          return system.clearRun(runId);
        }
      });
    });
  }

  static packetReceive(event: ScriptEventCommandMessageAfterEvent): void {
    const sId = Identifier.parse(event.id);
    const data = JSON.parse(event.message);
    const pData = new PacketData(data.body);
    const id = Identifier.parse(data.headers.id);

    switch (data.headers.type) {
      case "request": // dst
        const pEvent = new PacketReceiveEvent(id.toString(), pData);
        PacketEvents.receive.apply(pEvent);
        if (!pEvent.response) return;
        const payload = JSON.stringify({
          headers: { id: id.toString(), type: "response" },
          body: pEvent.response instanceof PacketData ? pEvent.response.data : pEvent.response,
        });
        system.sendScriptEvent(sId.toString(), payload);
        return;
      case "response": // src
        Packet.responses.set(sId.toString(), pData);
        return;
      default:
        throw Error(`'${data.headers.type}' is not a valid packet type!`);
    }
  }
}

function setup() {
  system.afterEvents.scriptEventReceive.subscribe(Packet.packetReceive, { namespaces: ["packet"] });
}

setup();
