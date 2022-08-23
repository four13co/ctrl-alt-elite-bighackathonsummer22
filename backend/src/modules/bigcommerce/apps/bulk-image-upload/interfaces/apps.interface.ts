import { AppType } from '@/enums/app-type.enum';
import { ObjectId } from 'mongoose';

export interface App {
  _id: ObjectId;
  name: String;
  type: AppType;
  apiKey: any;
  appData: any;
}
