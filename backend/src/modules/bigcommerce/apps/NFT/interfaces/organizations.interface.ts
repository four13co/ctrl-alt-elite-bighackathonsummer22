import { ObjectId } from 'mongoose';
import { App } from '../interfaces/apps.interface';
import { Account } from './users.interface';

export interface Organizations {
  _id: ObjectId;
  apps: App;
  account: Account;
  name: String;
  createdAt: Date;
  updatedAt: Date;
}
