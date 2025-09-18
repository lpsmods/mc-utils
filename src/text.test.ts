import { world } from "@minecraft/server";
import { TextUtils } from "./text";

export default () => {
  const data = { number: 100, bool: true, bool2: false, string: "nospace", nil: null, "first second": "first second" };
  // const data = {
  //   id: "minecraft:chest",
  //   Items: [
  //     { Slot: 0, id: "minecraft:diamond_sword", Count: 1 },
  //     { Slot: 1, id: "minecraft:iron_helmet", Count: 1 },
  //   ],
  // };
  world.sendMessage(TextUtils.renderJSON(data));
};
