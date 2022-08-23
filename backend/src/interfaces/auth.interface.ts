import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { Organization } from './organizations.interface';

export interface DataStoredInToken {
  _id: string;
  email: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
  organization: Organization;
}
