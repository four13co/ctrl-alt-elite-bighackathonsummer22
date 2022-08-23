import { Request } from 'express';
import { App } from './apps.interface';

export interface RequestWithToken extends Request {
  store: App;
}
