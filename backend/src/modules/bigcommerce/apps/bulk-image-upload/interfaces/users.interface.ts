import { ObjectId } from 'mongoose';

export interface Account {
  _id: ObjectId;
  accountId: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
