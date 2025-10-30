import {
  Block,
  BlockComponentOnPlaceEvent,
  BlockComponentPlayerBreakEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  Entity,
} from "@minecraft/server";
import { AddonUtils } from "../utils/addon";
import { BlockBaseComponent } from "./base";
import { create, object, Struct } from "superstruct";
import { isEntity } from "../validation";
import { Vector3Utils } from "@minecraft/math";
import { CENTER_ENTITY } from "../constants";

export interface TileEntityOptions {
  entity: string;
}

export class TileEntityComponent extends BlockBaseComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("tile_entity");
  struct: Struct<any, any> = object({
    entity: isEntity,
  });

  /**
   * Vanilla tile entity block behavior. (Like; chests, barrels)
   */
  constructor() {
    super();
    this.onPlace = this.onPlace.bind(this);
    this.onPlayerBreak = this.onPlayerBreak.bind(this);
  }

  private createEntity(block: Block, entityType: string): Entity {
    const entity = block.dimension.spawnEntity(entityType, Vector3Utils.add(block.location, CENTER_ENTITY));
    entity.setDynamicProperty("common:tile.block", block.typeId);
    entity.nameTag = block.localizationKey;
    return entity;
  }

  /**
   * Get the entity for this tile.
   * @param {Block} block
   * @param {TileEntityOptions} options
   * @returns {Entity}
   */
  getEntity(block: Block, options: TileEntityOptions): Entity {
    const entities = block.dimension
      .getEntitiesAtBlockLocation(block.location)
      .filter((entity) => entity.matches({ type: options.entity }));
    if (entities.length == 0) {
      return this.createEntity(block, options.entity);
    }
    return entities[0];
  }

  // EVENTS

  onPlace(event: BlockComponentOnPlaceEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as TileEntityOptions;
    this.createEntity(event.block, options.entity);
  }

  onPlayerBreak(event: BlockComponentPlayerBreakEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as TileEntityOptions;
    const entity = this.getEntity(event.block, options);
    entity.remove();
  }
}
