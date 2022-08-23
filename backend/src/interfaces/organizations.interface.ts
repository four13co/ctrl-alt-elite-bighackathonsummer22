import { App } from './apps.interface';
import { Billing } from './billings.interface';
import { User } from './users.interface';

export interface Organization {
  _id: string;
  name: string;
  users: [User];
  apps: [App];
  billing: Billing;
}
