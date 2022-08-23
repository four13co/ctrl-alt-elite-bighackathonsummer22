import { ObjectId } from 'mongoose';
import algoliaSearch, { SearchClient } from 'algoliasearch';
import SettingService from '../../services/settings.service';
import { Setting } from '../../interfaces/settings.interface';

interface ApiKeys {
  appId: string;
  adminKey: string;
  searchKey: string;
}

class AlgoliaHelper {
  protected apiKeys;
  protected client: SearchClient;
  protected indexName;
  public settings: Setting;
  private settingService = new SettingService();

  protected async initHelper(id: string): Promise<void> {
    this.indexName = 'four13_primary';
    this.settings = await this.settingService.findSetting(id);

    this.apiKeys = this.settings.setting;
    this.client = algoliaSearch(this.apiKeys.appId, this.apiKeys.adminKey);

    const index = this.client.initIndex(this.indexName);

    index.setSettings({
      // searchableAttributes: ['name', 'categories', 'keyword', 'description'],
      attributesForFaceting: ['brand', 'categories', 'width', 'length','depth'],
      renderingContent: {
        facetOrdering: {
          facets: {
            order: ['brand', 'categories', 'width', 'length','depth'],
          },
        },
      },
    });
  }
}

export default AlgoliaHelper;
