import { StartupEvent, system, world, WorldLoadAfterEvent } from "@minecraft/server";

// import early1 from "./ui/progress_bar.test";
import early10 from "./effect/custom.test";
import early11 from "./enchantment/custom.test";
import early12 from "./registry/index.test";
import early2 from "./area_detector.test";
import early3 from "./loot/block_loot_handler.test";
import early4 from "./loot/entity_loot_handler.test";
import early6 from "./entity/text_display.test";
import early7 from "./event/index.test";
import early8 from "./entity/entity_handler.test";
import early9 from "./entity/player_handler.test";

// import world1 from "./world/world_border.test";
// import world2 from "./drawer.test";
// import world3 from "./utils/text.test";
import world4 from "./settings.test";
import world5 from "./data/data_storage.test";
import world6, { cmd as cmd9 } from "./data/utils.test";

import startup1 from "./blockcomponent/index.test";
import startup2 from "./itemcomponent/index.test";

import cmd1 from "./ui/action_form.test";
import cmd2 from "./ui/modal_form.test";
import cmd3 from "./chunk/chunk_queue.test";
import cmd4 from "./queue.test";
import cmd5 from "./world/utils.test";
import cmd6 from "./developer_tools/base.test";
import cmd7 from "./utils/molang.test";
import cmd8 from "./ui/paged_action_form.test";
import { TestCommand, unitTests } from "./command/test";
// import { RandomUtils } from "./utils/random";

// Add unit tests.
cmd1(unitTests);
cmd2(unitTests);
cmd3(unitTests);
cmd4(unitTests);
cmd5(unitTests);
cmd6(unitTests);
cmd7(unitTests);
cmd8(unitTests);
cmd9(unitTests);

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || "Assertion failed");
  }
}

export function assertProperty(propName: string, value: any, matchValue: any = true) {
  return assert(value === matchValue, `${propName} failed! "${value}" != "${matchValue}"`);
}

function run() {
  //   early1();
  early2();
  early3();
  early4();
  early6();
  early7();
  early8();
  early9();
  early10();
  early11();
  early12();

  system.beforeEvents.startup.subscribe((event: StartupEvent) => {
    startup1(event.blockComponentRegistry);
    startup2(event.itemComponentRegistry);

    // Test command
    try {
      TestCommand.register(event.customCommandRegistry);
    } catch (err) {
      console.warn(err);
    }
  });

  world.afterEvents.worldLoad.subscribe((event: WorldLoadAfterEvent) => {
    // world1();
    // world2();
    // world3();
    world4();
    world5();
    world6();
  });
}

export function runAllTests() {
  console.warn("Running tests...");
  try {
    run();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("An error occurred:");
      console.error("Message:", err.message);
      console.error("Stack trace:", err.stack);
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}
