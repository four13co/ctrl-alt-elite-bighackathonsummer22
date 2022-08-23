import { App } from '@/interfaces/apps.interface';
import appModel from '@/models/apps.model';
import { ObjectId } from 'mongoose';
import algoliaSearch, { SearchClient } from 'algoliasearch';

interface ApiKeys {
  applicationId: string;
  adminApiKey: string;
  indexName: string;
}

class AlgoliaHelper {
  public app: App;
  protected apiKeys: ApiKeys;
  protected client: SearchClient;

  protected async initHelper(id: ObjectId): Promise<void> {
    this.app = await appModel.findById(id);

    this.apiKeys = this.app.apiKey;
    this.client = algoliaSearch(this.apiKeys.applicationId, this.apiKeys.adminApiKey);

    const index = this.client.initIndex(this.apiKeys.indexName);
    index.setSettings({
      searchableAttributes: ['name', 'categories', 'keyword', 'description'],
    });
  }
}

export default AlgoliaHelper;
