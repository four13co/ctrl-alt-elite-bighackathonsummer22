import { Router } from 'express';
import AuthContoller from '../controllers/auth.controller';
import SettingContoller from '../controllers/setting.controller';
import AccountContoller from '../controllers/account.controller';
import StoreContoller from '../controllers/store.controller';
import WidgetContoller from '../controllers/widget.controller';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateSettingDto } from '../dtos/settings.dto';
import { CreateAccountDto } from '../dtos/accounts.dto';
import { CreateVerifyDto } from '../dtos/auth.dto';
import { CreateStoreDto } from '../dtos/stores.dto';
import authMiddleware from '../middlewares/auth.middleware';

class ModuleBigcommerceAlgoliaRoute implements Routes {
  public path = '/modules/bigcommerce/algolia/api/';
  public router = Router();
  private authController = new AuthContoller();
  private settingsController = new SettingContoller();
  private accountController = new AccountContoller();
  private storeController = new StoreContoller();
  private widgetController = new WidgetContoller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // BigCommerce Callback URLs
    this.router.get(`${this.path}bc/auth`, this.authController.auth);
    this.router.get(`${this.path}bc/load`, this.authController.load);
    this.router.get(`${this.path}bc/uninstall`, this.authController.uninstall);

    // Auth
    this.router.get(`${this.path}verify/:payload`, validationMiddleware(CreateVerifyDto, 'body', true), this.authController.verifyPayload);
    this.router.post(`${this.path}auth`, validationMiddleware(CreateStoreDto, 'body'), this.authController.verifyAuthToken);
    this.router.post(`${this.path}login`, this.authController.logIn);

    // Accounts
    this.router.post(`${this.path}accounts`, validationMiddleware(CreateAccountDto, 'body'), this.accountController.createAccount);

    // Stores
    this.router.post(`${this.path}stores`, validationMiddleware(CreateStoreDto, 'body'), this.storeController.createStore);

    // Settings
    this.router.get(`${this.path}settings/:algoliaId`, authMiddleware, this.settingsController.getSettingByAlgoliaAccount);
    this.router.put(
      `${this.path}settings/:algoliaId`,
      authMiddleware,
      validationMiddleware(CreateSettingDto, 'body', true),
      this.settingsController.updateSettingByAlgoliaAccount,
    );
    this.router.delete(`${this.path}settings/:algoliaId`, authMiddleware, this.settingsController.deleteSetting);

    // Adding the algolia widget
    // this.router.post(`${this.path}add-widget`, this.widgetController.addWidget);
  }
}

export default ModuleBigcommerceAlgoliaRoute;
