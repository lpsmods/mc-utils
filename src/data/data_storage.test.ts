import { DataStorage, VersionedDataSchema, VersionedDataStorage } from "./data_storage";

function dataStorage(): void {
  const store = new DataStorage("test:data_storage");
}

function versionedDataStorageV1(): void {
  const store = new VersionedDataStorage("test:versioned_data_storage", 1);
  store.set("key_v1", "Hello, World!");
}

function versionedDataStorageV2(): void {
  const store = new VersionedDataStorage("test:versioned_data_storage", 2);
  const schema1: VersionedDataSchema = {
    minFormat: 1,
    maxFormat: 2,
    callback: (data) => {
      const value = data.key_v1;
      data.key_v2 = value;
      delete data.key_v1;
    },
  };
  store.addSchema("UpdateKeyV1", schema1);

  // Force it to update.
  store.read();
}

export default () => {
  // dataStorage();
  versionedDataStorageV1();
  versionedDataStorageV2();
};
