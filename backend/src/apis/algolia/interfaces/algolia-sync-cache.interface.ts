import { ObjectId } from 'mongoose';

export interface AlgoliaSyncCache {
  appId: ObjectId;
  productId: number;
  type: number;
  data: any;
}
