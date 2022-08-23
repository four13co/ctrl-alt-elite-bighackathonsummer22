import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import WebhooksController from '@/controllers/webhooks.controller';

class WebhookRoute implements Routes {
  public path = '/api';
  public router: Router = Router();
  public webhookController: WebhooksController = new WebhooksController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/webhooks/bigcommerce/medex`, this.webhookController.bcWebhook);
    this.router.post(`${this.path}/webhooks/acumatica/sales-order`, this.webhookController.acumaticaSalesOrderWebhook);
    this.router.post(`${this.path}/webhooks/bigcommerce/algolia`, this.webhookController.bigcommerceAlgolia);
    this.router.post(`${this.path}/webhooks/bigcommerce/algolia/init`, this.webhookController.initBigcommerceAlgolia);
    this.router.post(`${this.path}/webhooks/acumatica/shopify/init`, this.webhookController.initIceeShopify);
  }
}

export default WebhookRoute;
