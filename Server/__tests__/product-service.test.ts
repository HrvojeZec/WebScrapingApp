import {
  findAllKeywords,
  findProductsByKeyword,
  findAllProducts,
  findRandomProducts,
  findProductsByScrapeId,
  paginationHandler,
} from '../src/router/product/product-service';
import {
  connectMemoryMongoDB,
  clearDatabase,
  disconnectMemoryMongoDB,
} from '../src/test-utils/setup-mongodb';
import { Product } from '../src/model/productModel';
import mongoose from 'mongoose';

beforeAll(async () => {
  await connectMemoryMongoDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectMemoryMongoDB();
});

describe('findAllkeywords function', () => {
  test('should find all keyword', async () => {
    await Product.create(
      {
        productId: '1',
        scrapeId: new mongoose.Types.ObjectId(),
        storeId: new mongoose.Types.ObjectId(),
        link: 'http://example.com/product1',
        price: 100,
        title: 'Product 1',
        keyword: 'test',
      },
      {
        productId: '2',
        scrapeId: new mongoose.Types.ObjectId(),
        storeId: new mongoose.Types.ObjectId(),
        link: 'http://example.com/product2',
        price: 200,
        title: 'Product 2',
        keyword: 'test1',
      },
    );

    const keywords = await findAllKeywords();
    expect(keywords).toContain('test');
    expect(keywords).toContain('test1');
  });
});
