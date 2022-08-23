import AlgoliaHelper from './algolia-helper';
import { Product } from './interfaces/products.interface';

class AlgoliaWrapper extends AlgoliaHelper {
  public async init(id: string): Promise<void> {
    await this.initHelper(id);
  }

  public async findProduct(productId: string) {
    let ret;

    try {
      const index = this.client.initIndex(this.indexName);
      ret = await index.getObject<Product>(productId);
    } catch (err) {
      ret = null;
    }

    return ret;
  }

  public async addProduct(product: Product) {
    const index = this.client.initIndex(this.indexName);
    return index.saveObject(product);
  }

  public async removeProduct(productId: string) {
    const index = this.client.initIndex(this.indexName);
    return index.deleteObject(productId);
  }

  public async addProducts(products: Product[]) {
    const index = this.client.initIndex(this.indexName);
    return index.saveObjects(products);
  }

  public async removeProducts(productIds: string[]) {
    const index = this.client.initIndex(this.indexName);
    return index.deleteObjects(productIds);
  }

  public async batchSave(commands: any) {
    commands.forEach(ii => (ii.indexName = this.indexName));
    return this.client.multipleBatch(commands);
  }
}

export default AlgoliaWrapper;
