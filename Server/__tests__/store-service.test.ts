import {
  connectMemoryMongoDB,
  disconnectMemoryMongoDB,
  clearDatabase,
} from '../src/test-utils/setup-mongodb';
import { addStore, createStoreData } from '../src/router/store/stores-service';
import { Stores } from '../src/model/storesModel';
import { StoresData } from '../src/boostrap/setup';

beforeAll(async () => {
  await connectMemoryMongoDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectMemoryMongoDB();
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
