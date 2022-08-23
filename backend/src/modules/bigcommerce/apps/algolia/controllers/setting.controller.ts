import { HttpException } from '@/exceptions/HttpException';
import { Request, Response, NextFunction } from 'express';
import SettingService from '../services/settings.service';
import AccountService from '../services/accounts.service';
import StoreService from '../services/stores.service';
import AlgoliaService from '../services/algolia.service';
import { RequestWithToken } from '../interfaces/auth.interface';
import Agenda from '@/agenda';

class SettingController {
  private settingService = new SettingService();
  private storeService = new StoreService();
  private accountService = new AccountService();
  private algoliaService = new AlgoliaService();
  private tranzettaAgenda = new Agenda();

  public getSettingByAlgoliaAccount = async (req: RequestWithToken, res: Response, next: NextFunction) => {
    try {
      const algoliaId = req.params.algoliaId;

      const account = await this.accountService.findAccounts({ storeHash: algoliaId });
      if (!account.length) {
        return next(new HttpException(500, 'Algolia account not found.'));
      }

      const settings = await this.settingService.findSettings({ algoliaAccount: account[0], bigcommerceStore: req.store });
      res.status(200).json({ data: settings.length ? settings[0] : {} });
    } catch (error) {
      next(error);
    }
  };

  public updateSettingByAlgoliaAccount = async (req: RequestWithToken, res: Response, next: NextFunction) => {
    try {
      const algoliaId = req.params.algoliaId;
      const body = req.body;
      const store = req.store;
      const account = await this.accountService.findAccounts({ storeHash: algoliaId });
      if (!account.length) {
        return next(new HttpException(500, 'Algolia account not found.'));
      }

      const settings = await this.settingService.findSettings({ algoliaAccount: account[0], bigcommerceStore: req.store });
      if (settings.length) {
        const setting = settings[0];
        if (body.account) setting.account = body.account;
        if (body.setting) setting.setting = body.setting;
        if (body.styling) setting.styling = body.styling;

        body.updatedAt = new Date();

        if (body.setting || (body.styling && setting.setting)) {
          await this.algoliaService.addWidget(setting, store);
        }

        if (body.setting) {
          this.tranzettaAgenda.agenda.now('init-bigcommerce-to-algolia2', {
            settingId: setting._id,
          });
        }

        await this.settingService.updateSetting(setting._id.toString(), setting);

        res.status(200).json({ data: setting });
      } else {
        const obj: any = { algoliaAccount: account[0], bigcommerceStore: req.store, account: {}, setting: {}, styling: {} };
        if (body.account) obj.account = body.account;
        if (body.setting) obj.setting = body.setting;
        if (body.styling) obj.styling = body.styling;

        if (body.setting) {
          await this.algoliaService.addWidget(obj, store);
        }

        const setting = await this.settingService.createSetting(obj);
        if (setting) {
          this.tranzettaAgenda.agenda.now('init-bigcommerce-to-algolia2', {
            settingId: setting._id,
          });
        }
        res.status(200).json({ data: setting });
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteSetting = async (req: RequestWithToken, res: Response, next: NextFunction) => {
    try {
      const algoliaId = req.params.algoliaId;
      const store = req.store;

      const account = await this.accountService.findAccounts({ accountId: algoliaId });
      if (!account.length) {
        return next(new HttpException(500, 'Algolia account not found.'));
      }

      const settings = await this.settingService.findSettings({ algoliaAccount: account[0], bigcommerceStore: req.store });

      if (settings.length) {
        const setting = settings[0];

        await this.algoliaService.uninstallWidget(store); // uninstall the widget in bigcommerce
      }

      res.status(200).json({ data: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getSettings = async (req: RequestWithToken, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingService.findSettings({});
      res.status(200).json({ data: settings });
    } catch (error) {
      next(error);
    }
  };
}

export default SettingController;
