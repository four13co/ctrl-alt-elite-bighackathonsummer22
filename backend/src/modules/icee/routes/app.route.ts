import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

import ICEEShopifyController from '../controllers/iceeShopify.controller';

class ModuleShopifyICEERoute implements Routes {
  public path = '/modules/shopify/icee/api';
  public router = Router();

  private iceeShopifyController = new ICEEShopifyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/create-product`, this.iceeShopifyController.createShopifyProduct);
    this.router.post(`${this.path}/update-alternate-product`, this.iceeShopifyController.updateAlternateproduct);
    this.router.post(`${this.path}/upload-images`, this.iceeShopifyController.uploadImage);
    this.router.post(`${this.path}/init`, this.iceeShopifyController.iceeInit);
    this.router.post(`${this.path}/stock-availability`, this.iceeShopifyController.stockAvailibility);
    this.router.post(`${this.path}/product-images`, this.iceeShopifyController.productImages);
    this.router.post(`${this.path}/run-duplicate-cross-reference-job`, this.iceeShopifyController.runDuplicateCrossReferencesJob);
  }
}

export default ModuleShopifyICEERoute;
