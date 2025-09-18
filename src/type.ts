/**
 * Generic types.
 */

import { Block, Container, ItemStack, Vector2, Vector3, VectorXZ, world } from "@minecraft/server";
import { Chunk } from "./world/chunk";

export enum TypingTypes {
  Container = "container",
  Block = "block",
  ItemStack = "item",
  VectorXZ = "vectorxz",
  Vector3 = "vector3",
  Vector2 = "vector2",
  Chunk = "chunk",
}

export class Typing {
  static get(value: Vector3 | Vector2 | VectorXZ | Container | Block | ItemStack | Chunk): TypingTypes | undefined {
    if (value instanceof Container) return TypingTypes.Container;
    if (value instanceof Block) return TypingTypes.Block;
    if (value instanceof ItemStack) return TypingTypes.ItemStack;
    if (value instanceof Chunk) return TypingTypes.Chunk;
    if (typeof value === "object") {
      if (!("y" in value)) return TypingTypes.VectorXZ;
      if ("z" in value) return TypingTypes.Vector3;
      return TypingTypes.Vector2;
    }
    return undefined;
  }
}

export class Hasher {
  static parseVec3(value: string): Vector3 {
    if (!value) return { x: 0, y: 0, z: 0 };
    const points = value.split(",");
    const x = +points[0];
    const y = +points[1];
    const z = +points[2];
    return { x, y, z };
  }

  static parseVec2(value: string): Vector2 {
    if (!value) return { x: 0, y: 0 };
    const points = value.split(",");
    const x = +points[0];
    const y = +points[1];
    return { x, y };
  }

  static parseVecXZ(value: string): VectorXZ {
    if (!value) return { x: 0, z: 0 };
    const points = value.split(",");
    const x = +points[0];
    const z = +points[1];
    return { x, z };
  }

  static parseBlock(value: string): Block | undefined {
    if (!value) return undefined;
    const points = value.split(",");
    let dim = points[0];
    let location = this.parseVec3(points.slice(1, 4).join(","));
    if (!location) return undefined;
    return world.getDimension(dim).getBlock(location);
  }

  static parseChunk(value: string): Chunk | undefined {
    if (!value) return undefined;
    const points = value.split(",");
    let dim = points[0];
    let location = this.parseVecXZ(points.slice(1, 3).join(","));
    if (!location) return undefined;
    return new Chunk(world.getDimension(dim), location);
  }

  static stringify(value: Vector3 | Vector2 | VectorXZ | Container | Block | Chunk | undefined): string | undefined {
    if (!value) return value;
    const t = Typing.get(value);
    switch (t) {
      case TypingTypes.Container:
        return this.hashContainer(value as Container);
      case TypingTypes.Block:
        return this.hashBlock(value as Block);
      case TypingTypes.VectorXZ:
        return this.hashVecXZ(value as VectorXZ);
      case TypingTypes.Vector3:
        return this.hashVec3(value as Vector3);
      case TypingTypes.Vector2:
        return this.hashVec2(value as Vector2);
      case TypingTypes.Chunk:
        return this.hashChunk(value as Chunk);
      default:
        throw new Error(`Unknown type "${t}"`);
    }
  }

  static hashVecXZ(pos: VectorXZ): string {
    return `${pos.x},${pos.z}`;
  }

  static hashVec3(pos: Vector3): string {
    return `${pos.x},${pos.y},${pos.z}`;
  }

  static hashVec2(pos: Vector2): string {
    return `${pos.x},${pos.y}`;
  }

  static hashChunk(chunk: Chunk): string {
    return `${chunk.dimension.id},${this.hashVecXZ(chunk.location)}`;
  }

  static hashContainer(container: Container): string {
    const contents = [];
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      contents.push(item ? `${item.typeId}:${item.amount}` : "");
    }
    return contents.join("|");
  }

  static hashBlock(block?: Block): string {
    if (!block) return "air";
    return `${block.dimension.id},${this.hashVec3(block.location)},${block.typeId}`;
  }
}
