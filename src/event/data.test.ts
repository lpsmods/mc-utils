import { DataStorageEvents } from "./data";

export default () => {
  DataStorageEvents.readData.subscribe((event) => {
    console.warn(`READ ${event.store.rootId}`);
  });
  DataStorageEvents.writeData.subscribe((event) => {
    console.warn(`WRITE ${event.store.rootId}`);
  });
};
