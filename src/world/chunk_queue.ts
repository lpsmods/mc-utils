import { Dimension, system, Vector3, world, BlockPermutation } from "@minecraft/server";

type Request =
  | {
      kind: "blockType";
      pos: Vector3;
      blockId: string;
      dimensionId: string;
    }
  | {
      kind: "blockPermutation";
      pos: Vector3;
      permutation: string;
      dimensionId: string;
    }
  | {
      kind: "spawnEntity";
      pos: Vector3;
      entityId: string;
      dimensionId: string;
    };

/**
 * Queue updates to chunks until they're loaded.
 */
export class ChunkQueue {
  private dimensionId: string;
  private ready = false;

  private requests: Request[] = [];
  private actions: ((dim: Dimension) => void)[] = [];

  constructor(dimensionId: string) {
    this.dimensionId = dimensionId;
    this.load();

    system.runInterval(() => {
      let dim: Dimension | undefined;
      try {
        dim = world.getDimension(this.dimensionId);
      } catch {
        return;
      }
      if (!dim) return;

      this.ready = true;

      const toRun = this.actions;
      this.actions = [];
      for (const action of toRun) {
        action(dim);
      }

      const stillPending: Request[] = [];
      for (const req of this.requests) {
        if (req.dimensionId !== this.dimensionId) {
          stillPending.push(req);
          continue;
        }
        try {
          switch (req.kind) {
            case "blockType": {
              const block = dim.getBlock(req.pos);
              if (block) {
                block.setPermutation(BlockPermutation.resolve(req.blockId));
              } else {
                stillPending.push(req);
              }
              break;
            }

            case "blockPermutation": {
              const block = dim.getBlock(req.pos);
              if (block) {
                block.setPermutation(BlockPermutation.resolve(req.permutation));
              } else {
                stillPending.push(req);
              }
              break;
            }

            case "spawnEntity": {
              const block = dim.getBlock(req.pos);
              if (block) {
                dim.spawnEntity(req.entityId, req.pos);
              } else {
                stillPending.push(req);
              }
              break;
            }
          }
        } catch {
          stillPending.push(req);
        }
      }

      this.requests = stillPending;
      this.save();
    }, 1);
  }

  /**
   * Queue an action that requires the dimension.
   * */
  public enqueue(action: (dim: Dimension) => void) {
    if (this.ready) {
      const dim = world.getDimension(this.dimensionId);
      action(dim);
    } else {
      this.actions.push(action);
    }
  }

  /**
   * Queue a block placement (by block type).
   * */
  public setBlockType(pos: Vector3, blockId: string) {
    this.requests.push({
      kind: "blockType",
      pos,
      blockId,
      dimensionId: this.dimensionId,
    });
    this.save();
  }

  /**
   * Queue a block placement (by BlockPermutation string).
   * */
  public setBlockPermutation(pos: Vector3, permutationId: string) {
    this.requests.push({
      kind: "blockPermutation",
      pos,
      permutation: permutationId,
      dimensionId: this.dimensionId,
    });
    this.save();
  }

  /**
   * Queue an entity spawn.
   * */
  public spawnEntity(pos: Vector3, entityId: string) {
    this.requests.push({
      kind: "spawnEntity",
      pos,
      entityId,
      dimensionId: this.dimensionId,
    });
    this.save();
  }

  /**
   * Save all requests across all dimensions.
   * */
  private save() {
    try {
      const existing = (world.getDynamicProperty("dimQueue:data") as string) || "[]";
      let allRequests: Request[] = [];
      try {
        allRequests = JSON.parse(existing);
      } catch {
        allRequests = [];
      }

      const others = allRequests.filter((r) => r.dimensionId !== this.dimensionId);
      const merged = [...others, ...this.requests];

      world.setDynamicProperty("dimQueue:data", JSON.stringify(merged));
    } catch (e) {
      console.warn("Failed to save queue:", e);
    }
  }

  /**
   * Load requests for this dimension only.
   * */
  private load() {
    try {
      const data = world.getDynamicProperty("dimQueue:data") as string;
      if (data) {
        const allRequests: Request[] = JSON.parse(data);
        this.requests = allRequests.filter((r) => r.dimensionId === this.dimensionId);
      }
    } catch (e) {
      console.warn("Failed to load queue:", e);
      this.requests = [];
    }
  }
}
