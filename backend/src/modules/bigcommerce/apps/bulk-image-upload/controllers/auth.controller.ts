import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import { AppType } from '@/enums/app-type.enum';
import { RequestWithFiles } from '../interfaces/upload.interface';
import AppService from '../services/apps.service';
import OrganizationService from '../services/organizations.service';
import AccountService from '../services/accounts.service';
import bcrypt from 'bcrypt';
import { AccountDto } from '../dtos/users.dto';
const BigCommerce = require('node-bigcommerce');
const path = require('path');

import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';
import { timingSafeEqual } from 'crypto';


class AuthController {
  public appService = new AppService();
  public OrganizationService = new OrganizationService();
  public accountService = new AccountService();
  public appPath = 'https://frontend-ui.loca.lt/bulk-image-uploader'; //process.env.ALGOLIA_APP_FRONTEND;
  public clientId = 'i0swnrlg8j5tfzoiaccodwv9fimf0x1'; //process.env.ALGOLIA_APP_BIG_COMMERCE_CLIENT_ID;
  public clientSecret = 'b3de8a242bf3ac106cf63973476b5e0ef3e78961463d9c3f23622033ee4a871d'; //process.env.ALGOLIA_APP_BIG_COMMERCE_SECRET;
  public authCallback = 'https://backend.loca.lt/modules/bigcommerce/bulk-image-upload/api/bc/auth'; //process.env.ALGOLIA_APP_BIG_COMMERCE_CALLBACK_URL;
  public appName = 'BulkImage';
  public appType = AppType.BigCommerce;
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
        let account_response;
        let app_response;

        const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': BCstoreHash });
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
          appData: {
            webDav: "",
            files: ""
          }
        };

        if(apps.length){
          app_response = await this.appService.updateApp(apps[0]._id.toString(), appData);
        } else {
          app_response = await this.appService.createApp(appData);
        }

        const temporaryPassword = 'testpass';
        const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
        const accounts = await this.accountService.findAccounts({ accountId: data.user.id, email: data.user.email }); 

        if (!accounts.length) {
          const accountData = {
            accountId: data.user.id,
            name: data.user.username,
            email: data.user.email,
            password: hashedTempPassword
          };
          account_response = await this.accountService.createAccount(accountData);
        } else {
          account_response = accounts;
        }

        const user_org = await this.OrganizationService.findOrganizations({ users: !accounts.length ? account_response._id : account_response[0]._id, name: this.appName });
        const apps_org = await this.OrganizationService.findOrganizations({ apps: app_response._id.toString(), name: this.appName });
        
        if (!user_org.length && !apps_org.length) {
          const organizationsData = {
            apps: app_response._id.toString(),
            users: !accounts.length ? account_response._id : account_response[0]._id,
            name: this.appName,
          };

          await this.OrganizationService.createOrganizations(organizationsData);
        } else if (user_org.length && !apps_org.length){
          const organizationsData = {
            apps: app_response._id.toString(),
            users: !accounts.length ? account_response._id : account_response[0]._id,
            name: this.appName,
          };
        }

        const payload = JSON.stringify(data);
        const auth_payload = Buffer.from(payload).toString('base64');

        response.redirect(`${this.appPath}?auth=` + auth_payload);
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
      const BCstoreHash = data.context.replace('stores/', '');
      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': BCstoreHash });
      
      const loadData = {
        access_token: apps[0]['apiKey']['accessToken'],
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        context: data.context,
      };

      const payload = JSON.stringify(loadData);
      const auth_payload = Buffer.from(payload).toString('base64');

      response.redirect(`${this.appPath}?auth=` + auth_payload);
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

      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': BCstoreHash });
      if (apps[0]) {
        await this.appService.deleteApp(apps[0]._id.toString());
      }

    } catch (err) {
      next(err);
    }
  };

  public webDavConfig = async (req: Request, res: Response, next: NextFunction) => {
    const { createClient, AuthType } = require("webdav");

    try {

      if(req.body){
        const client = createClient(
          req.body.path,
          {
              authType: AuthType.Digest,
              username: req.body.username,
              password: req.body.password,
          }
        );
    
        const directoryItems = await client.getDirectoryContents("/");
        

        res.status(200).json({ data: directoryItems });
      } else {
        res.status(404).json({ message: "Not Found"})
      }
      
    } catch (error) {
      console.log(error);
      res.status(400).json({ data: error})
    }
  }

  public searchProducts = async (req: Request, res: Response, next: NextFunction) => { 
    const storeHash = req.params.storeHash;
    const queryParams = req.params.searchParams;

    try {
      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.storeHash': storeHash });
      const productsWithImages = [];
      const apikeys = {
        accessToken: apps[0].apiKey.accessToken,
        clientId: this.clientId,
        responseType: 'json',
        storeHash: apps[0].apiKey.storeHash,
        apiVersion: 'v3',
      };
      
      const bigCommerceWrapper = new BigCommerce(apikeys);
      const products = await bigCommerceWrapper.get(`/catalog/products?name:like=${queryParams}`);

      for (let i=0; i < products.data.length; i++){
        const product_id =  products.data[i].id;
        const images = await bigCommerceWrapper.get(`/catalog/products/${product_id}/images`);
        const data_array = {
          products: products.data[i],
          images: images
        }

        productsWithImages.push(data_array);

      }

      res.status(200).json({data: productsWithImages});
    } catch (error) {
      console.log(error);
    }
    

  }

  public verifyPayload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.params.payload;
      const objPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      const BCstoreHash = objPayload['context'].replace('stores/', '');

      const account = await this.accountService.findAccountByEmail(objPayload['user']['email']);
      if (!account) {
        return next(new HttpException(500, 'Bulk Image user not found.'));
      }

      const apps = await this.appService.findAllApps({ name: this.appName, type: this.appType, 'apiKey.accessToken': objPayload['access_token'] });
      if (!apps.length) {
        return next(new HttpException(500, 'Invalid Token'));
      }

      // get store url
      const apikeys = {
        accessToken: apps[0].apiKey.accessToken,
        clientId: this.clientId,
        responseType: 'json',
        storeHash: apps[0].apiKey.storeHash,
        apiVersion: 'v2',
      };
      
      const bigCommerceWrapper = new BigCommerce(apikeys);
      const store = await bigCommerceWrapper.get(`/store`);

      const accountDto = AccountDto.createFrom(account);
      res.status(200).json({ data: { ...accountDto, context: { url: store.control_panel_base_url, domain: store.secure_url, storeHash: BCstoreHash, accessToken: objPayload['access_token'], webDav: apps[0].appData.webDav} }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

}

export default AuthController;
