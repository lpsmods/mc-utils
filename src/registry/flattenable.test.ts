import { flattenableBlocks } from "./flattenable";

export default () => {
  flattenableBlocks.register("stone", { block: "cobblestone", onConvert: () => console.log("flatten") });
};
