import { App } from '@/interfaces/apps.interface';
import appModel from '@models/apps.model';
import { ObjectId } from 'mongoose';

import { Http } from '@apis/shopify/utils/http';

interface ApiKeys {
  api_key: string;
  password: string;
  baseUrl: string;
  apiVersion: string;
}

class ShopifyHelper {
  protected http: any;
  protected headers: any;
  protected config: any;
  protected apiKeys: ApiKeys;
  protected id: ObjectId;

  protected async initHelper(id: ObjectId): Promise<void> {
    const app: App = await appModel.findById(id);

    this.id = id;
    this.apiKeys = app.apiKey;

    this.config = {
      headers: {
        'X-Shopify-Access-Token': this.apiKeys.password,
      },
    };

    this.http = new Http(this.apiKeys.baseUrl, this.config.headers);
  }

  protected formatUrl(url: string): string {
    return `/admin/api/${this.apiKeys.apiVersion}/${url}`;
  }

  protected graphql(): string {
    return `/admin/api/${this.apiKeys.apiVersion}/graphql.json`;
  }
}

export default ShopifyHelper;
