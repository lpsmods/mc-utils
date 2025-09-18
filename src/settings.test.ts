import { Vector3, world } from "@minecraft/server";
import { PlayerSettings, WorldSettings } from "./settings";
import { Vector3Utils } from "@minecraft/math";
import { assert, assertProperty } from "./test";

class CustomSettings extends WorldSettings {
  readonly settingId = "test:custom_settings";
}
CustomSettings.defineProperty("property", "defaultValue");

WorldSettings.defineProperty("string_property", "defaultValue");
WorldSettings.defineProperty("number_property", 64);
WorldSettings.defineProperty("bool_property", true);
WorldSettings.defineProperty("vector_property", { x: 0, y: 0, z: 0 });

PlayerSettings.defineProperty("string_property", "defaultValue");
PlayerSettings.defineProperty("number_property", 64);
PlayerSettings.defineProperty("bool_property", true);
PlayerSettings.defineProperty("vector_property", { x: 0, y: 0, z: 0 });

function worldSettings() {
  WorldSettings.reset();
  const stringProperty = WorldSettings.get("string_property");
  const numberProperty = WorldSettings.get("number_property");
  const boolProperty = WorldSettings.get("bool_property");
  const vectorProperty = WorldSettings.get("vector_property") as Vector3;

  assertProperty("string_property", stringProperty, "defaultValue");
  assertProperty("number_property", numberProperty, 64);
  assertProperty("bool_property", boolProperty);
  assert(Vector3Utils.equals(vectorProperty, { x: 0, y: 0, z: 0 }), "vector_property failed!");

  WorldSettings.set("string_property", "updated");
  const stringProperty2 = WorldSettings.get("string_property");
  assertProperty("string_property2", stringProperty2, "updated");
}

function playerSettings() {
  const pSettings = new PlayerSettings(world.getAllPlayers()[0]);
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

function customSettings() {
  const property = CustomSettings.get("property");
  assertProperty("property", property, "defaultValue");
}

export default () => {
  worldSettings();
  customSettings();
  playerSettings();
};
