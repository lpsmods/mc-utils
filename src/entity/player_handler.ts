import { EntityHandler } from "./entity_handler";

export class PlayerHandler extends EntityHandler {
  constructor() {
    super({ type: "player" });
  }
}
