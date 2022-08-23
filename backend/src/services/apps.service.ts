import { CreateAppDto } from '@/dtos/apps.dto';
import { App } from '@/interfaces/apps.interface';
import { AppType } from '@/enums/app-type.enum';
import appModel from '@/models/apps.model';

class AppService {
  public apps = appModel;

  public async findAllApps(): Promise<App[]> {
    const apps: App[] = await this.apps.find();
    return apps;
  }

  public async findApp(appId: string): Promise<App> {
    const app: App = await this.apps.findById(appId);
    return app;
  }

  public async findByType(type: string): Promise<App> {
    return await this.apps.findOne({ type: AppType[type] });
  }

  public async createApp(appData: CreateAppDto): Promise<App> {
    const app: App = await this.apps.create(appData);
    return app;
  }

  public async updateApp(appId: string, appData: CreateAppDto): Promise<App> {
    const app: App = await this.apps.findByIdAndUpdate(appId, appData);
    return app;
  }

  public async deleteApp(appId: string): Promise<App> {
    const app: App = await this.apps.findByIdAndDelete(appId);
    return app;
  }
}

export default AppService;
