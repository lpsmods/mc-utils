import { StartupEvent, system } from "@minecraft/server";
import "./mixins";
import { AddonUtils } from "./utils/addon";

export const VERSION = "1.0.0";

function startup(event: StartupEvent): void {
  console.info("SETUP");
}

export function setup(namespace?: string): void {
  AddonUtils.addonId = namespace ?? "mcutils";
  system.beforeEvents.startup.subscribe(startup);
}
