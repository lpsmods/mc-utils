import { system } from "@minecraft/server";

export abstract class Ticking {
  static all: Map<number, Ticking> = new Map<number, Ticking>();
  readonly runId: number;

  constructor(tickInterval?: number) {
    this.runId = this.init(tickInterval);
    Ticking.all.set(this.runId, this);
  }

  abstract tick(): void;

  /**
   * Creates the tick event.
   * @param {number} tickInterval An interval of every N ticks that the callback will be called upon.
   */
  init(tickInterval?: number): number {
    return system.runInterval(this.tick.bind(this), tickInterval);
  }

  /**
   * Clears this classes ticking.
   */
  remove(): void {
    if (!this.runId) return;
    system.clearRun(this.runId);
    Ticking.all.delete(this.runId);
  }
}
