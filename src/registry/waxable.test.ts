import { waxableBlocks } from "./waxable";

export default () => {
  waxableBlocks.register("stone", { block: "yellow_concrete", onConvert: () => console.log("waxable") });
};
