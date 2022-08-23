import { NextFunction, Request, Response } from 'express';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import BigcommerceAcumaticaService from '@/services/bigcommerce-acumatica.service';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { AppType } from '@/enums/app-type.enum';
import { Product } from '@apis/bigcommerce/interfaces/products.interface';

class UOMController {
  public bigcommerceAcumaticaService = new BigcommerceAcumaticaService();

  public syncAcumaticaProductsToBCPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = req.query.company ? req.query.company.toString() : 'Medex Supply';
      const medex: Organization = await organizationModel.findOne({ name: org }).populate('apps');
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);

      const { Inserted, Deleted } = req.body;
      let SKUs = Inserted.map(({ InventoryID }) => InventoryID.trim());
      SKUs = [...SKUs, ...Deleted.map(({ InventoryID }) => InventoryID.trim())];
      SKUs = [...new Set(SKUs)];

      console.log('Medex UOM:', `Sales Price Webhook - ${SKUs.join(', ')}`);
      if (req.headers[process.env.HEADER] == process.env.HEADER_VALUE) {
        for (let a = 0; a < SKUs.length; a++) {
          console.log('Medex UOM:', `Lookup Product - ${SKUs[a]}`);
          const result: Product = await bigcommerceWrapper.getProductBySku(SKUs[a]);
          if (result) {
            await this.bigcommerceAcumaticaService.syncSalesPrice(org, result, SKUs[a]);
          } else {
            console.log('Medex UOM:', `Lookup Product Variant - ${SKUs[a]}`);
            const product = await this.bigcommerceAcumaticaService.getBCProductByVariantSku(org, SKUs[a]);
            if (product) {
              await this.bigcommerceAcumaticaService.syncSalesPrice(org, product, product.sku, SKUs[a]);
            }
          }
        }
      }
      res.json(SKUs);
    } catch (err) {
      next(err);
    }
  };

  // public syncAcumaticaProductsToBC = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const medex: Organization = await organizationModel.findOne({ name: 'Medex Supply' }).populate('apps');
  //     const bigcommerceWrapper = new BigcommerceWrapper();
  //     await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);

  //     const sku = req.params.productId;
  //     const SKUs = [sku];
  //     console.log('Medex UOM:', `Sales Price Webhook - ${SKUs.join(', ')}`);

  //     for (let a = 0; a < SKUs.length; a++) {
  //       console.log('Medex UOM:', `Lookup Product - ${SKUs[a]}`);
  //       const result: Product = await bigcommerceWrapper.getProductBySku(SKUs[a]);
  //       if (result) {
  //         this.bigcommerceAcumaticaService.syncSalesPrice(result, SKUs[a]);
  //       } else {
  //         console.log('Medex UOM:', `Lookup Product Variant - ${SKUs[a]}`);
  //         const product = await this.bigcommerceAcumaticaService.getBCProductByVariantSku(SKUs[a]);
  //         if (product) {
  //           await this.bigcommerceAcumaticaService.syncSalesPrice(product, product.sku, SKUs[a]);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  public syncBigCommerceToAcumatica = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const orderId: string = req.orderId;
    } catch (err) {
      next(err);
    }
  };
}

export default UOMController;
