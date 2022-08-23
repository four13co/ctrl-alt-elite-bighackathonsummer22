import { Router } from 'express';
import WebhooksController from '@controllers/shopify-acumatica/webhooks.controller';
import { Routes } from '@interfaces/routes.interface';

class ShopifyAcumaticaRoute implements Routes {
  public path = '/api/shopify-acumatica';
  public router = Router();
  public webhooksController = new WebhooksController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/webhooks/icee/cross-reference`, this.webhooksController.acumaticaCrossReferenceWebhook);

    this.router.get(`${this.path}/webhooks/icee/duplicate-cross-reference/:inventoryId`, this.webhooksController.updateGlobalType);
    this.router.get(`${this.path}/webhooks/icee/run-duplicate`, this.webhooksController.duplicateAllInvetory);
  }
}

export default ShopifyAcumaticaRoute;
