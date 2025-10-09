import { Dimension, Vector3 } from "@minecraft/server";
import { CustomFeature } from "./feature";
import { Vector3Utils } from "@minecraft/math";

export abstract class FeatureUtils {
  static underBlocks<T>(
    feature: CustomFeature,
    dimension: Dimension,
    location: Vector3,
    callback: (pos: Vector3) => T,
    minY: number,
  ): T | undefined {
    const size = feature.getSize();
    for (let x = 0; x < size.x; x++) {
      for (let z = 0; z < size.z; z++) {
        for (let y = location.y; y > minY; y--) {
          const pos = Vector3Utils.add(location, { x, y, z });
          const block = dimension.getBlock(pos);
          if (!block) continue;
          if (!block.isAir) continue;
          const res = callback(block);
          if (res !== undefined) return res;
        }
      }
    }
    return undefined;
  }
}
