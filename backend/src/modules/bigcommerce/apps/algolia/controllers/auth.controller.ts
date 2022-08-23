import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import { LoginDto, SignupDto, UserDto } from '@dtos/users.dto';
import { DataStoredInToken, RequestWithUser, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import AppService from '../services/apps.service';
import StoreService from '../services/stores.service';
import AccountService from '../services/accounts.service';
import SettingService from '../services/settings.service';
import { AppType } from '@/enums/app-type.enum';
const BigCommerce = require('node-bigcommerce');
const path = require('path');
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as mailer from '@/utils/sendEmail';
import { AccountDto } from '../dtos/accounts.dto';
import jwt from 'jsonwebtoken';

class AuthController {
  public authService = new AuthService();
  public appService = new AppService();
  public storeService = new StoreService();
  public accountService = new AccountService();
  public settingService = new SettingService();
  public appPath = 'https://tranzetta-frontend-dev.netlify.app'; //process.env.ALGOLIA_APP_FRONTEND;
  public clientId = '1fctxoxgu7chx35bzs22rlzidi59k2j'; //process.env.ALGOLIA_APP_BIG_COMMERCE_CLIENT_ID;
  public clientSecret = '7ded8aa089004bfd3c05ad6906ae78fce244d9cedd8ac38b7c91e8f2735a40d9'; //process.env.ALGOLIA_APP_BIG_COMMERCE_SECRET;
  public authCallback = 'https://dev-backend.tranzetta.com/modules/bigcommerce/algolia/api/bc/auth'; //process.env.ALGOLIA_APP_BIG_COMMERCE_CALLBACK_URL;

  // public signUp = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userData: SignupDto = req.body;
  //     const signUpUserData: UserDto = await this.authService.signup(userData);

  //     res.status(201).json({ data: signUpUserData, message: 'signup' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;
      const hash = req.body.hash;

      const account = await this.accountService.findAccountByEmailAndHash(loginData.email, hash);
      if (!account) throw new HttpException(401, `Incorrect email or password`);

      const isPasswordCorrect: boolean = await bcrypt.compare(loginData.password, account.password);
      if (!isPasswordCorrect) throw new HttpException(401, 'Incorrect email or password');

      const storeAssociatedWithAccount = await this.storeService.findStoreByStoreHash(account.storeHash);
      if (!storeAssociatedWithAccount) throw new HttpException(401, `Store associated with account with email '${loginData.email}' not found`);

      const accountDto = AccountDto.createFrom(account);
      res.status(200).json({ data: { ...accountDto, accessToken: storeAssociatedWithAccount.token, storeHash: account.storeHash }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  private createToken(accountDto: AccountDto): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: accountDto._id, email: accountDto.email };
    const secretKey: string = process.env.JWT_TOKEN_SECRET;
    const expiresIn = 60 * 60; //  60 seconds * 60 = 1 hour

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  // public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
  //     res.status(200).json({ data: {}, message: 'logout' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  /**
   * BigCommerce auth callback endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public auth = async (request: Request, response: Response, next: NextFunction) => {
    console.log('BigCommerce auth callback endpoint...');

    const config = {
      clientId: this.clientId,
      secret: this.clientSecret,
      callback: this.authCallback,
      responseType: 'json',
      apiVersion: 'v3',
    };

    const bigCommerce = new BigCommerce(config);

    bigCommerce
      .authorize(request.query)
      .then(async data => {
        const BCstoreHash = data.context.replace('stores/', '');
        const appName = AppType.BigCommerce;
        const appType = AppType.BigCommerce;

        // Update access token when storeHash exist
        const apps = this.appService.findAllApps({ storeHash: BCstoreHash });
        apps.then(apps_data => {
          if (apps_data.length) {
            const app = apps_data[0];
            app.storeHash = BCstoreHash;
            this.appService.updateApp(app._id.toString(), app);
          } else {
            const appData = {
              name: appName,
              type: appType,
              apiKey: {
                accessToken: data.access_token,
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                authCallback: this.authCallback,
              },
              storeHash: BCstoreHash,
            };
            this.appService.createApp(appData);
          }
        });

        // Update access token if storeHash exist
        const stores = this.storeService.findStores({ url: BCstoreHash });
        stores.then(stores_data => {
          if (stores_data.length) {
            const store = stores_data[0];
            store.token = data.access_token;
            this.storeService.updateStore(store._id.toString(), store);
          } else {
            const storeData = {
              name: appType,
              token: data.access_token,
              url: BCstoreHash, // to be removed later, was replaced with storeHash
              storeHash: BCstoreHash,
            };
            this.storeService.createStore(storeData);
          }
        });

        //Do not save if BC account if exist
        const account = this.accountService.findAccounts({ accountId: data.user.id, storeHash: data.context.split("/")[1]});
        // const temporaryPassword = crypto.randomBytes(8).toString('hex');
        const temporaryPassword = 'password';
        const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
        account.then(account_data => {
          if (account_data.length < 1) {
            const accountData = {
              accountId: data.user.id,
              name: data.user.username,
              email: data.user.email,
              password: hashedTempPassword,
              storeHash: BCstoreHash,
            };
            this.accountService.createAccount(accountData);
          }
        });

        // Send temporary password as email
        await mailer.sendEmail(data.user.email, 'Temporary password', `Your temporary password is ${temporaryPassword}`);

        // convert to base64
        const payload = JSON.stringify(data);
        const auth_payload = Buffer.from(payload).toString('base64');

        response.redirect(`${this.appPath}/algolia?auth=` + auth_payload);
      })
      .catch(error => {
        console.log({ error });
        next(error);
      });
  };

  /**
   * BigCommerce load callback endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public load = async (request: Request, response: Response, next: NextFunction) => {
    console.log('BigCommerce load callback endpoint...');

    const config = {
      secret: this.clientSecret,
      responseType: 'json',
    };
    const bigCommerce = new BigCommerce(config);

    try {
      const data = bigCommerce.verify(request.query['signed_payload']);
      // response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/installed.html'));
      response.redirect(`${this.appPath}/algolia/admin`);
    } catch (err) {
      next(err);
    }
  };

  /**
   * BigCommerce uninstall callback endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public uninstall = async (request: Request, response: Response, next: NextFunction) => {
    console.log('BigCommerce uninstall callback endpoint...');

    const config = {
      secret: this.clientSecret,
      responseType: 'json',
    };
    const bigCommerce = new BigCommerce(config);

    try {
      const data = bigCommerce.verify(request.query['signed_payload']);
      const BCstoreHash = data.context.replace('stores/', '');

      // Delete App
      const apps = this.appService.findAllApps({ storeHash: BCstoreHash });
      apps.then(apps_data => {
        if (apps_data) {
          const app = apps_data[0];
          this.appService.deleteApp(app._id.toString());
        }
      });

      // Delete Store
      const stores = this.storeService.findStores({ url: BCstoreHash });
      stores.then(stores_data => {
        if (stores_data.length) {
          const store = stores_data[0];
          this.storeService.deleteStore(store._id.toString());
        }
      });

      // Delete Account
      const accounts = this.accountService.findAccounts({ accountId: data.user.id, storeHash: data.context.split("/")[1]});
      accounts.then(accounts_data => {
        if (accounts_data) {
          //Delete Account
          const account = accounts_data[0];
          const delete_account = this.accountService.deleteAccount(account._id.toString());
          delete_account.then(response => {
            console.log('Accounts Deleted!', response);
          });

          //Delete Store Setting
          const settings = this.settingService.findSettings({ algoliaAccount: account });
          settings.then(settings_data => {
            const delete_settings = this.settingService.deleteSetting(settings_data[0]._id.toString());
            delete_settings.then(response => {
              console.log('Store Settings Deleted!', response);
            });
          });
        }
      });

      response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/uninstalled.html'));
    } catch (err) {
      next(err);
    }
  };

  public verifyPayload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.params.payload;
      const objPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

      const account = await this.accountService.findAccounts({ accountId: objPayload['user']['id'], name: objPayload['user']['username'], storeHash: objPayload['context'].split("/")[1] });
      if (!account.length) {
        return next(new HttpException(500, 'Algolia account not found.'));
      }

      res.status(200).json({ data: objPayload });
    } catch (error) {
      next(error);
    }
  };

  public verifyAuthToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      // const store = await this.storeService.findStores({ token: body.token });
      const store = await this.storeService.findStores({ storeHash: body.storeHash });
      if (!store.length) {
        // return next(new HttpException(401, 'Unauthorized'));
        res.status(401).json({ message: 'Unauthorized' });
      }

      res.status(200).json({ message: 'Authorized' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
