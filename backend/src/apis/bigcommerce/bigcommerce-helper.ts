import { App } from '@/interfaces/apps.interface';
import appModel from '@/models/apps.model';
import { ObjectId } from 'mongoose';
import BigCommerce from 'node-bigcommerce';

export interface ApiKeys {
  clientId: string;
  accessToken: string;
  responseType: string;
  storeHash: string;
  apiVersion: string;
}

class BigcommerceHelper {
  protected http: any;
  protected config: any;
  protected apiKeys: ApiKeys;
  protected client: any;

  protected async initHelper(id: ObjectId): Promise<void> {
    const app: App = await appModel.findById(id);

    this.apiKeys = app.apiKey;
    this.client = new BigCommerce(this.apiKeys);
  }

  protected async initSyncHelper(apiKeys: ApiKeys): Promise<void>{
    this.apiKeys = apiKeys
    this.client = new BigCommerce(this.apiKeys);
  }
}

export default BigcommerceHelper;
