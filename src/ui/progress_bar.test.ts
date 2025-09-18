import { system } from "@minecraft/server";
import { ProgressBar, ProgressBarColors } from "./progress_bar";

export default () => {
  const bar = new ProgressBar("example", { translate: "progressBar.test" });
  bar.maxValue = 20;
  // bar.style = ProgressBarStyles.Square;
  bar.color = ProgressBarColors.Orange;

  bar.onTick = function (bar) {
    if (system.currentTick % 20 !== 0) return;
    let v = bar.value + 1;
    if (v > bar.maxValue) v = 0;
    bar.value = v;
  };
};
