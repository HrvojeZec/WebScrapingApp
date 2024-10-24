import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { addStore, createStoreData } from '../src/router/store/stores-service';
import { Stores } from '../src/model/storesModel';
import { StoresData } from '../src/boostrap/setup';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Stores.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('addStore function', () => {
  test('should successfully add a store that does not exist', async () => {
    const result = await addStore({ storeName: 'NewStore' });

    expect(result).toEqual({ success: true });
  });

  test('should return error if store already exists', async () => {
    await Stores.create({ storeName: 'ExistingStore', logo: null });

    const result = await addStore({ storeName: 'ExistingStore' });

    expect(result).toEqual({ success: false, error: 'STORE_ALREADY_EXISTS' });
  });
});

describe('createStoreData', () => {
  test('should add new stores to database', async () => {
    await createStoreData();

    const storesInDb = await Stores.find();
    expect(storesInDb.length).toBe(StoresData.length);
    expect(storesInDb.map((store) => store.storeName)).toEqual(
      StoresData.map((store) => store.storeName),
    );
  });

  test('should not add new store in database if already exists', async () => {
    await Stores.insertMany(StoresData);
    await createStoreData();

    const storesInDb = await Stores.find();
    expect(storesInDb.length).toEqual(StoresData.length);
  });

  test('only those stores that are not in the database sholud be added', async () => {
    await Stores.insertMany({ storeName: 'Mall', logo: null });
    await createStoreData();

    const storesInDb = await Stores.find();
    expect(storesInDb.length).toEqual(StoresData.length);
    expect(
      storesInDb.some((store) => store.storeName === 'Sancta Domenica'),
    ).toBe(true);
  });
});
