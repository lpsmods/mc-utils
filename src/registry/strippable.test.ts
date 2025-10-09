import { strippableBlocks } from "./strippable";

export default () => {
  strippableBlocks.register("stone", { block: "cobblestone", onConvert: () => console.log("strippable") });
};
