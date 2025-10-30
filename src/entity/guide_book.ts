import {
  Entity,
  EntityHitEntityAfterEvent,
  ItemStack,
  Player,
  PlayerInteractWithEntityBeforeEvent,
  system,
} from "@minecraft/server";
import { EntityHandler } from "./entity_handler";
import { defaulted, number, object, optional, string, Struct } from "superstruct";
import { clampNumber } from "@minecraft/math";

export interface GuideBookEntityOptions {
  itemId?: string;
  propertyName?: string;
  maxPages?: number;
  flipAnimation?: string;
}

const struct: Struct<any> = object({
  itemId: optional(string()),
  propertyName: defaulted(string(), "mcutils:page"),
  maxPages: defaulted(number(), 50),
});

export class GuideBookEntityEvent {
  constructor(entity: Entity) {
    this.entity = entity;
  }

  readonly entity: Entity;
}

export class TurnPageEntityEvent extends GuideBookEntityEvent {
  constructor(entity: Entity, player: Player, page: number) {
    super(entity);
    this.player = player;
    this.page = page;
  }

  cancel: boolean = false;
  readonly player: Player;
  readonly page: number;
}

export class GuideBookEntity extends EntityHandler {
  guideOptions: GuideBookEntityOptions;

  constructor(entityId: string, guideOptions: GuideBookEntityOptions) {
    super({ type: entityId });
    this.guideOptions = struct.create(guideOptions ?? {});
    this.onHit = this.onHit.bind(this);
    this.onBeforeInteract = this.onBeforeInteract.bind(this);
  }

  turnPage(entity: Entity, player: Player): void {
    const page = entity.getProperty(this.guideOptions.propertyName ?? "mcutils:page") as number;
    const next = player.isSneaking ? page - 1 : page + 1;
    const event = new TurnPageEntityEvent(entity, player, page);
    if (this.onTurnPage) this.onTurnPage(event);
    if (event.cancel) return;
    if (this.guideOptions.flipAnimation) entity.playAnimation(this.guideOptions.flipAnimation);
    entity.setProperty(
      this.guideOptions.propertyName ?? "mcutils:page",
      clampNumber(next, 0, this.guideOptions.maxPages ?? 50),
    );
  }

  drop(entity: Entity): void {
    const stack = new ItemStack(this.guideOptions.itemId ?? "book");
    entity.dimension.spawnItem(stack, entity.location);
    entity.remove();
  }

  // EVENTS

  onHit(event: EntityHitEntityAfterEvent): void {
    if (!event.damagingEntity.isSneaking) return;
    this.drop(event.hitEntity);
  }

  onBeforeInteract(event: PlayerInteractWithEntityBeforeEvent): void {
    system.run(() => {
      this.turnPage(event.target, event.player);
    });
  }

  // CUSTOM EVENTS

  onTurnPage?(event: TurnPageEntityEvent): void;
}
