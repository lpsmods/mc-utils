export interface EventListener<T, O> {
  callback: (event: T) => void;
  options?: O;
}

export abstract class EventSignal<T, O = undefined> {
  listeners: EventListener<T, O>[] = [];

  constructor() {}

  get size(): number {
    return this.listeners.length;
  }

  subscribe(callback: (event: T) => void, options?: O): (event: T) => void {
    this.listeners.push({ callback, options });
    return callback;
  }

  unsubscribe(callback: (event: T) => void): void {
    this.listeners = this.listeners.filter((fn) => fn.callback !== callback);
  }

  apply(event: T): void {
    for (const fn of this.listeners) {
      try {
        fn.callback(event);
      } catch (err) {
        console.error(err);
      }
    }
  }
}
