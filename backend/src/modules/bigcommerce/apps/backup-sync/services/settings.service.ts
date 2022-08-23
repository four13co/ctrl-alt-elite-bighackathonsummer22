// import { CreateSettingDto } from '../dtos/settings.dto';
// import { Setting } from '../interfaces/settings.interface';
// import Database from '../databases';

// class SettingService {
//   public db = new Database();

//   public async findSettings(params: object = {}): Promise<Setting[]> {
//     const settings: Setting[] = await this.db.settingsModel.find(params);
//     return settings;
//   }

//   public async findSetting(settingId: string): Promise<Setting> {
//     const setting: Setting = await this.db.settingsModel.findById(settingId);
//     return setting;
//   }

//   public async createSetting(settingData: CreateSettingDto): Promise<Setting> {
//     const setting: Setting = await this.db.settingsModel.create(settingData);
//     return setting;
//   }

//   public async updateSetting(settingId: string, settingData: CreateSettingDto): Promise<Setting> {
//     const setting: Setting = await this.db.settingsModel.findByIdAndUpdate(settingId, settingData);
//     return setting;
//   }

//   public async deleteSetting(settingId: string): Promise<Setting> {
//     const setting: Setting = await this.db.settingsModel.findByIdAndDelete(settingId);
//     return setting;
//   }
// }

// export default SettingService;
