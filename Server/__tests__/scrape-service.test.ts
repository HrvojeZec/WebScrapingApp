import path from 'path';
import { mallScraping } from '../src/controller/scrape/scrapeMALL';

jest.mock('../src/model/storesModel', () => ({
  Stores: {
    findOne: jest.fn().mockResolvedValue({ _id: 'mockStoreId' }), // Mocked findOne with an example _id
  },
}));

describe('Scraping service', () => {
  const keyword = 'apple iphone 15';
  const scrapeId = 'mockScrapeId';

  test('should scrape mall from local HTML file', async () => {
    const htmlFilePath = path.resolve(__dirname, './mockData/mall.html');
    const products = await mallScraping(keyword, scrapeId, htmlFilePath);
    console.log(products);

    expect(products).toBeInstanceOf(Array);
  }, 10000);
});
