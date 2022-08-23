import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';

class IndexRoute implements Routes {
  public path = '/';
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);
    this.router.get(`${this.path}test`, this.indexController.test);

    this.router.get(`${this.path}test-bc`, this.indexController.bcTest);
    this.router.get(`${this.path}bc-products/:productId`, this.indexController.getBCProduct);
    this.router.post(`${this.path}bc-products`, this.indexController.createBCProduct);
    this.router.put(`${this.path}bc-products/:productId`, this.indexController.updateBCProduct);
    this.router.delete(`${this.path}bc-products/:productId`, this.indexController.deleteBCProduct);

    this.router.get(`${this.path}bc-orders`, this.indexController.getBCOrders);
    this.router.get(`${this.path}bc-orders/:orderId`, this.indexController.getBCOrder);
    this.router.post(`${this.path}bc-orders`, this.indexController.createBCOrder);
    this.router.put(`${this.path}bc-orders/:orderId`, this.indexController.updateBCOrder);
    this.router.delete(`${this.path}bc-orders/:orderId`, this.indexController.deleteBCOrder);
    this.router.get(`${this.path}test-db`, this.indexController.dbTest);

    //this.router.get(`${this.path}sync-acumatica-orders-to-bigcommerce/:productId`, this.indexController.syncAcumaticaProductsToBC);

    this.router.get(`${this.path}sync-acumatica-purchase-orders-to-bigcommerce-purchase-order`, this.indexController.syncAPOsToBCPOs);
    this.router.post(
      `${this.path}sync-acumatica-product-availability-to-bigcommerce-product-availability`,
      this.indexController.AProdAvailToBProdAvail,
    );
    this.router.post(`${this.path}sync-acumatica-shipping-group-to-bigcommerce-shipping-group`, this.indexController.AShippingGroupsToShippingGroups);
    this.router.post(`${this.path}sync-products`, this.indexController.SyncAcumaticaProductToBigcommerceProduct);
    this.router.post(`${this.path}acumatica-product-webhook`, this.indexController.AcumaticaProductWebhook);
    this.router.post(`${this.path}acumatica-product-webhook2`, this.indexController.AcumaticaProductWebhook2);

    this.router.put(`${this.path}saddleback-customer-update`, this.indexController.SaddlebackCustomerUpdate);
  }
}

export default IndexRoute;
