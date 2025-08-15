import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentRandomTickEvent,
  BlockPermutation,
  CustomComponentParameters,
} from "@minecraft/server";
import { LRUCache } from "../cache";
import { BlockUtils } from "../block/BlockUtils";
import { Identifier } from "../misc/Identifier";
import { ItemUtils } from "../item/ItemUtils";

export interface OxidizableOptions {
  block?: string;
}

// TODO:
export class OxidizableComponent {
  static typeId = "mcutils:oxidizable";

  // static cache = new LRUCache();

  /**
   * Vanilla copper block behavior.
   */
  constructor() {
    // this.onPlayerInteract = this.onPlayerInteract.bind(this);
    // this.onRandomTick = this.onRandomTick.bind(this);
  }

  // getSound(block: Block, state: string): string {
  //   switch (state) {
  //     case "wax_off":
  //       return "copper.wax.off";
  //     case "wax_on":
  //       return "copper.wax.on";
  //     case "scrape":
  //       return "scrape";
  //   }
  //   return "";
  // }

  // isWaxed(block: Block): boolean {
  //   return block.typeId.includes("waxed_");
  // }

  // getOxidization(block: Block): string {
  //   if (block.typeId.includes("oxidized")) return "oxidized_copper";
  //   if (block.typeId.includes("weathered")) return "weathered_copper";
  //   if (block.typeId.includes("exposed")) return "exposed_copper";
  //   return "copper";
  // }

  // waxed(block: Block): boolean {
  //   const id = Identifier.parse(block.typeId).prefix("waxed_");
  //   BlockUtils.setType(block, id.toString());
  //   return true;
  // }

  // unwaxed(block: Block): boolean {
  //   const id = Identifier.parse(block.typeId);
  //   let path = id.path.replace("waxed_", "");
  //   BlockUtils.setType(block, `${id.namespace}:${path}`);
  //   return true;
  // }

  // // TODO: onRandom
  // oxidized(block: Block): boolean {
  //   let oldState = this.getOxidization(block);
  //   let state;
  //   switch (oldState) {
  //     case "weathered_copper":
  //       state = "oxidized_copper";
  //       break;
  //     case "exposed_copper":
  //       state = "weathered_copper";
  //       break;
  //     case "copper":
  //       state = "exposed_copper";
  //       break;
  //     default:
  //       state = null;
  //       break;
  //   }
  //   if (state == null) return false;
  //   block.setPermutation(
  //     BlockPermutation.resolve(
  //       block.typeId.replace(oldState + "_", state + "_"),
  //       block.permutation.getAllStates()
  //     )
  //   );
  //   return true;
  // }

  // unoxidized(block: Block): boolean {
  //   let oldState = this.getOxidization(block);
  //   let state;
  //   switch (oldState) {
  //     case "oxidized_copper":
  //       state = "weathered_copper";
  //       break;
  //     case "weathered_copper":
  //       state = "exposed_copper";
  //       break;
  //     case "exposed_copper":
  //       state = "copper";
  //       break;
  //     default:
  //       state = null;
  //       break;
  //   }
  //   if (state == null) return false;
  //   block.setPermutation(
  //     BlockPermutation.resolve(
  //       block.typeId.replace(oldState + "_", state + "_"),
  //       block.permutation.getAllStates()
  //     )
  //   );
  //   return true;
  // }

  // // EVENTS

  // onPlayerInteract(
  //   event: BlockComponentPlayerInteractEvent,
  //   args: CustomComponentParameters
  // ): void {
  //   const options = args.params as CopperOptions;
  //   if (!event.player) return;
  //   if (this.isWaxed(event.block) && ItemUtils.holdingAxe(event.player)) {
  //     if (ItemUtils.holdingAxe(event.player)) {
  //       if (!this.unwaxed(event.block)) return;
  //       const sound = this.getSound(event.block, "wax_off");
  //       return event.block.dimension.playSound(sound, event.block.location);
  //     }
  //     return;
  //   }
  //   if (ItemUtils.holdingAxe(event.player)) {
  //     if (!this.unoxidized(event.block)) return;
  //     const sound = this.getSound(event.block, "scrape");
  //     return event.block.dimension.playSound(sound, event.block.location);
  //   }
  //   if (!this.isWaxed(event.block) && ItemUtils.isHolding(event.player, "minecraft:honeycomb")) {
  //     if (!this.waxed(event.block)) return;
  //     const sound = this.getSound(event.block, "wax_on");
  //     return event.block.dimension.playSound(sound, event.block.location);
  //   }
  // }

  // onRandomTick(event: BlockComponentRandomTickEvent, args: CustomComponentParameters): void {
  //   const options = args.params as CopperOptions;
  //   if (this.isWaxed(event.block)) return;
  //   this.oxidized(event.block);
  // }
}
