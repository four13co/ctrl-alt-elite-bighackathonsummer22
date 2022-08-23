import ShopifyHelper from './shopify-helper';
import { ObjectId } from 'mongoose';

class ShopifyWrapper extends ShopifyHelper {
  public async init(appId: ObjectId): Promise<void> {
    await this.initHelper(appId);
  }

  public async graphQl(data): Promise<any> {
    const res = await this.http.post(this.graphql(), data, this.config);

    return res.data;
  }
}

export default ShopifyWrapper;
