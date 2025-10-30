import { Player } from "@minecraft/server";
import { DataStorage } from "./data";

export class CooldownManager {
  private static getStorage(player: Player) {
    return new DataStorage("mcutils:cooldown_manager", player);
  }

  static getTicks(player: Player, cooldownCategory: string): number {
    const cooldown = this.getStorage(player).get(cooldownCategory, {});
    return cooldown.cooldownTicks;
  }

  static getTicksRemaining(player: Player, cooldownCategory: string): number {
    const cooldown = this.getStorage(player).get(cooldownCategory, {});
    const now = new Date().getTime() / 50;
    const elapsed = now - cooldown.started;
    const res = Math.max(cooldown.cooldownTicks - elapsed, 0);
    return res;
  }

  static startCooldown(player: Player, cooldownTicks: number, cooldownCategory: string): void {
    const now = new Date();
    const store = this.getStorage(player);
    store.set(cooldownCategory, { cooldownTicks: Math.floor(cooldownTicks), started: Math.floor(now.getTime() / 50) });
  }
}
