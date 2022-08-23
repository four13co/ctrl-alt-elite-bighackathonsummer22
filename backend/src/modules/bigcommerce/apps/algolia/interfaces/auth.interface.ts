import { Request } from 'express';
import { Store } from './stores.interface';

export interface RequestWithToken extends Request {
  store: Store;
}
