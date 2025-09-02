// TODO: Error when place/break bed.
import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentPlayerBreakEvent,
  BlockComponentPlayerPlaceBeforeEvent,
  BlockPermutation,
  CustomComponentParameters,
  Dimension,
  Direction,
  Vector3,
} from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { BlockBaseComponent } from "./base";
import { BlockUtils } from "../block/utils";
import { WorldUtils } from "../world/utils";
import { Vector3Utils } from "@minecraft/math";
import { AddonUtils } from "../addon";

export interface MultiblockOptions {
  part_state: keyof BlockStateSuperset;
  direction_state?: keyof BlockStateSuperset;
  sync_states?: boolean;
  parts?: string[];
}

export class Part {
  readonly name: string;
  readonly offset: Vector3;
  readonly relative: boolean;

  constructor(name: string, offset: Vector3, relative: boolean = false) {
    this.name = name;
    this.offset = offset;
    this.relative = relative;
  }

  isBase(): boolean {
    return Vector3Utils.equals({ x: 0, y: 0, z: 0 }, this.offset);
  }

  fromDir(direction: Direction): Vector3 {
    if (!this.relative || this.isBase()) return this.offset;
    return WorldUtils.offsetFromDirection(this.offset, direction);
  }

  static parse(value: string): Part | undefined {
    const seg = value.split(",");
    var relative = false;
    if (seg[1].charAt(0) === "^") {
      seg[0] = seg[0].slice(1);
      relative = true;
    }
    if (seg[2].charAt(0) === "^") {
      seg[1] = seg[1].slice(1);
      relative = true;
    }
    if (seg[3].charAt(0) === "^") {
      seg[2] = seg[2].slice(1);
      relative = true;
    }
    const x = +seg[1];
    const y = +seg[2];
    const z = +seg[3];
    return new Part(seg[0], { x, y, z }, relative);
  }

  static parseAll(value: string[] | undefined): Part[] {
    if (!value) return [];
    const parts: Part[] = [];
    for (const i of value) {
      const p = Part.parse(i);
      if (!p) continue;
      parts.push(p);
    }
    return parts;
  }
}

export class MultiBlockReceiveEvent {
  constructor(
    block: Block,
    sourceBlock: Block,
    id: string,
    data?: { [key: string]: any },
  ) {
    this.block = block;
    this.dimension = block.dimension;
    this.sourceBlock = sourceBlock;
    this.id = id;
    this.data = data ?? {};
  }

  readonly dimension: Dimension;

  /**
   * The block that received the event.
   */
  readonly block: Block;

  /**
   * The block that sent the event.
   */
  readonly sourceBlock: Block;

  /**
   * The event ID.
   */
  readonly id: string;

  /**
   * Additional event data.
   */
  readonly data: { [key: string]: any };
}

export class MultiblockComponent extends BlockBaseComponent {
  static typeId = AddonUtils.makeId("multiblock");

  constructor() {
    super();
    this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
    this.onPlace = this.onPlace.bind(this);
    this.onPlayerBreak = this.onPlayerBreak.bind(this);
  }

  isBase(permutation: BlockPermutation, options: MultiblockOptions): boolean {
    const state = permutation.getState(options.part_state);
    const parts = Part.parseAll(options.parts);
    for (const part of parts) {
      if (!part.isBase()) continue;
      if (part.name === state) return true;
    }
    return false;
  }

  update(block: Block, args: CustomComponentParameters): void {
    super.update(block, args);
    const options = args.params as MultiblockOptions;
    if (!options.sync_states) return;
    this.syncStates(block, options);
  }

  syncStates(block: Block, options: MultiblockOptions): void {
    if (!options.sync_states) return;
    const blocks = this.getOtherParts(
      block.permutation,
      block.dimension,
      block.location,
      options,
    );
    for (const block2 of blocks) {
      if (!block2) continue;
      const part = block2.permutation.getState(options.part_state);
      const perm = block.permutation.withState(options.part_state, part);
      block2.setPermutation(perm);
    }
  }

  findBase(
    permutation: BlockPermutation,
    dimension: Dimension,
    location: Vector3,
    options: MultiblockOptions,
  ): Block | undefined {
    const parts = Part.parseAll(options.parts);
    const basePart = parts.find((part) => part.isBase());
    if (!basePart) return undefined;
    const name = permutation.getState(options.part_state);
    if (basePart.name === name) return dimension.getBlock(location);
    const thisPart = parts.find((part) => part.name === name);
    if (!thisPart) return undefined;
    const dx = basePart.offset.x - thisPart.offset.x;
    const dy = basePart.offset.y - thisPart.offset.y;
    const dz = basePart.offset.z - thisPart.offset.z;
    let offset: Vector3 = { x: dx, y: dy, z: dz };
    if (options.direction_state) {
      const dir = permutation.getState(options.direction_state) as Direction;
      offset = WorldUtils.offsetFromDirection(offset, dir);
    }
    const blk = dimension.getBlock(location);
    if (!blk) return;
    const baseBlock = blk.offset(offset);
    return baseBlock ?? undefined;
  }

  getOtherParts(
    permutation: BlockPermutation,
    dimension: Dimension,
    location: Vector3,
    options: MultiblockOptions,
  ): Block[] {
    const base = this.findBase(permutation, dimension, location, options);
    if (!base) return [];
    const blocks = [];
    const name = permutation.getState(options.part_state);
    for (const part of Part.parseAll(options.parts)) {
      if (part.name === name) continue;
      var blk = base.offset(part.offset);
      if (options.direction_state) {
        const dir = permutation.getState(options.direction_state) as Direction;
        blk = base.offset(part.fromDir(dir));
      }
      if (!blk) continue;
      blocks.push(blk);
    }
    return blocks;
  }

  /**
   * Send data to the other parts of the block.
   * @param {Block} block
   * @param {any} data
   * @returns
   */
  sendPart(
    block: Block,
    args: CustomComponentParameters,
    id: string,
    data?: any,
  ): void {
    if (!this.onReceivePart) return;
    const options = args.params as MultiblockOptions;
    const blocks = this.getOtherParts(
      block.permutation,
      block.dimension,
      block.location,
      options,
    );
    for (const target of blocks) {
      this.onReceivePart(
        new MultiBlockReceiveEvent(target, block, id, data),
        args,
      );
    }
  }

  // EVENTS

  beforeOnPlayerPlace(
    event: BlockComponentPlayerPlaceBeforeEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as MultiblockOptions;
    const parts = Part.parseAll(options.parts);
    for (const part of parts) {
      var block = event.block.offset(part.offset);
      if (options.direction_state) {
        const dir = event.permutationToPlace.getState(
          options.direction_state,
        ) as Direction;
        block = event.block.offset(part.fromDir(dir));
      }
      if (!block || !block.isAir) {
        event.cancel = true;
        return;
      }
    }
  }

  onPlace(
    event: BlockComponentOnPlaceEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as MultiblockOptions;
    if (!this.isBase(event.block.permutation, options)) return;
    const parts = Part.parseAll(options.parts);
    for (const part of parts) {
      if (part.isBase()) {
        BlockUtils.setState(event.block, options.part_state, part.name);
        continue;
      }
      var block = event.block.offset(part.offset);
      if (options.direction_state) {
        const dir = event.block.permutation.getState(
          options.direction_state,
        ) as Direction;
        block = event.block.offset(part.fromDir(dir));
      }
      if (!block) continue;
      const perm = event.block.permutation.withState(
        options.part_state,
        part.name,
      );
      block.setPermutation(perm);
    }
  }

  onPlayerBreak(
    event: BlockComponentPlayerBreakEvent,
    args: CustomComponentParameters,
  ): void {
    const options = args.params as MultiblockOptions;
    const blocks = this.getOtherParts(
      event.brokenBlockPermutation,
      event.dimension,
      event.block.location,
      options,
    );
    for (const block of blocks) {
      this.destroy(block, event.player);
    }
  }

  // CUSTOM EVENTS

  /**
   * Receive data from the other parts of the block.
   * @param {MultiBlockReceiveEvent} event
   */
  onReceivePart?(
    event: MultiBlockReceiveEvent,
    args: CustomComponentParameters,
  ): void;
}
