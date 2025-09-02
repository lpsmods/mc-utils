/**
 * Generic attack functions.
 */

import { Entity } from "@minecraft/server";

export class AttackUtils {
  /**
   * Deal damage in a radius.
   * @param {Entity} source
   * @param {number} radius
   * @param {number} damage
   */
  static damageRadius(source: Entity, radius: number, damage: number = 1) {
    const targets = source.dimension.getEntities({ maxDistance: radius });
    for (const target of targets) {
      target.applyDamage(damage);
    }
  }

  /**
   * Deal knockback in a radius.
   * @param {Entity} source
   * @param {number} radius
   * @param {number} strength
   */
  static knockbackRadius(source: Entity, radius: number, strength: number) {
    const targets = source.dimension.getEntities({ maxDistance: radius });
    for (const target of targets) {
      target.applyKnockback({ x: strength, z: strength }, 0);
    }
  }

  /**
   * Deal damage and knockback in a radius.
   * @param {Entity} source
   * @param {number} radius
   * @param {number} strength
   */
  static damageKnockbackRadius(
    source: Entity,
    radius: number,
    strength: number,
    damage: number,
  ) {
    const targets = source.dimension.getEntities({ maxDistance: radius });
    for (const target of targets) {
      target.applyDamage(damage);
      target.applyKnockback({ x: strength, z: strength }, 0);
    }
  }

  /**
   * Deal a ray of damage.
   * @param {Entity} source
   * @param {number} damage
   */
  static rayDamage(source: Entity, damage: number) {
    const targets = source.getEntitiesFromViewDirection({ maxDistance: 40 });
    for (const target of targets) {
      target.entity.applyDamage(damage);
    }
  }

  /**
   * Deal a ray of knockback.
   * @param {Entity} source
   * @param {number} strength
   */
  static rayKnockback(source: Entity, strength: number) {
    const targets = source.getEntitiesFromViewDirection({ maxDistance: 40 });
    for (const target of targets) {
      target.entity.applyKnockback({ x: strength, z: strength }, 0); // TODO: Calculate direction from source.
    }
  }

  /**
   * Deal a ray of damage and knockback.
   * @param {Entity} source
   * @param {number} strength
   * @param {number} damage
   */
  static rayKnockbackDamage(source: Entity, strength: number, damage: number) {
    const targets = source.getEntitiesFromViewDirection({ maxDistance: 40 });
    for (const target of targets) {
      target.entity.applyDamage(damage);
      target.entity.applyKnockback({ x: strength, z: strength }, 0); // TODO: Calculate direction from source.
    }
  }
}
