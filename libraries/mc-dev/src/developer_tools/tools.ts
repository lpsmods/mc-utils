import {
  ChunkTickEvent,
  DirectionUtils,
  EntityTickEvent,
  Identifier,
  PlayerChunkLoadEvent,
  PlayerChunkUnloadEvent,
  Settings,
} from "@lpsmods/mc-utils";
import { Block, EquipmentSlot, ItemStack, Player, RawMessage } from "@minecraft/server";

export interface DevToolOptions {
  name?: string;
  description?: string;
  icon?: string;
}

class DevToolSettings extends Settings {
  tool: DevTool;

  constructor(id: string, tool: DevTool) {
    super(id);
    this.tool = tool;
    this.defineProperty("enabled", {
      type: "boolean",
      value: false,
      title: `Enable ${this.tool.options.name ?? this.tool.id}`,
    });
  }

  update(data: { [key: string]: any }): void {
    super.update(data);

    if (data.enabled) {
      if (this.tool.onEnable) this.tool.onEnable();
    } else {
      if (this.tool.onDisable) this.tool.onDisable();
    }
  }
}

export abstract class DevTool {
  static all = new Map<string, DevTool>();

  readonly id: string;
  options: DevToolOptions;
  store: Settings;

  constructor(id: string, options?: DevToolOptions) {
    this.id = id;
    this.options = options ?? {};
    DevTool.all.set(id, this);
    this.store = new DevToolSettings(`dev:${this.id}`, this);
    this.buildSettings(this.store);
  }

  get isEnabled(): boolean {
    return this.store.get("enabled") ?? false;
  }

  show(player: Player): void {
    this.store.show(player, this.options.name ?? this.id);
  }

  // Events

  onTick?(event: EntityTickEvent): void;

  onChunkLoad?(event: PlayerChunkLoadEvent): void;

  onChunkUnload?(event: PlayerChunkUnloadEvent): void;

  onChunkTick?(event: ChunkTickEvent): void;

  onEnable?(player?: Player): void;

  onDisable?(player?: Player): void;

  // Hooks

  buildSettings(settings: Settings): void {}
}

class BlockInfoTool extends DevTool {
  static readonly toolId = "block_info";

  constructor() {
    super(BlockInfoTool.toolId, {
      name: "Block Info",
      description: "Displays the facing block data in the action bar.",
    });
  }

  // Hooks

  buildSettings(settings: Settings): void {
    settings.defineProperty("name", {
      type: "boolean",
      value: true,
      title: "Display name",
    });
    settings.defineProperty("identifier", {
      type: "boolean",
      value: true,
      title: "Display identifier",
    });
    settings.defineProperty("dimension", {
      type: "boolean",
      value: true,
      title: "Display dimension",
    });
    settings.defineProperty("tool", {
      type: "boolean",
      value: true,
      title: "Display tool",
    });
    settings.defineProperty("position", {
      type: "boolean",
      value: true,
      title: "Display position",
    });
    settings.defineProperty("position_coloring", {
      type: "boolean",
      value: true,
      title: "Use coloring for position",
      description: "Enabled: §cX§7, §aY§7, §9Z§r\nDisabled: §7X, Y, Z§r",
    });
    settings.defineProperty("tags", {
      type: "boolean",
      value: true,
      title: "Display tags",
    });
    settings.defineProperty("states", {
      type: "boolean",
      value: true,
      title: "Display states",
    });
  }

  private renderStateValue(value: string): string {
    if (value === "x" || value === "false") return `§c${value}§r`;
    if (value === "y" || value === "true") return `§a${value}§r`;
    if (value === "z") return `§9${value}§r`;
    return `§7${value}§r`;
  }

  private render(block: Block, player: Player): void {
    let texts: RawMessage[] = [];
    const { x, y, z } = block.location;

    if (this.store.get("name")) {
      texts.push({
        rawtext: [{ text: "Name: §7" }, { translate: block.localizationKey }, { text: "§r" }],
      });
    }

    if (this.store.get("identifier")) {
      texts.push({ text: `ID: §7${block.typeId}§r` });
    }

    if (this.store.get("tool")) {
      let tools = [];
      // Type
      if (block.hasTag("minecraft:is_pickaxe_item_destructible")) tools.push("Pickaxe");
      if (block.hasTag("minecraft:is_axe_item_destructible")) tools.push("Axe");
      if (block.hasTag("minecraft:is_shovel_item_destructible")) tools.push("Shovel");
      if (block.hasTag("minecraft:is_hoe_item_destructible")) tools.push("Hoe");
      if (block.hasTag("minecraft:is_shears_item_destructible")) tools.push("Shears");
      if (block.hasTag("minecraft:is_sword_item_destructible")) tools.push("Sword");
      // Tier
      if (block.hasTag("minecraft:stone_tier_destructible")) tools = tools.map((x) => `Stone ${x}`);
      if (block.hasTag("minecraft:iron_tier_destructible")) tools = tools.map((x) => `Iron ${x}`);
      if (block.hasTag("minecraft:diamond_tier_destructible")) tools = tools.map((x) => `Diamond ${x}`);
      if (tools.length !== 0) texts.push({ text: `Tool: §7${tools.join(" ")}§r` });
    }

    if (this.store.get("dimension")) {
      const dimId = Identifier.parse(block.dimension.id).path;
      texts.push({ text: `Dimension: §7${dimId.toTitleCase()}§r` });
    }

    if (this.store.get("position")) {
      const text = `Position: ${this.store.get("position_coloring") ? `§c${x}§7, §a${y}§7, §9${z}§r` : `§7${x}, ${y}, ${z}§r`}`;
      texts.push({ text });
    }

    if (this.store.get("tags")) {
      const tags = block.getTags().map((x) => `§7${x}§r`);
      if (tags.length !== 0) texts.push({ text: `Tags:\n ${tags.join("\n ")}` });
    }

    if (this.store.get("states")) {
      const states = Object.entries(block.permutation.getAllStates())
        .map((v) => `${v[0]}: ${this.renderStateValue(v[1].toString())}`)
        .join("\n ");
      if (states.length !== 0) texts.push({ text: `States:\n ${states}` });
    }

    const extras = texts.flatMap((v, i) => (i === 0 ? [v] : [{ text: "\n" }, v]));
    player.onScreenDisplay.setActionBar({
      rawtext: [{ text: "§lBlock Data§r\n" }, ...extras],
    });
  }

  // EVENTS

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const ray = event.entity.getBlockFromViewDirection({ maxDistance: 7 });
    if (!ray?.block) return;
    this.render(ray.block, event.entity);
  }
}

class PlayerInfoTool extends DevTool {
  static readonly toolId = "player_info";

  constructor() {
    super(PlayerInfoTool.toolId, {
      name: "Player Info",
      description: "Displays player data in the action bar.",
    });
  }

  // Hooks

  buildSettings(settings: Settings): void {
    settings.defineProperty("dimension", {
      type: "boolean",
      value: true,
      title: "Display dimension",
    });
    settings.defineProperty("biome", {
      type: "boolean",
      value: true,
      title: "Display biome name",
    });
    settings.defineProperty("position", {
      type: "boolean",
      value: true,
      title: "Display position",
    });
    settings.defineProperty("position_coloring", {
      type: "boolean",
      value: true,
      title: "Use coloring for position",
      description: "Enabled: §cX§7, §aY§7, §9Z§r\nDisabled: §7X, Y, Z§r",
    });
    settings.defineProperty("rotation", {
      type: "boolean",
      value: true,
      title: "Display rotation",
    });
    settings.defineProperty("rotation_coloring", {
      type: "boolean",
      value: true,
      title: "Use coloring for rotation",
      description: "Enabled: §cX§7, §aZ§r\nDisabled: §7X, Z§r",
    });
    settings.defineProperty("facing_direction", {
      type: "boolean",
      value: true,
      title: "Display facing direction",
    });
    settings.defineProperty("property_size", {
      type: "boolean",
      value: true,
      title: "Display property size",
    });
    settings.defineProperty("property_count", {
      type: "boolean",
      value: true,
      title: "Display property count",
    });
  }

  // TODO: facing direction: [Disabled, Cardinal, Ordinal (SE SW, etc)]
  private render(player: Player) {
    let texts: RawMessage[] = [];
    const dim = player.dimension;
    const { x, y, z } = player.location;
    const rot = player.getRotation();

    if (this.store.get("dimension")) {
      const dimId = Identifier.parse(dim.id).path;
      texts.push({ text: `Dimension: §7${dimId.toTitleCase()}§r` });
    }
    if (this.store.get("biome")) {
      const b = dim.getBiome({ x, y, z }).id.replace("minecraft:", "");
      texts.push({ text: `Biome: §7${b.toTitleCase()}§r` });
    }
    if (this.store.get("position")) {
      const text = `Position: ${this.store.get("position_coloring") ? `§c${x.toFixed(2)}§7, §a${y.toFixed(2)}§7, §9${z.toFixed(2)}§r` : `§7${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}§r`}`;
      texts.push({ text });
    }
    if (this.store.get("rotation")) {
      const text = `Rotation: ${this.store.get("rotation_coloring") ? `§c${rot.x.toFixed(2)}§7, §a${rot.y.toFixed(2)}§r` : `§7${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}§r`}`;
      texts.push({ text });
    }
    if (this.store.get("facing_direction")) {
      const dir = DirectionUtils.rot2dir(rot);
      texts.push({ text: `Facing Direction: §7${dir}§r` });
    }

    if (this.store.get("property_size")) {
      const b = player.getDynamicPropertyTotalByteCount() / 1000000;
      texts.push({ text: `Property Size: §7${b} MB§r` });
    }

    if (this.store.get("property_count")) {
      const c = player.getDynamicPropertyIds().length;
      texts.push({ text: `Property Count: §7${c}§r` });
    }

    // Properties count.

    const extras = texts.flatMap((v, i) => (i === 0 ? [v] : [{ text: "\n" }, v]));
    player.onScreenDisplay.setActionBar({
      rawtext: [{ text: "§lPlayer Data§r\n" }, ...extras],
    });
  }

  // EVENTS

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    this.render(event.entity);
  }
}

class ItemInfoTool extends DevTool {
  static readonly toolId = "item_info";

  constructor() {
    super(ItemInfoTool.toolId, {
      name: "Item Info",
      description: "Displays held item data in the action bar.",
    });
  }

  private render(player: Player, itemStack: ItemStack): void {
    let texts: RawMessage[] = [];

    if (this.store.get("name")) {
      texts.push({
        rawtext: [{ text: `Name: §7` }, { translate: itemStack.localizationKey }, { text: "§r" }],
      });
    }
    if (this.store.get("identifier")) {
      texts.push({ text: `ID: §7${itemStack.typeId}§r` });
    }

    let durability;
    if (this.store.get("durability") && (durability = itemStack.getComponent("durability"))) {
      texts.push({
        text: `Durability: §7${durability.damage} / ${durability.maxDurability}§r`,
      });
    }

    let food;
    if (this.store.get("food") && (food = itemStack.getComponent("food"))) {
      texts.push({ text: `Nutrition: §7${food.nutrition}§r` });
      texts.push({
        text: `Saturation Modifier: §7${food.saturationModifier.toFixed(2)}§r`,
      });
      if (food.usingConvertsTo) texts.push({ text: `Converts to: §7${food.usingConvertsTo}§r` });
    }

    if (this.store.get("property_size")) {
      const b = itemStack.getDynamicPropertyTotalByteCount() / 1000000;
      texts.push({ text: `Property Size: §7${b} MB§r` });
    }

    if (this.store.get("property_size")) {
      const c = itemStack.getDynamicPropertyIds().length;
      texts.push({ text: `Property Count: §7${c}§r` });
    }

    if (this.store.get("tags")) {
      const tags = itemStack.getTags().map((x) => `§7${x}§r`);
      if (tags.length !== 0) texts.push({ text: `Tags:\n ${tags.join("\n ")}` });
    }

    const extras = texts.flatMap((v, i) => (i === 0 ? [v] : [{ text: "\n" }, v]));
    player.onScreenDisplay.setActionBar({
      rawtext: [{ text: "§lItem Data§r\n" }, ...extras],
    });
  }

  // Hooks

  buildSettings(settings: Settings): void {
    settings.defineProperty("name", {
      type: "boolean",
      value: true,
      title: "Display name",
    });
    settings.defineProperty("identifier", {
      type: "boolean",
      value: true,
      title: "Display identifier",
    });
    settings.defineProperty("durability", {
      type: "boolean",
      value: true,
      title: "Display durability",
    });
    settings.defineProperty("food", {
      type: "boolean",
      value: true,
      title: "Display food",
    });
    settings.defineProperty("tags", {
      type: "boolean",
      value: true,
      title: "Display tags",
    });
    settings.defineProperty("property_size", {
      type: "boolean",
      value: true,
      title: "Display property size",
    });
    settings.defineProperty("property_count", {
      type: "boolean",
      value: true,
      title: "Display property count",
    });
  }

  // EVENTS

  onTick(event: EntityTickEvent): void {
    if (!(event.entity instanceof Player)) return;
    const equ = event.entity.getComponent("equippable");
    if (!equ) return;
    let itemStack = equ.getEquipment(EquipmentSlot.Mainhand);
    if (!itemStack) {
      itemStack = equ.getEquipment(EquipmentSlot.Offhand);
      if (!itemStack) return;
    }
    this.render(event.entity, itemStack);
  }
}

class DebugModeTool extends DevTool {
  static readonly toolId = "debug_mode";

  constructor() {
    super(DebugModeTool.toolId, {
      name: "Debug Mode",
      description: "Displays debug information.",
    });
  }
}

// Initialize tools
new BlockInfoTool();
new PlayerInfoTool();
new ItemInfoTool();
new DebugModeTool();
