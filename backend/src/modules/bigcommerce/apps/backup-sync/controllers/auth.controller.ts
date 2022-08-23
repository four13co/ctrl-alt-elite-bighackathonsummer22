// import { HttpException } from '@/exceptions/HttpException';
// import { NextFunction, Request, Response } from 'express';
// import { AppType } from '@/enums/app-type.enum';
// import * as mailer from '@/utils/sendEmail';
// import BigCommerce from 'node-bigcommerce';
// import bcrypt from 'bcrypt';
// import crypto from 'crypto';
// import path from 'path';

// import { LoginDto } from '@dtos/users.dto';
// import AppService from '../services/apps.service';
// import { AccountDto } from '../dtos/accounts.dto';
// import WasabiService from '@services/wasabi.service';
// import StoreService from '../services/stores.service';
// import AccountService from '../services/accounts.service';
// import SettingService from '../services/settings.service';

// class AuthController {
//   public appService = new AppService();
//   public storeService = new StoreService();
//   public accountService = new AccountService();
//   public settingService = new SettingService();
//   public appPath = 'https://tranzetta-frontend-dev.netlify.app'; //process.env.BACKUP_SYNC_APP_FRONTEND;
//   public clientId = 'sqr78iyr94mjjfqec7nxwwmlep1k5p2'; //process.env.BACKUP_SYNC_APP_BIG_COMMERCE_CLIENT_ID;
//   public clientSecret = '9ef3579f03c142c920e41d49d979e8a75cfe64151a47c7c671e71d50172b11fa'; //process.env.BACKUP_SYNC_APP_BIG_COMMERCE_SECRET;
//   public authCallback = 'https://dev-backend.tranzetta.com/modules/bigcommerce/backup-sync/api/bc/auth'; //process.env.BACKUP_SYNC_APP_BIG_COMMERCE_CALLBACK_URL;

//   /**
//    * BigCommerce auth callback endpoint.
//    * @param request - request handler
//    * @param response - response handler
//    * @param next - next handler
//    */
//   public logIn = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const loginData: LoginDto = req.body;

//       const account = await this.accountService.findAccountByEmail(loginData.email);
//       if (!account) throw new HttpException(401, `Incorrect email or password`);

//       const isPasswordCorrect: boolean = await bcrypt.compare(loginData.password, account.password);
//       if (!isPasswordCorrect) throw new HttpException(401, 'Incorrect email or password');

//       const storeAssociatedWithAccount = await this.storeService.findStoreByStoreHash(account.storeHash);
//       if (!storeAssociatedWithAccount) throw new HttpException(401, `Store associated with account with email '${loginData.email}' not found`);

//       const accountDto = AccountDto.createFrom(account);
//       res.status(200).json({
//         data: {
//           ...accountDto,
//           accessToken: storeAssociatedWithAccount.token,
//         },
//         message: 'login',
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   /**
//    * BigCommerce auth callback endpoint.
//    * @param request - request handler
//    * @param response - response handler
//    * @param next - next handler
//    */
//   public auth = async (request: Request, response: Response, next: NextFunction) => {
//     console.log('BigCommerce auth callback endpoint...');

//     const config = {
//       clientId: this.clientId,
//       secret: this.clientSecret,
//       callback: this.authCallback,
//       responseType: 'json',
//       apiVersion: 'v3',
//     };

//     const bigCommerce = new BigCommerce(config);

//     bigCommerce
//       .authorize(request.query)
//       .then(async data => {
//         console.log(data, '/modules/bigcommerce/backup-sync/api');
//         const BCstoreHash = data.context.replace('stores/', '');
//         const appName = AppType.BigCommerce;
//         const appType = AppType.BigCommerce;

//         // Update access token when storeHash exist
//         const apps = this.appService.findAllApps({ storeHash: BCstoreHash });
//         apps.then(apps_data => {
//           if (apps_data.length) {
//             const app = apps_data[0];
//             app.storeHash = BCstoreHash;
//             this.appService.updateApp(app._id.toString(), app);
//           } else {
//             const appData = {
//               name: appName,
//               type: appType,
//               apiKey: {
//                 accessToken: data.access_token,
//                 clientId: this.clientId,
//                 clientSecret: this.clientSecret,
//                 authCallback: this.authCallback,
//               },
//               storeHash: BCstoreHash,
//             };

//             this.appService.createApp(appData);
//           }
//         });

//         // Update access token if storeHash exist
//         const stores = this.storeService.findStores({ url: BCstoreHash });
//         stores.then(stores_data => {
//           if (stores_data.length) {
//             const store = stores_data[0];
//             store.token = data.access_token;
//             this.storeService.updateStore(store._id.toString(), store);
//           } else {
//             const storeData = {
//               name: appType,
//               token: data.access_token,
//               url: BCstoreHash, // to be removed later, was replaced with storeHash
//               storeHash: BCstoreHash,
//             };
//             this.storeService.createStore(storeData);
//           }
//         });

//         //Do not save if BC account if exist
//         const account = this.accountService.findAccounts({ accountId: data.user.id });
//         const temporaryPassword = crypto.randomBytes(8).toString('hex');
//         const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
//         account.then(async account_data => {
//           if (account_data.length < 1) {
//             const accountData = {
//               accountId: data.user.id,
//               name: data.user.username,
//               email: data.user.email,
//               password: hashedTempPassword,
//               storeHash: BCstoreHash,
//             };

//             const account = await this.accountService.createAccount(accountData);

//             if (account) {
//               // create account bucket
//               WasabiService.createBucket(`backup-sync-${accountData.accountId.toString()}`);
//             }
//           }
//         });

//         // Send temporary password as email
//         await mailer.sendEmail(data.user.email, 'Temporary password', `Your temporary password is ${temporaryPassword}`);

//         // convert to base64
//         const payload = JSON.stringify(data);
//         const auth_payload = Buffer.from(payload).toString('base64');

//         response.redirect(`${this.appPath}/backup-sync?auth=` + auth_payload);
//       })
//       .catch(error => {
//         console.log({ error });
//         next(error);
//       });
//   };

//   /**
//    * BigCommerce load callback endpoint.
//    * @param request - request handler
//    * @param response - response handler
//    * @param next - next handler
//    */
//   public load = async (request: Request, response: Response, next: NextFunction) => {
//     console.log('BigCommerce load callback endpoint...');

//     const config = {
//       secret: this.clientSecret,
//       responseType: 'json',
//     };
//     const bigCommerce = new BigCommerce(config);

//     try {
//       bigCommerce.verify(request.query['signed_payload']);
//       // response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/installed.html'));
//       response.redirect(`${this.appPath}/backup-sync`);
//     } catch (err) {
//       next(err);
//     }
//   };

//   /**
//    * BigCommerce uninstall callback endpoint.
//    * @param request - request handler
//    * @param response - response handler
//    * @param next - next handler
//    */
//   public uninstall = async (request: Request, response: Response, next: NextFunction) => {
//     console.log('BigCommerce uninstall callback endpoint...');

//     const config = {
//       secret: this.clientSecret,
//       responseType: 'json',
//     };
//     const bigCommerce = new BigCommerce(config);

//     try {
//       const data = bigCommerce.verify(request.query['signed_payload']);
//       const BCstoreHash = data.context.replace('stores/', '');

//       // Delete App
//       const apps = this.appService.findAllApps({ storeHash: BCstoreHash });
//       apps.then(apps_data => {
//         if (apps_data) {
//           const app = apps_data[0];
//           this.appService.deleteApp(app._id.toString());
//         }
//       });

//       // Delete Store
//       const stores = this.storeService.findStores({ url: BCstoreHash });
//       stores.then(stores_data => {
//         if (stores_data.length) {
//           const store = stores_data[0];
//           this.storeService.deleteStore(store._id.toString());
//         }
//       });

//       // Delete Account
//       const accounts = this.accountService.findAccounts({ accountId: data.user.id });
//       accounts.then(accounts_data => {
//         if (accounts_data) {
//           //Delete Account
//           const account = accounts_data[0];
//           const delete_account = this.accountService.deleteAccount(account._id.toString());
//           delete_account.then(response => {
//             console.log('Accounts Deleted!', response);
//           });

//           //Delete Store Setting
//           const settings = this.settingService.findSettings({ backUpSyncAccount: account });
//           settings.then(settings_data => {
//             const delete_settings = this.settingService.deleteSetting(settings_data[0]._id.toString());
//             delete_settings.then(response => {
//               console.log('Store Settings Deleted!', response);
//             });
//           });
//         }
//       });

//       response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/uninstalled.html'));
//     } catch (err) {
//       next(err);
//     }
//   };
// }

// export default AuthController;
