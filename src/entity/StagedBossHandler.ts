import { EntityQueryOptions } from "@minecraft/server";
import { BossHandler } from "./BossHandler";

// TODO:
export class StagedBossHandler extends BossHandler {

  constructor(options: EntityQueryOptions) {
    super(options);
  }
}
