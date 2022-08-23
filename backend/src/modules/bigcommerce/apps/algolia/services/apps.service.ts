import { CreateAppDto } from '../dtos/apps.dtos';
import { App } from '../interfaces/apps.interface';
import { AppType } from '@/enums/app-type.enum';
import appModel from '../models/apps.model';
import Database from '../databases';

class AppService {
  public db = new Database();

  public async findAllApps(params: object = {}): Promise<App[]> {
    try {
      await this.db.init();
      const apps: App[] = await this.db.appsModel.find(params);
      return apps;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findApp(appId: string): Promise<App> {
    try {
      await this.db.init();
      const app: App = await this.db.appsModel.findById(appId);
      return app;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findByType(type: string): Promise<App> {
    try {
      await this.db.init();
      return await this.db.appsModel.findOne({ type: AppType[type] });
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async createApp(appData: CreateAppDto): Promise<App> {
    try {
      await this.db.init();
      const app: App = await this.db.appsModel.create(appData);
      return app;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async updateApp(appId: string, appData: CreateAppDto): Promise<App> {
    try {
      await this.db.init();
      const app: App = await this.db.appsModel.findByIdAndUpdate(appId, appData);
      return app;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async deleteApp(appId: string): Promise<App> {
    try {
      await this.db.init();
      const app: App = await this.db.appsModel.findByIdAndDelete(appId);
      return app;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }
}

export default AppService;
