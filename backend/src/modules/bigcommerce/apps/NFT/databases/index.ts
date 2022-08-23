import { dbConnection } from '../databases/config';
import { Model, createConnection, Document } from 'mongoose';
import { App } from '../interfaces/apps.interface';
import appSchema from '../models/apps.model';
import { Account } from '../interfaces/users.interface';
import accountSchema from '../models/users.model';
import { Organizations } from '../interfaces/organizations.interface';
import organizationsSchema from '../models/organizations.model';

class Database {
  public conn: any;
  public appsModel: Model<App, Document>;
  public accountsModel: Model<Account, Document>;
  public organizationsModel: Model<Organizations, Document>;

  constructor() {
    this.connectToDatabase();
  }

  private async connectToDatabase() {
    this.conn = await createConnection(dbConnection.url, dbConnection.options);
    this.appsModel = await this.conn.model('apps', appSchema);
    this.accountsModel = await this.conn.model('users', accountSchema);
    this.organizationsModel = await this.conn.model('organizations', organizationsSchema);
  }

  public async init() {
    await this.connectToDatabase();
  }

  public close() {
    this.conn.close();
  }
}

export default Database;
