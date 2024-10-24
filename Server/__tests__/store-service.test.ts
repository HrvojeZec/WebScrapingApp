import { addStore } from '../src/router/store/stores-service';
import { Stores } from '../src/model/storesModel';

jest.mock('../src/model/storesModel');

describe('addStore function', () => {
  test('sholud successfully add a store', async () => {
    (Stores.findOne as jest.Mock).mockResolvedValue(null);
    (Stores.insertMany as jest.Mock).mockResolvedValue([
      { storeName: 'newStore', logo: null },
    ]);

    const result = await addStore({ storeName: 'newStore' });

    expect(result).toEqual({ success: true });
  });

  test('sholud return error if store already exists', async () => {
    (Stores.findOne as jest.Mock).mockResolvedValue(true);
    const result = await addStore({ storeName: 'existingStore' });

    expect(result).toEqual({ success: false, error: 'STORE_ALREADY_EXISTS' });
  });
});
