import {
  findProductsByKeyword,
  paginationHandler,
  findAllKeywords,
} from '../src/router/product/product-service';
import {
  connectMemoryMongoDB,
  clearDatabase,
  disconnectMemoryMongoDB,
} from './test-utils/setup-mongodb';
import { Product } from '../src/model/productModel';
import { testStoreData, testProductData } from './test-data/productData';
import { Stores } from '../src/model/storesModel';

beforeAll(async () => {
  await connectMemoryMongoDB();
});

beforeEach(async () => {
  await Stores.create(testStoreData);
  await Product.create(testProductData);
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectMemoryMongoDB();
});
describe('findAllkeywords function', () => {
  test('should find all keyword', async () => {
    const keywords = await findAllKeywords();
    expect(keywords).toContain('iphone');
    expect(keywords).toContain('laptop');
  });
});
describe('findProductsByKeyword function', () => {
  test('should return products with store attributes by keyword', async () => {
    const { skip, limit } = await paginationHandler('iphone', 1, 10);
    const products = await findProductsByKeyword('iphone', skip, limit);

    expect(products.length).toBeGreaterThan(0);
    expect(products[0].storeName).toBe('Test Mall');
    expect(products[0]).toHaveProperty('logo');
    expect(products[0].keyword).toBe('iphone');
  });
});
