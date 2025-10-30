/**
 * Generic attack functions.
 */

import { Entity, EntityDamageCause } from "@minecraft/server";

export interface AttackOptions {
  cause?: EntityDamageCause;
}

export class AttackUtils {
  /**
   * Deal damage in a radius.
   * @param {Entity} source
   * @param {number} radius
   * @param {number} damage
   * @param {AttackOptions} options
   */
  static damageRadius(source: Entity, radius: number, damage: number = 1, options?: AttackOptions): void {
    const targets = source.dimension.getEntities({ maxDistance: radius });
    for (const target of targets) {
      if (target.id === source.id) continue;
      AttackUtils.applyDamage(target, damage, source, options);
    }
  }

  /**
   * Deal knockback in a radius.
   * @param {Entity} source
   * @param {number} radius
   * @param {number} strength
   * @param {AttackOptions} options
   */
  static knockbackRadius(source: Entity, radius: number, strength: number, options?: AttackOptions): void {
    const targets = source.dimension.getEntities({ maxDistance: radius });
    for (const target of targets) {
      if (target.id === source.id) continue;
      target.applyKnockback({ x: 0, z: 0 }, strength); // TODO: Outwards from the source.
    }
  }

  /**
   * Deal damage and knockback in a radius.
   * @param {Entity} source
   * @param {number} radius
   * @param {number} strength
   * @param {AttackOptions} options
   */
  static damageKnockbackRadius(
    source: Entity,
    radius: number,
    strength: number,
    damage: number,
    options?: AttackOptions,
  ): void {
    const targets = source.dimension.getEntities({ maxDistance: radius });
    for (const target of targets) {
      if (target.id === source.id) continue;
      AttackUtils.applyDamage(target, damage, source, options);
      target.applyKnockback({ x: 0, z: 0 }, strength); // TODO: Outwards from the source.
    }
  }

  /**
   * Deal a ray of damage. (Like a laser)
   * @param {Entity} source
   * @param {number} damage
   * @param {AttackOptions} options
   */
  static rayDamage(source: Entity, damage: number, cause?: EntityDamageCause, options?: AttackOptions): void {
    const targets = source.getEntitiesFromViewDirection({ maxDistance: 40 });
    for (const target of targets) {
      if (target.entity.id === source.id) continue;
      target.entity.applyDamage(damage, {
        cause: cause ?? EntityDamageCause.entityAttack,
        damagingEntity: source,
      });
    }
  }

  /**
   * Deal a ray of knockback. (like a knockback stick)
   * @param {Entity} source
   * @param {number} strength
   * @param {AttackOptions} options
   */
  static rayKnockback(source: Entity, strength: number, options?: AttackOptions): void {
    const targets = source.getEntitiesFromViewDirection({ maxDistance: 40 });

    for (const target of targets) {
      if (target.entity.id === source.id) continue;
      const x = target.entity.location.x - source.location.x;
      const z = target.entity.location.z - source.location.z;
      target.entity.applyKnockback({ x, z }, strength); // TODO: Calculate direction from source.
    }
  }

  /**
   * Deal a ray of damage and knockback.
   * @param {Entity} source
   * @param {number} strength
   * @param {number} damage
   * @param {AttackOptions} options
   */
  static rayKnockbackDamage(source: Entity, strength: number, damage: number, options?: AttackOptions): void {
    const targets = source.getEntitiesFromViewDirection({ maxDistance: 40 });
    for (const target of targets) {
      if (target.entity.id === source.id) continue;
      AttackUtils.applyDamage(target.entity, damage, source, options);
      const x = target.entity.location.x - source.location.x;
      const z = target.entity.location.z - source.location.z;
      target.entity.applyKnockback({ x, z }, strength); // TODO: Calculate direction from source.
    }
  }

  /**
   * Deal damage to the target.
   * @param {Entity} target
   * @param {number} damage
   * @param {Entity} source
   * @param {AttackOptions} options
   */
  static applyDamage(target: Entity, damage: number, source?: Entity, options?: AttackOptions): void {
    target.applyDamage(damage, {
      cause: options?.cause ?? EntityDamageCause.entityAttack,
      damagingEntity: source,
    });
  }
}
