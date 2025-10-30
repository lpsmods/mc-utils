import { RGB, Vector3 } from "@minecraft/server";

export type PropertyValue = string | number | boolean | Vector3 | undefined;

export const MAX_EFFECT = 20000000;

export const CENTER_ENTITY = { x: 0.5, y: 0, z: 0.5 };

export const BLACK: RGB = { red: 0, green: 0, blue: 0 };

export const WHITE: RGB = { red: 1, green: 1, blue: 1 };

export const RED: RGB = { red: 1, green: 0, blue: 0 };

export const GREEN: RGB = { red: 0, green: 1, blue: 0 };

export const BLUE: RGB = { red: 0, green: 0, blue: 1 };

export enum ChatColor {
  Aqua = `§b`,
  Black = `§0`,
  Blue = `§9`,
  DarkAqua = `§3`,
  DarkBlue = `§1`,
  DarkGray = `§8`,
  DarkGreen = `§2`,
  DarkPurple = `§5`,
  DarkRed = `§4`,
  Gold = `§6`,
  Gray = `§7`,
  Green = `§a`,
  LightPurple = `§d`,
  MaterialAmethyst = `§u`,
  MaterialCopper = `§n`,
  MaterialDiamond = `§s`,
  MaterialEmerald = `§q`,
  MaterialGold = `§p`,
  MaterialIron = `§i`,
  MaterialLapis = `§t`,
  MaterialNetherite = `§j`,
  MaterialQuartz = `§h`,
  MaterialRedstone = `§m`,
  MaterialResin = `§v`,
  MinecoinGold = `§g`,
  Red = `§c`,
  White = `§f`,
  Yellow = `§e`,
}

export const REPLACEABLE_BLOCKS = [
  "vine",
  "fern",
  "large_fern",
  "short_grass",
  "tall_grass",
  "short_dry_grass",
  "tall_dry_grass",
  "nether_sprouts",
  "bush",
  "glow_lichen",
  "deadbush",
  "seagrass",
  "snow_layer",
];
export const CANDLES = [
  "candle",
  "white_candle",
  "light_gray_candle",
  "gray_candle",
  "black_candle",
  "brown_candle",
  "red_candle",
  "orange_candle",
  "yellow_candle",
  "lime_candle",
  "green_candle",
  "cyan_candle",
  "light_blue_candle",
  "blue_candle",
  "purple_candle",
  "magenta_candle",
  "pink_candle",
];
export const COLORS = [
  "white",
  "light_gray",
  "gray",
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
  "cyan",
  "light_blue",
  "blue",
  "purple",
  "magenta",
  "pink",
];
export const WOOD_TYPES = [
  "oak",
  "spruce",
  "birch",
  "jungle",
  "acacia",
  "dark_oak",
  "mangrove",
  "cherry",
  "pale_oak",
  "bamboo",
  "crimson",
  "warped",
];
export enum Oxidization {
  Normal = 0,
  Exposed = 1,
  Weathered = 2,
  Oxidized = 3,
}
