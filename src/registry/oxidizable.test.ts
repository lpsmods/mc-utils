import { oxidizableBlocks } from "./oxidizable";

export default () => {
  oxidizableBlocks.register("cobblestone", { block: "smooth_stone", onConvert: () => console.log("oxidizable") });
};
