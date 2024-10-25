import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Stores } from '../../src/model/storesModel';

let mongoServer: MongoMemoryServer;

export const connectMemoryMongoDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};
export const disconnectMemoryMongoDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearDatabase = async () => {
  await Stores.deleteMany({});
};
