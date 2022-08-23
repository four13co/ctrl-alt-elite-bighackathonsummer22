import mongoose from 'mongoose';
import { dbConnection } from '@databases';

export const connect = async () => {
  await mongoose.connect('mongodb://localhost:27017/TranZetta_TEST', dbConnection.options);
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
