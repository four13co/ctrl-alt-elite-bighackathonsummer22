import { CreateSettingDto } from '../dtos/settings.dto';
import { Setting } from '../interfaces/settings.interface';
import Database from '../databases';

class SettingService {
  public db = new Database();

  public async findSettings(params: object = {}): Promise<Setting[]> {
    try {
      await this.db.init();
      const settings: Setting[] = await this.db.settingsModel.find(params);
      return settings;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findSetting(settingId: string): Promise<any> {
    try {
      await this.db.init();
      const setting: Setting = await this.db.settingsModel.findById(settingId).populate('bigcommerceStore');
      return setting;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async createSetting(settingData: CreateSettingDto): Promise<Setting> {
    try {
      await this.db.init();
      const setting: Setting = await this.db.settingsModel.create(settingData);
      return setting;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async updateSetting(settingId: string, settingData: CreateSettingDto): Promise<Setting> {
    try {
      await this.db.init();
      const setting: Setting = await this.db.settingsModel.findByIdAndUpdate(settingId, settingData);
      return setting;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async deleteSetting(settingId: string): Promise<Setting> {
    try {
      await this.db.init();
      const setting: Setting = await this.db.settingsModel.findByIdAndDelete(settingId);
      return setting;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }
}

export default SettingService;
