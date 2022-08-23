import { ObjectId } from 'mongoose';

export interface Account {
  _id: ObjectId;
  accountId: number;
  name: string;
  email: string;
  password: string;
  storeHash: string;
  createdAt: Date;
  updatedAt: Date;
}
