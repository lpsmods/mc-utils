import { tillableBlocks } from "./tillable";

export default () => {
  tillableBlocks.register("stone", { block: "cobblestone", onConvert: () => console.log("tillable") });
};
