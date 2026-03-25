import { Player } from "@minecraft/server";
import { DataStorage } from "@lpsmods/mc-common";

export interface CooldownData {
  started: number;
  cooldownTicks: number;
}

export class CooldownManager {
  private static getStorage(player: Player) {
    return new DataStorage("mcutils:cooldown_manager", { object: player });
  }

  static getCooldown(player: Player, cooldownCategory: string): CooldownData | undefined {
    const cooldown = this.getStorage(player).get(cooldownCategory);
    if (!cooldown) return;
    return cooldown;
  }

  static getTicks(player: Player, cooldownCategory: string): number {
    const cooldown = this.getCooldown(player, cooldownCategory);
    if (!cooldown) return 0;
    return cooldown.cooldownTicks;
  }

  static getTicksRemaining(player: Player, cooldownCategory: string): number {
    const cooldown = this.getCooldown(player, cooldownCategory);
    if (!cooldown) return 0;
    const now = new Date().getTime() / 50;
    const elapsed = now - cooldown.started;
    const res = Math.max(cooldown.cooldownTicks - elapsed, 0);
    return res;
  }

  static startCooldown(player: Player, cooldownTicks: number, cooldownCategory: string): void {
    const now = new Date();
    const store = this.getStorage(player);
    store.set(cooldownCategory, {
      cooldownTicks: Math.floor(cooldownTicks),
      started: Math.floor(now.getTime() / 50),
    });
  }
}
