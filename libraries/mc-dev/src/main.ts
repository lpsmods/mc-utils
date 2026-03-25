import { StartupEvent, system } from "@minecraft/server";
import { DevCommand } from "./command";
import { DeveloperTools } from "./developer_tools";

export function initializeDev(environment: string = "development"): void {
  if (environment !== "development") return;
  // Initialize
  new DeveloperTools();

  // Register command.
  function startup(event: StartupEvent): void {
    DevCommand.register(event.customCommandRegistry);
  }

  system.beforeEvents.startup.subscribe(startup);
}
