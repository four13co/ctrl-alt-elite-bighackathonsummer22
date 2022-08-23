import { ObjectId } from 'mongoose';
import { Account } from '../interfaces/accounts.interface';
import { Store } from '../interfaces/stores.interface';

export interface Setting {
  _id: ObjectId;
  algoliaAccount: Account;
  bigcommerceStore: Store;
  account: object;
  setting: object;
  styling: object;
  createdAt: Date;
  updatedAt: Date;
}
