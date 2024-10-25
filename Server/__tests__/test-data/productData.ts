import mongoose from 'mongoose';

export const testStoreData = [
  {
    _id: new mongoose.Types.ObjectId(),
    storeName: 'Test Mall',
    logo: 'https://example.com/logo-mall.png',
  },
  {
    _id: new mongoose.Types.ObjectId(),
    storeName: 'Test SanctaDomenica',
    logo: 'https://example.com/logo-SanctaDomenica.png',
  },
];

export const testProductData = [
  {
    productId: '101',
    scrapeId: new mongoose.Types.ObjectId(),
    storeId: testStoreData[0]._id,
    link: 'http://example.com/product101',
    price: 150,
    title: 'Test Product 101',
    keyword: 'iphone',
  },
  {
    productId: '102',
    scrapeId: new mongoose.Types.ObjectId(),
    storeId: testStoreData[1]._id,
    link: 'http://example.com/product102',
    price: 250,
    title: 'Test Product 102',
    keyword: 'laptop',
  },
];
