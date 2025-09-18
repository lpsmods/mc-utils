import {
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandParamType,
  CustomCommandResult,
  StartupEvent,
  system,
  world,
  WorldLoadAfterEvent,
} from "@minecraft/server";

import early2 from "./area_detector.test";
import early3 from "./loot/block_loot_handler.test";
import early4 from "./loot/entity_loot_handler.test";
import early6 from "./entity/text_display_handler.test";
import early8 from "./entity/entity_handler.test";
import early9 from "./entity/player_handler.test";
import early1 from "./ui/progress_bar.test";
import early7 from "./event/index.test";
import world4 from "./settings.test";

import world1 from "./world/world_border.test";
import world2 from "./drawer.test";
import world3 from "./text.test";

import startup1 from "./blockcomponent/index.test";
import startup2 from "./itemcomponent/index.test";

import cmd1 from "./ui/action_form.test";
import cmd2 from "./ui/modal_form.test";
import cmd3 from "./world/chunk_queue.test";
import cmd4 from "./queue.test";
import cmd5 from "./world/utils.test";
import cmd6 from "./developer_tools.test";
import cmd7 from "./molang.test";
import cmd8 from "./ui/paged_action_form.test";
import { executeTestCommand, testCommand, unitTests } from "./command/test";

// Add unit tests.
cmd1(unitTests);
cmd2(unitTests);
cmd3(unitTests);
cmd4(unitTests);
cmd5(unitTests);
cmd6(unitTests);
cmd7(unitTests);
cmd8(unitTests);

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || "Assertion failed");
  }
}

export function assertProperty(propName: string, value: any, matchValue: any = true) {
  return assert(value === matchValue, `${propName} failed! "${value}" != "${matchValue}"`);
}


export function runAllTests() {
  console.warn("Running tests...");
  //   early1();
  early2();
  early3();
  early4();
  early6();
  early7();
  early8();
  early9();

  system.beforeEvents.startup.subscribe((event: StartupEvent) => {
    startup1(event.blockComponentRegistry);
    startup2(event.itemComponentRegistry);

    // Test command
    try {
      event.customCommandRegistry.registerEnum("mcutils:units", [...unitTests.keys()]);
      event.customCommandRegistry.registerCommand(testCommand, executeTestCommand);
    } catch (err) {}
  });

  world.afterEvents.worldLoad.subscribe((event: WorldLoadAfterEvent) => {
    // world1();
    // world2();
    // world3();
    // world4(); // settings
  });
}
