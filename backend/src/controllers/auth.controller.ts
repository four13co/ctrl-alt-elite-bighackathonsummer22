import { NextFunction, Request, Response } from 'express';
import { SignupDto, ForgotPasswordDto, LoginDto, ResetPasswordDto, UserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@services/auth.service';
import AppService from '@services/apps.service';
import { AppType } from '@/enums/app-type.enum';
const BigCommerce = require('node-bigcommerce');
const path = require('path');

class AuthController {
  public authService = new AuthService();
  public appService = new AppService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: SignupDto = req.body;
      const signUpUserData: UserDto = await this.authService.signup(userData);
      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginDto = req.body;
      const { user, accessToken, organization } = await this.authService.login(userData);
      res.status(200).json({ data: { ...user, accessToken: accessToken, organization }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // Refer to Udemy's "The Complete Node.js Developer Course (3rd Edition)" for tracking the token, and invalidating them for users who logged out
      res.status(200).json({ data: {}, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: ForgotPasswordDto = req.body;
      await this.authService.forgotPassword(dto);
      res.status(200).json({ data: '', message: 'forgot password' });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: ResetPasswordDto = req.body;
      await this.authService.resetPassword(dto);
      res.status(200).json({ data: '', message: 'reset password' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * BigCommerce auth callback endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public auth = async (request: Request, response: Response, next: NextFunction) => {
    console.log('BigCommerce auth callback endpoint...');
    const config = {
      clientId: process.env.ALGOLIA_APP_BIG_COMMERCE_CLIENT_ID,
      secret: process.env.ALGOLIA_APP_BIG_COMMERCE_SECRET,
      callback: process.env.ALGOLIA_APP_BIG_COMMERCE_CALLBACK_URL,
      responseType: 'json',
      apiVersion: 'v3',
    };
    const bigCommerce = new BigCommerce(config);

    bigCommerce
      .authorize(request.query)
      .then(data => {
        const appData = {
          name: AppType.BigCommerce,
          type: AppType.BigCommerce,
          apiKey: {
            accessToken: data.access_token,
            storeHash: data.context.replace('stores/', ''),
          },
        };
        this.appService.createApp(appData);
        // response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/installed.html'));
        response.redirect(process.env.ALGOLIA_APP_FRONTEND + '/welcome');
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
      secret: process.env.ALGOLIA_APP_BIG_COMMERCE_SECRET,
      responseType: 'json',
    };
    const bigCommerce = new BigCommerce(config);

    try {
      const data = bigCommerce.verify(request.query['signed_payload']);
      // response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/installed.html'));
      response.redirect(process.env.ALGOLIA_APP_FRONTEND + '/dashboard/' + request.query['signed_payload']);
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
      secret: process.env.ALGOLIA_APP_BIG_COMMERCE_SECRET,
      responseType: 'json',
    };
    const bigCommerce = new BigCommerce(config);

    try {
      const data = bigCommerce.verify(request.query['signed_payload']);
      response.sendFile(path.join(__dirname, '../views/integrations/bigcommerce/uninstalled.html'));
    } catch (err) {
      next(err);
    }
  };
}

export default AuthController;
