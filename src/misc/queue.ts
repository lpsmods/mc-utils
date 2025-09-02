// TODO: Add option to preserve queue between reloads. (dynamic property)

import { system, world } from "@minecraft/server";

export class QueueJob<T> {
  readonly queue: Queue<T>;
  readonly item: T;

  constructor(queue: Queue<T>, item: T) {
    this.queue = queue;
    this.item = item;
  }
}

export class Queue<T> {
  private static all = new Map<string, Queue<any>>();
  private static lastId = 0;

  private items: T[] = [];
  lock: boolean = false;
  maxSize: number | undefined;
  persistent: boolean;
  readonly id: string;

  constructor(maxSize?: number, id?: string, persistent?: boolean) {
    this.maxSize = maxSize;
    this.id = id ?? (Queue.lastId++).toString();
    this.persistent = persistent ?? false;
    Queue.all.set(this.id, this);
    this.load();
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
    return this.maxSize !== undefined && this.items.length >= this.maxSize;
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
    if (this.items[0] === undefined) return;
    delete this.items[0];
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
  parse(data: string): T[] {
    return JSON.parse(data);
  }

  /**
   * How to store the items in storage.
   * @param items
   * @returns {string}
   */
  stringify(items: T[]): string {
    return JSON.stringify(items);
  }

  /**
   * Save to storage if persistent.
   */
  save(): void {
    if (!this.persistent) return;
    const data = this.stringify(this.items);
    world.setDynamicProperty(`mcutils:queue.${this.id}`, data);
  }

  /**
   * Load from storage if persistent.
   */
  load(): void {
    if (!this.persistent) return;
    const data = world.getDynamicProperty(`mcutils:queue.${this.id}`) as string;
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

function test() {
  const queue = new Queue<string>();
  queue.put("job");

  queue.run(function* (job: QueueJob<string>): Generator<void> {
    // Process item.
    console.warn(job.item);

    // Mark as complete.
    job.queue.done();
  });
}
