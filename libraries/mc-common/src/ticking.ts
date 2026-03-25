import { system } from "@minecraft/server";

export abstract class Ticking {
  static all: Map<number, Ticking> = new Map<number, Ticking>();
  enabled: boolean = false;
  readonly runId: number;

  constructor(tickInterval?: number) {
    this.runId = this.init(tickInterval);
    Ticking.all.set(this.runId, this);
  }

  private pTick(): void {
    if (!this.enabled) return;
    if (this.tick) this.tick();
  }

  /**
   * Creates the tick event.
   * @param {number} tickInterval An interval of every N ticks that the callback will be called upon.
   */
  private init(tickInterval?: number): number {
    return system.runInterval(this.pTick.bind(this), tickInterval);
  }

  /**
   * Clears this classes ticking.
   */
  remove(): void {
    if (!this.runId) return;
    system.clearRun(this.runId);
    Ticking.all.delete(this.runId);
  }

  // EVENTS

  tick?(): void;
}
