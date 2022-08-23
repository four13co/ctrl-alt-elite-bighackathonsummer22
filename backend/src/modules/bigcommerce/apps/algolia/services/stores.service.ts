import { CreateStoreDto } from '../dtos/stores.dto';
import { Store } from '../interfaces/stores.interface';
import Database from '../databases';

class StoreService {
  public db = new Database();

  public async findStores(params: object = {}): Promise<Store[]> {
    try {
      await this.db.init();
      const stores: Store[] = await this.db.storesModel.find(params);
      return stores;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findStore(storeId: string): Promise<Store> {
    try {
      await this.db.init();
      const store: Store = await this.db.storesModel.findById(storeId);
      return store;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findStoreByStoreHash(storeHash: string): Promise<Store> {
    try {
      await this.db.init();
      const store: Store = await this.db.storesModel.findOne({ storeHash: storeHash });
      return store;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async createStore(storeData: CreateStoreDto): Promise<Store> {
    try {
      await this.db.init();
      const store: Store = await this.db.storesModel.create(storeData);
      return store;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async updateStore(storeId: string, storeData: CreateStoreDto): Promise<Store> {
    try {
      await this.db.init();
      const store: Store = await this.db.storesModel.findByIdAndUpdate(storeId, storeData);
      return store;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async deleteStore(storeId: string): Promise<Store> {
    try {
      await this.db.init();
      const store: Store = await this.db.storesModel.findByIdAndDelete(storeId);
      return store;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }
}

export default StoreService;
