// import { CreateAppDto } from '../dtos/apps.dtos';
// import { App } from '../interfaces/apps.interface';
// import { AppType } from '@/enums/app-type.enum';
// import Database from '../databases';

// class AppService {
//   public db = new Database();

//   public async findAllApps(params: object = {}): Promise<App[]> {
//     const apps: App[] = await this.db.appsModel.find(params);
//     return apps;
//   }

//   public async findApp(appId: string): Promise<App> {
//     const app: App = await this.db.appsModel.findById(appId);
//     return app;
//   }

//   public async findByType(type: string): Promise<App> {
//     return await this.db.appsModel.findOne({ type: AppType[type] });
//   }

//   public async createApp(appData: CreateAppDto): Promise<App> {
//     const app: App = await this.db.appsModel.create(appData);
//     return app;
//   }

//   public async updateApp(appId: string, appData: CreateAppDto): Promise<App> {
//     const app: App = await this.db.appsModel.findByIdAndUpdate(appId, appData);
//     return app;
//   }

//   public async deleteApp(appId: string): Promise<App> {
//     const app: App = await this.db.appsModel.findByIdAndDelete(appId);
//     return app;
//   }
// }

// export default AppService;
