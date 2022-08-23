import { dbConnection } from '../databases/config';
import { Model, createConnection, Document } from 'mongoose';
import { Setting } from '../interfaces/settings.interface';
import settingSchema from '../models/settings.model';
import { Account } from '../interfaces/accounts.interface';
import accountSchema from '../models/accounts.model';
import { Store } from '../interfaces/stores.interface';
import storeSchema from '../models/stores.model';
import { App } from '../interfaces/apps.interface';
import appSchema from '../models/apps.model';

class Database {
  public conn: any;
  public settingsModel: Model<Setting, Document>;
  public accountsModel: Model<Account, Document>;
  public storesModel: Model<Store, Document>;
  public appsModel: Model<App, Document>;

  constructor() {
    // this.connectToDatabase();
  }

  private async connectToDatabase() {
    this.conn = await createConnection(dbConnection.url, dbConnection.options);
    this.settingsModel = await this.conn.model('settings', settingSchema);
    this.accountsModel = await this.conn.model('accounts', accountSchema);
    this.storesModel = await this.conn.model('stores', storeSchema);
    this.appsModel = await this.conn.model('apps', appSchema);
  }

  public async init() {
    await this.connectToDatabase();
  }

  public close() {
    this.conn.close();
  }
}

export default Database;
