import { Player, Vector3, world } from "@minecraft/server";
import { PlayerSettings, Settings } from "./settings";
import { Vector3Utils } from "@minecraft/math";
import { assert, assertProperty } from "./test";

const customSettings = new Settings("test:custom_settings");
customSettings.defineProperty("property", { value: "defaultValue", type: "string" });

PlayerSettings.defineProperty("string_property", { value: "defaultValue", type: "string" });
PlayerSettings.defineProperty("number_property", { value: 64, type: "number" });
PlayerSettings.defineProperty("bool_property", { value: true, type: "boolean" });
PlayerSettings.defineProperty("vector_property", { value: { x: 0, y: 0, z: 0 }, type: "Vector3" });

function pSettings(player: Player) {
  const pSettings = new PlayerSettings(player);
  pSettings.reset();
  const stringProperty = pSettings.get("string_property");
  const numberProperty = pSettings.get("number_property");
  const boolProperty = pSettings.get("bool_property");
  const vectorProperty = pSettings.get("vector_property") as Vector3;

  assertProperty("string_property", stringProperty, "defaultValue");
  assertProperty("number_property", numberProperty, 64);
  assertProperty("bool_property", boolProperty);
  assert(Vector3Utils.equals(vectorProperty, { x: 0, y: 0, z: 0 }), "vector_property failed!");

  pSettings.set("string_property", "updated");
  const stringProperty2 = pSettings.get("string_property");
  assertProperty("string_property2", stringProperty2, "updated");
}

function cSettings() {
  const property = customSettings.get("property");
  assertProperty("property", property, "defaultValue");
}

export default () => {
  cSettings();

  world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return;
    pSettings(event.player);
  });
};
