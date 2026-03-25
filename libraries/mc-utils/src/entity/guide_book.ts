import {
  Entity,
  EntityHitEntityAfterEvent,
  GameMode,
  ItemStack,
  Player,
  PlayerInteractWithEntityBeforeEvent,
  system,
} from "@minecraft/server";
import { clampNumber } from "@minecraft/math";
import { MathUtils } from "@lpsmods/mc-common";
import { defaulted, number, object, optional, string, Struct } from "superstruct";

import { EntityHandler } from "./entity_handler";

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
  constructor(entity: Entity, player: Player, prevPage: number, page: number) {
    super(entity);
    this.player = player;
    this.prevPage = prevPage;
    this.page = page;
  }

  cancel: boolean = false;
  readonly player: Player;
  readonly page: number;
  readonly prevPage: number;
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
    if (!MathUtils.inRange(next, 0, this.guideOptions.maxPages ?? 50)) return;
    const event = new TurnPageEntityEvent(entity, player, page, next);
    if (this.onTurnPage) this.onTurnPage(event);
    if (event.cancel) return;
    if (this.guideOptions.flipAnimation) entity.playAnimation(this.guideOptions.flipAnimation);
    entity.setProperty(
      this.guideOptions.propertyName ?? "mcutils:page",
      clampNumber(next, 0, this.guideOptions.maxPages ?? 50),
    );
  }

  drop(target: Entity, entity: Entity): void {
    if (target instanceof Player && target.getGameMode() !== GameMode.Creative) {
      const stack = new ItemStack(this.guideOptions.itemId ?? "book");
      entity.dimension.spawnItem(stack, entity.location);
    }
    entity.remove();
  }

  // EVENTS

  onHit(event: EntityHitEntityAfterEvent): void {
    if (!event.damagingEntity.isSneaking) return;
    this.drop(event.damagingEntity, event.hitEntity);
  }

  onBeforeInteract(event: PlayerInteractWithEntityBeforeEvent): void {
    system.run(() => {
      this.turnPage(event.target, event.player);
    });
  }

  // CUSTOM EVENTS

  onTurnPage?(event: TurnPageEntityEvent): void;
}
