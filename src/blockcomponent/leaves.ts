import { BlockComponentRandomTickEvent, BlockComponentTickEvent, CustomComponentParameters } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { AddonUtils } from "../addon";
import { create, defaulted, number, object, string, Struct } from "superstruct";

export interface LeavesOptions {
  distance_state: keyof BlockStateSuperset;
  persistent_state: keyof BlockStateSuperset;
  delay: number;
}

export class LeavesComponent {
  static readonly componentId = AddonUtils.makeId("leaves");
  struct: Struct<any, any> = object({
    distance_state: defaulted(string(), 'mcutils:distance'),
    persistent_state: defaulted(string(), 'mcutils:persistent'),
    delay: defaulted(number(), 0),
  });

  /**
   * Vanilla leaves block behavior.
   */
  constructor() {
    this.onRandomTick = this.onRandomTick.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  // EVENTS

  onRandomTick(event: BlockComponentRandomTickEvent, args: CustomComponentParameters): void {}

  onTick(event: BlockComponentTickEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as LeavesOptions;
    const blk = event.block;
    const persistent = blk.getState(options.persistent_state) as boolean;
    if (persistent) return;

    const distance = blk.getState(options.distance_state) as number;
    let delay = event.block.getDynamicProperty("mcutils:delay") ?? 0;

    // if (distance == 1 && delay == 0) {
    //   console.warn("DECAY");
    //   changeBlockType(event.block);
    // }
  }
}
