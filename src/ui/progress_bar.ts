import { Player, RawMessage, world } from "@minecraft/server";
import { clampNumber } from "@minecraft/math";
import { Ticking } from "../ticking";
import { ChatColor } from "../constants";

export interface ProgressBarStyle {
  fill: string;
  empty: string;
  leftCap?: string;
  rightCap?: string;
  showPercent?: boolean;
  scale?: number;
}

export abstract class ProgressBarStyles {
  static readonly Default: ProgressBarStyle = {
    fill: "#",
    empty: "-",
    leftCap: "[",
    rightCap: "]",
  };
  static readonly Modern: ProgressBarStyle = {
    fill: "■",
    empty: "□",
    leftCap: "<",
    rightCap: ">",
  };
  static readonly Thin: ProgressBarStyle = { fill: "-", empty: "-" };
  static readonly Square: ProgressBarStyle = {
    fill: "█",
    empty: "█",
    scale: 0.5,
  };
}

export interface ProgressBarColor {
  fill: string | ChatColor;
  empty: string | ChatColor;
  leftCap: string | ChatColor;
  rightCap: string | ChatColor;
}

export abstract class ProgressBarColors {
  static readonly Aqua: ProgressBarColor = {
    fill: ChatColor.Aqua,
    empty: ChatColor.DarkAqua,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Blue: ProgressBarColor = {
    fill: ChatColor.Blue,
    empty: ChatColor.DarkBlue,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Green: ProgressBarColor = {
    fill: ChatColor.Green,
    empty: ChatColor.DarkGreen,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Purple: ProgressBarColor = {
    fill: ChatColor.LightPurple,
    empty: ChatColor.DarkPurple,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Red: ProgressBarColor = {
    fill: ChatColor.Red,
    empty: ChatColor.DarkRed,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly White: ProgressBarColor = {
    fill: ChatColor.White,
    empty: ChatColor.Gray,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Yellow: ProgressBarColor = {
    fill: ChatColor.Yellow,
    empty: ChatColor.Gold,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Gray: ProgressBarColor = {
    fill: ChatColor.Gray,
    empty: ChatColor.DarkGray,
    leftCap: "§l",
    rightCap: "§l",
  };
  static readonly Orange: ProgressBarColor = {
    fill: ChatColor.MaterialResin,
    empty: ChatColor.MaterialCopper,
    leftCap: "§l",
    rightCap: "§l",
  };
}

export class ProgressBar extends Ticking {
  static stack = new Map<string, ProgressBar>();
  readonly id: string;
  name?: RawMessage;
  visible: boolean = true;
  style: ProgressBarStyle = ProgressBarStyles.Default;
  color: ProgressBarColor = ProgressBarColors.Gray;
  maxValue: number = 100;

  constructor(id: string, name?: RawMessage) {
    super();
    this.id = id;
    this.name = name;
    ProgressBar.stack.set(id, this);
  }

  get value(): number {
    return (world.getDynamicProperty(`progressbar:${this.id}`) as number) ?? 0;
  }

  set value(v: number) {
    world.setDynamicProperty(`progressbar:${this.id}`, clampNumber(v, 0, this.maxValue));
  }

  getPlayers() {
    return world.getAllPlayers().filter((player) => (this.condition ? this.condition(player) : true));
  }

  tick(): void {
    if (!this.visible) return;
    if (this.onTick) this.onTick(this);
    for (const player of this.getPlayers()) {
      this.render(player);
    }
  }

  private getBar(player: Player): string {
    let sf = this.style.fill;
    let se = this.style.empty;
    let sw = (this.style.scale ?? 1.0) * 20;
    let slc = this.style.leftCap ?? "";
    let src = this.style.rightCap ?? "";
    const ratio = this.maxValue > 0 ? clampNumber(this.value / this.maxValue, 0, 1) : this.value > 0 ? 1 : 0;
    const filledCells = Math.round(ratio * sw);
    const fillStr = sf.repeat(sw).slice(0, filledCells * sf.length);
    const emptyStr = se.repeat(sw).slice(0, (sw - filledCells) * se.length);
    const bar = `${this.color.leftCap}${slc}§r${this.color.fill}${fillStr}§r${this.color.empty}${emptyStr}§r${this.color.rightCap}${src}§r`;
    const per = Math.round(clampNumber((this.value / this.maxValue) * 100, 0, 100));
    return this.style.showPercent ? `${bar} ${per}%` : bar;
  }

  render(player: Player): void {
    const bar = this.getBar(player);
    player.onScreenDisplay.setActionBar(this.name ? { rawtext: [this.name, { text: "\n" }, { text: bar }] } : bar);
  }

  remove(): void {
    super.remove();
    ProgressBar.stack.delete(this.id);
  }

  /**
   * Condition to filter out players to render the progress bar for.
   * @param player
   */
  condition?(player: Player): boolean;

  /**
   * Fires every tick if visible.
   * @param {ProgressBar} bar
   */
  onTick?(bar: ProgressBar): void;
}
