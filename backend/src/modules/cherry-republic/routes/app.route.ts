import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AuthMiddleware from '../middlewares/auth.middleware';
import CheckoutController from '../controllers/checkout.controller';

class ModuleBigcommerceCherryRepRoute implements Routes {
  public path = '/modules/cherryrepublic/';
  public router = Router();
  private checkoutController = new CheckoutController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // POST Fedex Address Verification
    this.router.post(`${this.path}addressverification`, AuthMiddleware, this.checkoutController.fedexAddressVerification);
  }
}

export default ModuleBigcommerceCherryRepRoute;
