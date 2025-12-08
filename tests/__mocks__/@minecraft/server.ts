import { VECTOR3_ZERO } from "@minecraft/math";
import { Vector3 } from "@minecraft/server";
import { vi } from "vitest";

const eventSignal = { subscribe: vi.fn((cb: () => void) => 1) };

export const world = {
  sendMessage: vi.fn((msg: string) => console.log("[Mock world]", msg)),
  getDimension: vi.fn((location: Vector3) => new Dimension()),
  getDay: vi.fn(() => 256),
  getTimeOfDay: vi.fn(() => 1),
  getMoonPhase: vi.fn(() => MoonPhase.FullMoon),
  getEntity: vi.fn(() => new Entity()),
  beforeEvents: {
    effectAdd: eventSignal,
    entityRemove: eventSignal,
    explosion: eventSignal,
    itemUse: eventSignal,
    playerBreakBlock: eventSignal,
    playerGameModeChange: eventSignal,
    playerInteractWithBlock: eventSignal,
    playerInteractWithEntity: eventSignal,
    playerLeave: eventSignal,
    weatherChange: eventSignal,
  },
  afterEvents: {
    blockExplode: eventSignal,
    buttonPush: eventSignal,
    dataDrivenEntityTrigger: eventSignal,
    effectAdd: eventSignal,
    entityDie: eventSignal,
    entityHealthChanged: eventSignal,
    entityHitBlock: eventSignal,
    entityHitEntity: eventSignal,
    entityHurt: eventSignal,
    entityLoad: eventSignal,
    entityRemove: eventSignal,
    entitySpawn: eventSignal,
    explosion: eventSignal,
    gameRuleChange: eventSignal,
    itemCompleteUse: eventSignal,
    itemReleaseUse: eventSignal,
    itemStartUse: eventSignal,
    itemStartUseOn: eventSignal,
    itemStopUse: eventSignal,
    itemStopUseOn: eventSignal,
    itemUse: eventSignal,
    leverAction: eventSignal,
    pistonActivate: eventSignal,
    playerBreakBlock: eventSignal,
    playerButtonInput: eventSignal,
    playerDimensionChange: eventSignal,
    playerEmote: eventSignal,
    playerGameModeChange: eventSignal,
    playerHotbarSelectedSlotChange: eventSignal,
    playerInputModeChange: eventSignal,
    playerInputPermissionCategoryChange: eventSignal,
    playerInteractWithBlock: eventSignal,
    playerInteractWithEntity: eventSignal,
    playerInventoryItemChange: eventSignal,
    playerJoin: eventSignal,
    playerLeave: eventSignal,
    playerPlaceBlock: eventSignal,
    playerSpawn: eventSignal,
    pressurePlatePop: eventSignal,
    pressurePlatePush: eventSignal,
    projectileHitBlock: eventSignal,
    projectileHitEntity: eventSignal,
    targetBlockHit: eventSignal,
    tripWireTrip: eventSignal,
    weatherChange: eventSignal,
    worldLoad: eventSignal,
  },
};

export enum ItemLockMode {
  inventory = "inventory",
  none = "none",
  slot = "slot",
}

export enum Direction {
  North = "North",
  East = "East",
  South = "South",
  West = "West",
  Up = "Up",
  Down = "Down",
}

export enum MemoryTier {
  SuperLow = 0,
  Low = 1,
  Mid = 2,
  High = 3,
  SuperHigh = 4,
}

export enum MoonPhase {
  FullMoon = 0,
  WaningGibbous = 1,
  FirstQuarter = 2,
  WaningCrescent = 3,
  NewMoon = 4,
  WaxingCrescent = 5,
  LastQuarter = 6,
  WaxingGibbous = 7,
}

export const system = {
  run: (cb: Function) => cb(),
  runTimeout: (cb: Function, _ticks: number) => cb(),
  runInterval: (cb: Function, _ticks: number) => cb(),
  serverSystemInfo: {
    memoryTier: MemoryTier.Mid,
  },
};

const Entity = vi.fn(
  class {
    readonly dimension = new Dimension();
    readonly id = "12345";
    readonly isClimbing = false;
    readonly isFalling = false;
    readonly isInWater = false;
    readonly isOnGround = false;
    readonly isSleeping = false;
    readonly isSneaking = false;
    readonly isSprinting = false;
    readonly isSwimming = false;
    readonly isValid = true;
    readonly localizationKey = "entity.creeper.name";
    readonly location = VECTOR3_ZERO;
    readonly typeId = "minecraft:creeper";
    nameTag = "";

    addEffect = vi.fn();
    addTag = vi.fn();
    applyDamage = vi.fn();
    applyImpulse = vi.fn();
    applyKnockback = vi.fn();
    clearDynamicProperties = vi.fn();
    clearVelocity = vi.fn();
    extinguishFire = vi.fn();
    getBlockFromViewDirection = vi.fn();
    getComponent = vi.fn((componentId) => {});
    getComponents = vi.fn();
    getDynamicProperty = vi.fn();
    getDynamicPropertyIds = vi.fn();
    getDynamicPropertyTotalByteCount = vi.fn();
    getEffect = vi.fn();
    getEffects = vi.fn();
    getEntitiesFromViewDirection = vi.fn();
    getHeadLocation = vi.fn();
    getProperty = vi.fn();
    getRotation = vi.fn(() => {
      return { x: 0, y: 0 };
    });
    getTags = vi.fn();
    getVelocity = vi.fn();
    getViewDirection = vi.fn();
    hasComponent = vi.fn();
    hasTag = vi.fn();
    kill = vi.fn();
    lookAt = vi.fn();
    matches = vi.fn();
    playAnimation = vi.fn();
    remove = vi.fn();
    removeEffect = vi.fn();
    removeTag = vi.fn();
    resetProperty = vi.fn();
    runCommand = vi.fn();
    setDynamicProperties = vi.fn();
    setDynamicProperty = vi.fn();
    setOnFire = vi.fn();
    setProperty = vi.fn();
    setRotation = vi.fn();
    teleport = vi.fn();
    triggerEvent = vi.fn();
    tryTeleport = vi.fn();
  },
);

export const BlockVolumeBase = vi.fn(class {});

export const BlockVolume = class extends BlockVolumeBase {
  constructor(
    public from: Vector3,
    public to: Vector3,
  ) {
    super();
  }

  isInside(v: Vector3): boolean {
    return (
      v.x >= Math.min(this.from.x, this.to.x) &&
      v.x <= Math.max(this.from.x, this.to.x) &&
      v.y >= Math.min(this.from.y, this.to.y) &&
      v.y <= Math.max(this.from.y, this.to.y) &&
      v.z >= Math.min(this.from.z, this.to.z) &&
      v.z <= Math.max(this.from.z, this.to.z)
    );
  }
};

export const Player = class extends Entity {
  readonly name = "Steve";
};

export const Dimension = vi.fn(
  class {
    heightRange = { max: 256, min: -64 };
    readonly id = "minecraft:overworld";
    readonly localizationKey = "dimension.dimensionName0";
    containsBlock = vi.fn();
    createExplosion = vi.fn();
    fillBlocks = vi.fn();
    getBiome = vi.fn((location) => new BiomeType());
    getBlock = vi.fn((location) => new Block());
    getBlockAbove = vi.fn();
    getBlockBelow = vi.fn();
    getBlockFromRay = vi.fn();
    getBlocks = vi.fn();
    getEntities = vi.fn(() => [new Entity()]);
    getEntitiesAtBlockLocation = vi.fn();
    getEntitiesFromRay = vi.fn();
    getLightLevel = vi.fn();
    getPlayers = vi.fn();
    getSkyLightLevel = vi.fn();
    getTopmostBlock = vi.fn();
    isChunkLoaded = vi.fn();
    placeFeature = vi.fn();
    placeFeatureRule = vi.fn();
    playSound = vi.fn();
    runCommand = vi.fn();
    setBlockPermutation = vi.fn();
    setBlockType = vi.fn();
    setWeather = vi.fn();
    spawnEntity = vi.fn();
    spawnItem = vi.fn();
    spawnParticle = vi.fn();
  },
);

export const ItemStack = vi.fn(
  class {
    constructor(public typeId: string) {}
    readonly isStackable = false;
    readonly maxAmount = 64;
    readonly weight = 1;
    amount = 0;
    keepOnDeath = false;
    localizationKey = "item.paper";
    lockMode = ItemLockMode.none;
    nameTag = "Custom Name";
    type = new ItemType();

    clearDynamicProperties = vi.fn();
    clone = vi.fn();
    getCanDestroy = vi.fn();
    getCanPlaceOn = vi.fn();
    getComponent = vi.fn();
    getComponents = vi.fn();
    getDynamicProperty = vi.fn();
    getDynamicPropertyIds = vi.fn();
    getDynamicPropertyTotalByteCount = vi.fn();
    getLore = vi.fn();
    getRawLore = vi.fn();
    getTags = vi.fn(() => []);
    hasComponent = vi.fn();
    hasTag = vi.fn((tag) => true);
    isStackableWith = vi.fn();
    matches = vi.fn((name) => true);
    setCanDestroy = vi.fn();
    setCanPlaceOn = vi.fn();
    setDynamicProperties = vi.fn();
    setDynamicProperty = vi.fn();
    setLore = vi.fn();
  },
);

export const BlockPermutation = vi.fn(class {});

export const Block = vi.fn(
  class {
    readonly typeId = "minecraft:stone";
    readonly type = new BlockType();
    readonly x = 0;
    readonly y = 0;
    readonly z = 0;
    readonly dimension = new Dimension();
    readonly isAir = false;
    readonly isLiquid = false;
    readonly isValid = true;
    readonly isWaterlogged = false;
    readonly localizationKey = "block.stone.name";
    readonly location = VECTOR3_ZERO;
    readonly permutation = new BlockPermutation();

    above = vi.fn();
    below = vi.fn();
    bottomCenter = vi.fn();
    canBeDestroyedByLiquidSpread = vi.fn();
    canContainLiquid = vi.fn();
    center = vi.fn();
    east = vi.fn();
    getComponent = vi.fn();
    getItemStack = vi.fn();
    getLightLevel = vi.fn();
    getRedstonePower = vi.fn();
    getSkyLightLevel = vi.fn();
    getTags = vi.fn();
    hasTag = vi.fn();
    isLiquidBlocking = vi.fn();
    liquidCanFlowFromDirection = vi.fn();
    liquidSpreadCausesSpawn = vi.fn();
    matches = vi.fn((cb: (name: string, states?: {}) => void) => true);
    north = vi.fn();
    offset = vi.fn();
    setPermutation = vi.fn();
    setType = vi.fn();
    setWaterlogged = vi.fn();
    south = vi.fn();
    west = vi.fn();
  },
);

export const BiomeType = vi.fn(
  class {
    readonly id = "minecraft:plains";
  },
);

export const BiomeTypes = {
  get: vi.fn((name) => new BiomeType()),
};

export const BlockType = vi.fn(
  class {
    readonly id = "minecraft:air";
  },
);

export const BlockTypes = {
  get: vi.fn((name) => new BlockType()),
};

export const EffectType = vi.fn(
  class {
    getName() {
      return "minecraft:haste";
    }
  },
);

export const EffectTypes = {
  get: vi.fn((name) => new EffectType()),
};

export const EnchantmentType = vi.fn(
  class {
    readonly id = "minecraft:mending";
  },
);

export const EnchantmentTypes = {
  get: vi.fn((name) => new EnchantmentType()),
};

export const EntityType = vi.fn(
  class {
    readonly id = "minecraft:creeper";
  },
);

export const EntityTypes = {
  get: vi.fn((name) => new EntityType()),
};

export const ItemType = vi.fn(
  class {
    readonly id = "minecraft:paper";
  },
);

export const ItemTypes = {
  get: vi.fn((name) => new ItemType()),
};

export const DimensionType = vi.fn(
  class {
    readonly typeId = "minecraft:paper";
  },
);

export const DimensionTypes = {
  getAll: vi.fn(() => [
    { typeId: "minecraft:overworld" },
    { typeId: "minecraft:nether" },
    { typeId: "minecraft:the_end" },
  ]),
};

export class InvalidEntityError {}
