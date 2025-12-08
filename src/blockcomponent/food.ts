import { BlockComponentPlayerInteractEvent, BlockCustomComponent, CustomComponentParameters } from "@minecraft/server";
import { AddonUtils } from "../utils/addon";
import { boolean, create, defaulted, number, object, optional, string, Struct } from "superstruct";
import { PlayerUtils } from "../entity";
import { isBlock } from "../validation";
import { BlockUtils } from "../block/utils";

export interface FoodBlockOptions {
  nutrition: number;
  saturation_modifier: number;
  can_always_eat: boolean;
  sound_event?: string;
  using_converts_to?: string;
}

export class FoodBlockComponent implements BlockCustomComponent {
  static readonly componentId = AddonUtils.makeId("food");
  struct: Struct<any, any> = object({
    nutrition: defaulted(number(), 0),
    saturation_modifier: defaulted(number(), 0),
    can_always_eat: defaulted(boolean(), false),
    sound_event: optional(string()),
    using_converts_to: optional(isBlock),
  });

  /**
   * Food block behavior.
   */
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  eat(event: BlockComponentPlayerInteractEvent, options: FoodBlockOptions): void {
    if (!event.player) return;
    if (!PlayerUtils.canEat(event.player)) return;
    PlayerUtils.eat(event.player, {
      nutrition: options.nutrition,
      saturationModifier: options.saturation_modifier,
      soundId: options.sound_event,
    });
    if (options.using_converts_to) {
      BlockUtils.setType(event.block, options.using_converts_to);
    }
  }

  // EVENTS

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, args: CustomComponentParameters): void {
    const options = create(args.params, this.struct) as FoodBlockOptions;
    this.eat(event, options);
  }
}
