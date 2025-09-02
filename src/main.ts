import { StartupEvent, system } from "@minecraft/server";
import "./mixins";

export const VERSION = "1.0.0";

function startup(event: StartupEvent): void {
  console.info("SETUP");
}

export function setup(): void {
  system.beforeEvents.startup.subscribe(startup);
}
