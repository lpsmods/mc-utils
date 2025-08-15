import { system, ScriptEventCommandMessageAfterEvent } from "@minecraft/server";

function scriptEventReceive(event: ScriptEventCommandMessageAfterEvent) {
  switch (event.id) {
    case "mcutils:test":
      console.warn("TEST");

      break;
  }
}
system.afterEvents.scriptEventReceive.subscribe(scriptEventReceive, {
  namespaces: ["lpsmods"],
});
