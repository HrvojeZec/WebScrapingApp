import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { addStore } from '../src/router/store/stores-service';
import { Stores } from '../src/model/storesModel';

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
