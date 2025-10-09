import {
  BlockTypes,
  DimensionTypes,
  EffectTypes,
  EnchantmentTypes,
  EntityTypes,
  EquipmentSlot,
  ItemTypes,
  world,
} from "@minecraft/server";
import { DataUtils, DynamicObject } from "./utils";
import { UnitTestMap } from "../command/test";
import { ChunkUtils } from "../chunk";

function data() {
  const dim = world.getDimension("overworld");
  const entity = world.getAllPlayers()[0];
  const chunk = ChunkUtils.pos2Chunk(dim, { x: 0, y: 0, z: 0 });
  const block = dim.getBlock(entity.location);
  const data1 = {
    block_permutation: block?.permutation,
    block_type: BlockTypes.get("stone"),
    item_type: ItemTypes.get("paper"),
    entity_type: EntityTypes.get("creeper"),
    effect_type: EffectTypes.get("haste"),
    dimension_type: DimensionTypes.get("overworld"),
    enchantment_type: EnchantmentTypes.get("mending"),
    block: block,
    vectorxz: { x: 0, z: 1 },
    vector3: { x: 0, y: 1, z: 2 },
    vector2: { x: 0, y: 1 },
    chunk: chunk,
    entity: entity,
    dimension: dim,
    bigint: BigInt(100),
    boolean: false,
    number: 64,
    string: "hello, world!",
    undefined: undefined,
    array: [block],
    object: {
      block2: block,
    },
  };
  const json = DataUtils.dump(data1);
  console.log(json);
  const data = DataUtils.load(json);
  delete data.bigint;
  console.log(JSON.stringify(data));
}

function dynamicProperty() {
  DataUtils.setDynamicProperty(world, "dataUtils.test", ["Line 1"]);
  const data = DataUtils.getDynamicProperty(world, "dataUtils.test", []);
  data.push("Line 2");
}

function viewProps() {
  DataUtils.viewDynamicProperties(world);
}

export default () => {
  // data();
  dynamicProperty();
  // viewProps();
};

export function cmd(units: UnitTestMap): void {
  units.set("showInspector", (ctx, message) => {
    const player = world.getAllPlayers()[0];
    if (!player) return console.warn("player not found");
    let object: DynamicObject | undefined = ctx.sourceEntity;
    switch (message) {
      case "world":
        object = world;
        break;
      case "player":
        object = player;
        break;
      case "item":
        object = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
        break;
    }
    DataUtils.showInspector(object ?? world, player);
  });
}
