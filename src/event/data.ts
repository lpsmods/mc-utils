import { DataStorage } from "../data";
import { EventSignal } from "./utils";

export abstract class DataEvent {
  constructor(store: DataStorage, propertyName?: string) {
    this.store = store;
    this.propertyName = propertyName;
  }

  readonly store: DataStorage;
  readonly propertyName: string | undefined;
}

export class ReadDataEvent extends DataEvent {}

export class WriteDataEvent extends DataEvent {}

export class DeleteDataEvent extends DataEvent {}

export class ReadDataEventSignal extends EventSignal<ReadDataEvent> {}

export class WriteDataEventSignal extends EventSignal<WriteDataEvent> {}

export class DeleteDataEventSignal extends EventSignal<DeleteDataEvent> {}

export class DataStorageEvents {
  private constructor() {}

  /**
   * This event fires when data is read from DataStorage.
   * @eventProperty
   */
  static readonly readData = new ReadDataEventSignal();

  /**
   * This event fires when data is written to DataStorage.
   * @eventProperty
   */
  static readonly writeData = new WriteDataEventSignal();

  /**
   * This event fires when data is removed from DataStorage.
   * @eventProperty
   */
  static readonly deleteData = new DeleteDataEventSignal();
}
