import { system, world } from "@minecraft/server";
import { DataUtils } from "./data";
import { PropertyValue } from "./constants";

export class QueueJob<T> {
  readonly queue: Queue<T>;
  readonly item: T;

  constructor(queue: Queue<T>, item: T) {
    this.queue = queue;
    this.item = item;
  }
}

export interface QueueOptions {
  size?: number;
  id?: string;
  persistent?: boolean;
}

export class Queue<T> {
  private static lastId = 0;
  static all = new Map<string, Queue<any>>();

  items: T[] = [];
  lock: boolean = false;
  readonly options: QueueOptions;
  readonly id: string;

  constructor(options?: QueueOptions) {
    this.options = options ?? {};
    this.id = this.options.id ?? (Queue.lastId++).toString();
    Queue.all.set(this.id, this);
    this.load();
  }

  /**
   * Clear all jobs.
   */
  clear(): void {
    this.items = [];
    this.save();
  }

  /**
   * Remove the item.
   */
  remove(item: T): void {
    const index = this.items.indexOf(item);
    delete this.items[index];
    this.lock = false;
    this.save();
  }

  /**
   * Add a new item to the queue.
   * @param {T} item
   */
  put(item: T): void {
    if (this.full()) {
      throw new Error("Queue is full");
    }
    this.items.push(item);
    this.save();
  }

  /**
   * Pop the next item in the queue.
   * @returns {T}
   */
  get(): T {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }
    return this.items.shift() as T;
  }

  /**
   * Whether or not the item exists in the queue.
   * @param {T} item
   * @returns {boolean}
   */
  has(item: T): boolean {
    return this.items.some((i) => i === item);
  }

  /**
   * Whether or not the queue is empty.
   * @returns {boolean}
   */
  empty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Whether or not the queue is full.
   * @returns {boolean}
   */
  full(): boolean {
    return this.options.size !== undefined && this.items.length >= this.options.size;
  }

  /**
   * The size of the queue.
   * @returns {number}
   */
  qsize(): number {
    return this.items.length;
  }

  /**
   * Get the next item in the queue.
   * @returns {T|undefined}
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Remove the current item.
   */
  done(): void {
    this.items.shift();
    this.lock = false;
    this.save();
  }

  /**
   * Delete this queue.
   */
  delete(): void {
    Queue.all.delete(this.id);
    world.setDynamicProperty(`mcutils:queue.${this.id}`);
  }

  /**
   * How to parse the items from storage.
   * @param {string} data
   * @returns {T[]}
   */
  parse(data: PropertyValue): T[] {
    return DataUtils.load(data);
  }

  /**
   * How to store the items in storage.
   * @param items
   * @returns {string}
   */
  stringify(items: T[]): PropertyValue {
    return DataUtils.dump(items);
  }

  /**
   * Save to storage if persistent.
   */
  save(): void {
    if (!this.options.persistent) return;
    const data = this.stringify(this.items);
    world.setDynamicProperty(`mcutils:queue.${this.id}`, data);
  }

  /**
   * Load from storage if persistent.
   */
  load(): void {
    if (!this.options.persistent) return;
    const data = (world.getDynamicProperty(`mcutils:queue.${this.id}`) as string) ?? "[]";
    this.items = this.parse(data);
  }

  run(callback: (job: QueueJob<T>) => Generator<void>) {
    system.runInterval(() => {
      this.lock = true;
      const item = this.peek();
      if (!item) return;
      const job = new QueueJob(this, item);
      system.runJob(callback(job));
    });
  }
}
