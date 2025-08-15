import { EntityHandler } from "./EntityHandler";

export class PlayerHandler extends EntityHandler {
  constructor() {
    super({ type: "player" });
  }
}
