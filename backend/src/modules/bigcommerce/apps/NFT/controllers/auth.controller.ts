import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import { LoginDto, SignupDto, UserDto } from '@dtos/users.dto';
import { DataStoredInToken, RequestWithUser, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import AppService from '../services/apps.service';
import OrganizationService from '../services/organizations.service';
import AccountService from '../services/accounts.service';
import { AppType } from '@/enums/app-type.enum';
const BigCommerce = require('node-bigcommerce');
const path = require('path');
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as mailer from '@/utils/sendEmail';
import { AccountDto } from '../dtos/users.dto';
import jwt from 'jsonwebtoken';
import App from '@/app';
import product from './product.controller';

class AuthController {
  public authService = new AuthService();
  public appService = new AppService();
  public OrganizationService = new OrganizationService();
  public accountService = new AccountService();
  // public appPath = process.env.NFT_APP_BIGCOMMERCE_FRONTEND;
  // public clientId = process.env.NFT_APP_BIGCOMMERCE_CLIENT_ID;
  // public clientSecret = process.env.NFT_APP_BIGCOMMERCE_CLIENT_SECRET;

  public appPath = 'https://metaplex-frontend-four13.vercel.app'; //process.env.NFT_APP_BIGCOMMERCE_FRONTEND;
  public clientId = 'qpjsjdwy76m2tb50fv19dk6lrl4dhpb'; //process.env.NFT_APP_BIGCOMMERCE_CLIENT_ID;
  public clientSecret = 'd0fd58e7a0f45776c54dc64c911425ebed023c8f9e46ecb6613e64266bccc137'; //process.env.NFT_APP_BIGCOMMERCE_CLIENT_SECRET;
  public authCallback = 'https://dev-backend.tranzetta.com/modules/bigcommerce/NFT/api/bc/auth'; //process.env.NFT_APP_BIGCOMMERCE_AUTH_CALLBACK;
  public appName = AppType.NFT;
  public appType = AppType.NFT;

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;

      const account = await this.accountService.findAccountByEmail(loginData.email);
      if (!account) throw new HttpException(401, `Incorrect email or password`);

      const isPasswordCorrect: boolean = await bcrypt.compare(loginData.password, account.password);
      if (!isPasswordCorrect) throw new HttpException(401, 'Incorrect email or password');

      const orgAssociatedWithAccount = await this.OrganizationService.findOrganizations({ account: account._id.toString() });
      if (!orgAssociatedWithAccount) throw new HttpException(401, `Org associated with account with email '${loginData.email}' not found`);

      console.log('Org associated with account', orgAssociatedWithAccount);
      const appsAssociatedWithAccount = await this.appService.findApp(orgAssociatedWithAccount[0].apps.toString());
      if (!appsAssociatedWithAccount) throw new HttpException(401, `App associated with account with email '${loginData.email}' not found`);

      const accountDto = AccountDto.createFrom(account);
      res.status(200).json({ data: { ...accountDto, accessToken: appsAssociatedWithAccount.apiKey['accessToken'] }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  // private createToken(accountDto: AccountDto): TokenData {
  //   const dataStoredInToken: DataStoredInToken = { _id: accountDto._id, email: accountDto.email };
  //   const secretKey: string = process.env.JWT_TOKEN_SECRET;
  //   const expiresIn = 60 * 60; //  60 seconds * 60 = 1 hour

  //   return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  // }

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

    // Inject scripts to BC for NFT

    const scriptData = [
      {
        name: 'NFT inject css',
        description: 'NFT inject css',
        html: "<script type=\"text/javascript\">\n            var linkLoader = function () {\n                var headID = document.getElementsByTagName('head')[0];\n                var link = document.createElement('link');\n\n                link.rel = 'stylesheet';\n                headID.appendChild(link);\n\n                link.href = 'https://tranzetta-v2-scripts-git-development-four13.vercel.app/main.css';\n\n            };\n\n   linkLoader();</script>",
        auto_uninstall: true,
        load_method: 'default',
        location: 'footer',
        visibility: 'all_pages',
        kind: 'script_tag',
        consent_category: 'essential',
      },
      {
        name: 'NFT inject scripts',
        description: 'NFT inject scripts',
        html: '<script src="https://tranzetta-v2-scripts-git-development-four13.vercel.app/main.js" ></script>',
        auto_uninstall: true,
        load_method: 'default',
        location: 'head',
        visibility: 'all_pages',
        kind: 'script_tag',
        consent_category: 'essential',
      },
      {
        name: 'NFT inject function',
        description: 'NFT inject function',
        html: '',
        auto_uninstall: true,
        load_method: 'default',
        location: 'footer',
        visibility: 'all_pages',
        kind: 'script_tag',
        consent_category: 'essential',
      },
    ];

    const html = `<script type="module">MountNFT();</script>`;
    scriptData[2].html = html;
    //End Inject scripts to BC for NFT

    bigCommerce
      .authorize(request.query)
      .then(async data => {
        const BCstoreHash = data.context.replace('stores/', '');

        let app_response;
        let account_response;
        const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': BCstoreHash });

        // Inject scripts to BC for NFT
        const apikeys = {
          accessToken: data.access_token,
          clientId: this.clientId,
          responseType: 'json',
          storeHash: BCstoreHash,
          apiVersion: 'v3',
        };
        const bigCommerceInject = new BigCommerce(apikeys);
        await bigCommerceInject.post(`/content/scripts`, scriptData[0]);
        await bigCommerceInject.post(`/content/scripts`, scriptData[1]);
        await bigCommerceInject.post(`/content/scripts`, scriptData[2]);
        // Inject scripts to BC for NFT

        const appData = {
          name: this.appName,
          type: this.appType,
          apiKey: {
            accessToken: data.access_token,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            authCallback: this.authCallback,
            storeHash: BCstoreHash,
          },
        };

        if (!apps.length) {
          //ADD NEW APP
          app_response = await this.appService.createApp(appData);
        } else {
          //UPDATE THE STORE TOKEN
          app_response = apps;
          const app_update = await this.appService.updateApp(apps[0]._id.toString(), appData);
        }

        // ACCOUNT USER -- TRANZETTA
        // const temporaryPassword = crypto.randomBytes(8).toString('hex');
        const temporaryPassword = 'testpass';
        const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
        const accounts = await this.accountService.findAccounts({ accountId: data.user.id, email: data.user.email });
        if (!accounts.length) {
          const accountData = {
            accountId: data.user.id,
            name: data.user.username,
            email: data.user.email,
            password: hashedTempPassword,
            profile: {
              nft_address: '',
            },
          };
          account_response = await this.accountService.createAccount(accountData);
        } else {
          account_response = accounts;
        }

        console.log('Account Response', account_response);
        console.log('App Response', app_response);

        const user_org = await this.OrganizationService.findOrganizations({ account: account_response._id.toString() });
        const apps_org = await this.OrganizationService.findOrganizations({ apps: app_response._id.toString() });
        // ADD ORGANIZATION

        if (!user_org.length && !apps_org.length) {
          const organizationsData = {
            apps: app_response._id.toString(),
            account: account_response._id.toString(),
            name: this.appName,
          };

          console.log('To be created', organizationsData);
          const newOrg = this.OrganizationService.createOrganizations(organizationsData);
          console.log('Created org', newOrg);
        }

        // if(user_org.length){
        //   const organizationsData = {
        //     apps: app_response,
        //     $addToSet: {account: account_response._id.toString()},
        //     name: this.appName
        //   }

        //   this.OrganizationService.updateOrganization(user_org._id.toString(),organizationsData);
        // }

        // if(apps_org){
        //   const organizationsData = {
        //     $addToSet: {apps: app_response._id.toString()},
        //     account: account_response,
        //     name: this.appName
        //   }

        //   this.OrganizationService.updateOrganization(apps_org._id.toString(),organizationsData);
        // }

        // Send temporary password as email
        await mailer.sendEmail(data.user.email, 'Temporary password', `Your temporary password is ${temporaryPassword}`);

        console.log('Data ini', data);
        // convert to base64
        const payload = JSON.stringify(data);
        const auth_payload = Buffer.from(payload).toString('base64');

        response.redirect(`${this.appPath}?authToken=` + auth_payload);
      })
      .catch(error => {
        console.log({ error });
        next(error);
      });
  };

  public load = async (request: Request, response: Response, next: NextFunction) => {
    console.log('BigCommerce load callback endpoint...');

    const config = {
      secret: this.clientSecret,
      responseType: 'json',
    };
    const bigCommerce = new BigCommerce(config);

    try {
      const data = bigCommerce.verify(request.query['signed_payload']);
      const BCstoreHash = data.context.replace('stores/', '');

      const account = await this.accountService.findAccountByEmail(data.user.email);
      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': BCstoreHash });

      // if(account && apps){
      const loadData = {
        access_token: apps[0]['apiKey']['accessToken'],
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        storeHash: BCstoreHash,
      };
      // }
      product.dataStore = loadData;
      const payload = JSON.stringify(loadData);
      const auth_payload = Buffer.from(payload).toString('base64');

      response.redirect(`${this.appPath}?authToken=` + auth_payload);
      // response.redirect(`${this.appPath}`);
    } catch (err) {
      next(err);
    }
  };

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
      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': BCstoreHash });
      console.log('Apps', apps);
      if (apps[0]) {
        const delete_apps = this.appService.deleteApp(apps[0]._id.toString());
        delete_apps.then(response => {
          console.log('Apps Deleted!', response);
        });
      }

      // Delete Account
      const accounts = await this.accountService.findAccounts({ accountId: data.user.id });
      console.log('Accounts', accounts);
      if (accounts[0]) {
        //Delete Account
        const delete_account = this.accountService.deleteAccount(accounts[0]._id.toString());
        delete_account.then(response => {
          console.log('Accounts Deleted!', response);
        });
      }

      // Delete Organization
      const org = await this.OrganizationService.findOrganizations({ account: accounts[0]._id.toString(), apps: apps[0]._id.toString() });
      console.log('Organization', org);
      if (org[0]) {
        this.OrganizationService.deleteOrganization(org[0]._id.toString());
      }

      response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/uninstalled.html'));
    } catch (err) {
      next(err);
    }
  };

  public verifyPayload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.params.payload;
      const objPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

      // const account = await this.accountService.findAccounts({ accountId: objPayload['user']['id'], name: objPayload['user']['username'] });
      const account = await this.accountService.findAccountByEmail(objPayload['user']['email']);
      if (!account) {
        return next(new HttpException(500, 'Tranzetta user not found.'));
      }

      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.accessToken': objPayload['access_token'] });
      if (!apps.length) {
        return next(new HttpException(500, 'Invalid Token'));
      }

      const accountDto = AccountDto.createFrom(account);
      res.status(200).json({ data: { ...accountDto, accessToken: objPayload['access_token'] }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public verifyAuthToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const isExist = await this.appService.findAllApps({ 'apiKey.accessToken': body.token });
      console.log(isExist);
      if (!isExist.length) {
        res.status(401).json({ message: 'Unauthorized' });
      }

      res.status(200).json({ message: 'Authorized' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
