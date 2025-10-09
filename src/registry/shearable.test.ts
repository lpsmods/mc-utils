import { shearableBlocks } from "./shearable";

export default () => {
  shearableBlocks.register("cobblestone", { block: "stone", onConvert: () => console.log("shearable") });
};
