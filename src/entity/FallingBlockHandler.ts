import {
  Block,
  BlockPermutation,
  CustomComponentParameters,
  Entity,
  ItemStack,
} from "@minecraft/server";
import { SpecificEntityHandler } from "../entity/SpecificEntityHandler";
import { Vector3Utils } from "@minecraft/math";
import { EntityFallOnEvent } from "../event/entity";

export class FallingBlockEvent {
  constructor(block: Block, beforePermutation: BlockPermutation, entity: Entity) {
    this.block = block;
    this.beforePermutation = beforePermutation;
    this.entity = entity;
    this.cancel = false;
  }

  readonly block: Block;
  readonly beforePermutation: BlockPermutation;
  readonly entity: Entity;
  cancel: boolean;
}

export class FallingBlockHandler extends SpecificEntityHandler {
  blockId: string;
  component: any;
  args: CustomComponentParameters | undefined;

  constructor(component: any, args: CustomComponentParameters, entity: Entity, blockId: string) {
    super(entity);
    this.component = component;
    this.args = args;
    this.blockId = blockId;
    this.onFallOn = this.onFallOn.bind(this);
  }

  static create(
    component: any,
    args: CustomComponentParameters,
    block: Block,
    entityId: string
  ): FallingBlockHandler | undefined {
    const pos = Vector3Utils.add(block.location, { x: 0.5, y: 0, z: 0.5 });
    const before = block.permutation;
    const blockId = block.typeId;
    block.setType("air");
    const entity = block.dimension.spawnEntity(entityId, pos);
    try {
      entity.triggerEvent(blockId);
    } catch (err) {}
    const handler = new FallingBlockHandler(component, args, entity, blockId);
    const fallEvent = new FallingBlockEvent(block, before, entity);
    if (component.onFall) component.onFall(fallEvent, args);
    if (fallEvent.cancel) {
      handler.remove();
      return undefined;
    }

    return handler;
  }

  onFallOn(event: EntityFallOnEvent): void {
    const block = event.entity.dimension.getBlock(event.entity.location);
    if (!block || !block.isAir) return this.drop(event);
    const before = block.permutation;
    block.setType(this.blockId);
    const fallEvent = new FallingBlockEvent(block, before, event.entity);
    if (this.component.onLand) this.component.onLand(fallEvent, this.args);
    if (fallEvent.cancel) {
      block.setPermutation(before);
      return;
    }
    event.entity.remove();
    this.remove();
  }

  drop(event: EntityFallOnEvent): void {
    // TODO: Use loot table
    const stack = new ItemStack(this.blockId);
    event.entity.dimension.spawnItem(stack, event.entity.location);
    event.entity.remove();
    this.remove();
  }
}
