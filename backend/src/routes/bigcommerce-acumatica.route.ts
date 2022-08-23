import { Router } from 'express';
import UOMController from '@controllers/bigcommerce-acumatica/uom.controller';
import WebhooksController from '@controllers/bigcommerce-acumatica/webhooks.controller';
import { Routes } from '@interfaces/routes.interface';
import MIGController from '@/controllers/bigcommerce-acumatica/mig.controller';

class BigcommerceAcumaticaRoute implements Routes {
  public path = '/api/bigcommerce-acumatica';
  public router = Router();
  public uomController = new UOMController();
  public webhooksController = new WebhooksController();
  public migController = new MIGController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    if (process.env.IS_LOCAL == '1') {
      // this.router.get(`${this.path}/uom/:productId`, this.uomController.syncAcumaticaProductsToBC);
    }

    this.router.post(`${this.path}/uom`, this.uomController.syncAcumaticaProductsToBCPost);
    this.router.post(`${this.path}/webhooks`, this.webhooksController.captureWebhook);
    // this.router.get(`${this.path}/discount-sync`, this.webhooksController.discountSyncWebhooks);

    // MIG Route
    this.router.post(`${this.path}/mig/update-price`, this.migController.updatePrice);
    this.router.post(`${this.path}/mig/add-line-item-cart`, this.migController.addLineItemCart);
  }
}

export default BigcommerceAcumaticaRoute;
