// import { CreateStoreDto } from '../dtos/stores.dto';
// import { Store } from '../interfaces/stores.interface';
// import Database from '../databases';

// class StoreService {
//   public db = new Database();

//   public async findStores(params: object = {}): Promise<Store[]> {
//     const stores: Store[] = await this.db.storesModel.find(params);
//     return stores;
//   }

//   public async findStore(storeId: string): Promise<Store> {
//     const store: Store = await this.db.storesModel.findById(storeId);
//     return store;
//   }

//   public async findStoreByStoreHash(storeHash: string): Promise<Store> {
//     const store: Store = await this.db.storesModel.findOne({ storeHash: storeHash });
//     return store;
//   }

//   public async createStore(storeData: CreateStoreDto): Promise<Store> {
//     const store: Store = await this.db.storesModel.create(storeData);
//     return store;
//   }

//   public async updateStore(storeId: string, storeData: CreateStoreDto): Promise<Store> {
//     const store: Store = await this.db.storesModel.findByIdAndUpdate(storeId, storeData);
//     return store;
//   }

//   public async deleteStore(storeId: string): Promise<Store> {
//     const store: Store = await this.db.storesModel.findByIdAndDelete(storeId);
//     return store;
//   }
// }

// export default StoreService;
