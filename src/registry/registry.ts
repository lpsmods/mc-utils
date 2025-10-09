import { Id, Identifier } from "../identifier";

export abstract class Registry<T> {
  static readonly registryId: string;
  private instances = new Map<string, T>();

  constructor() {}

  get size(): number {
    return this.instances.size;
  }

  register(name: Id, object: T): T | undefined {
    const id = Identifier.string(name);
    this.instances.set(id, object);
    return object;
  }

  unregister(name: Id): void {
    const id = Identifier.string(name);
    this.instances.delete(id);
  }

  keys(): MapIterator<string> {
    return this.instances.keys();
  }

  values(): MapIterator<T> {
    return this.instances.values();
  }

  entries(): MapIterator<[string, T]> {
    return this.instances.entries();
  }

  get(name: Id, fallback?: any): T | undefined {
    const id = Identifier.string(name);
    return this.instances.get(id) ?? fallback;
  }

  has(name: Id): boolean {
    const id = Identifier.string(name);
    return this.instances.has(id);
  }
}
