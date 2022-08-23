import { Request, Response, NextFunction } from 'express';
import ProductService from '../services/product.service';
import ShopifyAccumaticaService from '@services/shopify-accumatica.service';
import ErrorHandle from '@utils/ErrorHandle';
import { logger } from '@utils/logger';

class ICEEShopifyController {
  private productService = new ProductService();
  private shopifyAcumaticaService = new ShopifyAccumaticaService('ICEE');

  public createShopifyProduct = async (req: Request, res: Response, next: NextFunction) => {
    const MAXCOUNT = 3;
    let count = 1;
    while (true) {
      console.log(`creating alternate product : attempt -> ${count}`);
      try {
        const { Inserted, Deleted } = req.body;
        let result = [];

        //if there is deleted
        if (Deleted.length > 0) {
          const AI = Deleted.map(d => this.productService.hasWhiteSpace(d.AlternateID));
          result = [...result, await this.productService.deleteProduct(AI)];
        }

        //if there is inserted
        if (Inserted.length > 0) {
          const sku = Inserted[0].InventoryID.trim();
          console.log('updating global type');
          await this.shopifyAcumaticaService.duplicateCrossReferencesByAlternateId(sku);
          console.log('done updating global type');
          result = [...result, await this.productService.createProduct(sku)];
        }

        // IF BOTH inserted and deleted is empty
        if (Inserted.length == 0 && Deleted.length == 0) {
          return res.status(200).json({
            message: 'empty inserted and deleted',
          });
        }

        return res.status(200).json({
          success: true,
          result,
        });
      } catch (err) {
        if (count === +MAXCOUNT) {
          if (err.code) {
            return res.status(err.code).send(err);
          } else {
            return next(err);
          }
        }
        count++;
      }
    }
  };

  public uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    let result = [];

    const { Inserted, Deleted } = req.body;
    const sku = Inserted[0].InventoryID.trim();
    result = [...result, await this.productService.uploadImages(sku)];

    return res.status(200).json({
      success: true,
      result,
    });
  };

  public updateAlternateproduct = async (req: Request, res: Response, next: NextFunction) => {
    const MAXCOUNT = 3;
    let count = 1;
    while (true) {
      console.log(`updating alternate product : attempt -> ${count}`);
      try {
        const { Inserted, Deleted } = req.body;
        let result = [];

        if (Inserted.length > 0) {
          const sku = Inserted[0].InventoryID.trim();
          result = [...result, await this.productService.updateAlternateProduct(sku)];
        } else if (Deleted.length > 0) {
          const sku = Deleted[0].InventoryID.trim();
          result = [...result, await this.productService.updateAlternateProduct(sku)];
        } else {
          return res.status(200).json({
            message: 'empty inserted and deleted',
          });
        }

        return res.status(200).json({
          success: true,
          result,
        });
      } catch (err) {
        if (count === MAXCOUNT) {
          if (err.code) {
            return res.status(err.code).send(err);
          } else {
            return next(err);
          }
        }
        count++;
      }
    }
  };

  public iceeInit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let result = [];

      result = await this.productService.iceeInit();
      return res.status(200).json({
        success: true,
        result,
      });
    } catch (err) {
      if (err.code) {
        return res.status(err.code).send(err);
      } else {
        return next(err);
      }
    }
  };

  public stockAvailibility = async (req: Request, res: Response, next: NextFunction) => {
    const MAXCOUNT = 3;
    let count = 1;
    while (true) {
      console.log(`updating alternate product stock availability : attempt -> ${count}`);
      try {
        const { Inserted, Deleted } = req.body;
        let result = [];

        if (Inserted.length > 0) {
          const acumaticaID = Inserted[0].RefNoteID.trim();

          if (Inserted[0].Entity === 'Product Availability' && Inserted[0].Status === 'Processed') {
            console.log('stock is being updated');
            result = [...result, await this.productService.stockAvailability(acumaticaID)];
          } else {
            console.log('Entity is not product availability or processed');
          }
        } else {
          return res.status(200).json({
            message: 'empty inserted and deleted',
          });
        }

        return res.status(200).json({
          success: true,
          result,
        });
      } catch (err) {
        if (count === MAXCOUNT) {
          if (err.code) {
            return res.status(err.code).send(err);
          } else {
            return next(err);
          }
        }
        count++;
      }
    }
  };

  public productImages = async (req: Request, res: Response, next: NextFunction) => {
    const MAXCOUNT = 3;
    let count = 1;
    while (true) {
      console.log(`creating alternate product : attempt -> ${count}`);
      try {
        const { Inserted, Deleted } = req.body;
        let result = [];

        if (Inserted.length > 0) {
          const externalIDs = Inserted[0].ExternalID.trim();
          const externalID = externalIDs.split(';');

          const shopifyProductID = `gid://shopify/Product/${externalID[0]}`;
          const productImageID = `gid://shopify/ProductImage/${externalID[externalID.length - 1]}`;

          if (Inserted[0].Entity === 'Product Image' && Inserted[0].Status === 'Processed') {
            console.log('images is being updated');
            result = [...result, await this.productService.productImages(shopifyProductID, productImageID)];
          } else {
            console.log('Entity is not product images or processed');
          }
        } else {
          return res.status(200).json({
            message: 'empty inserted and deleted',
          });
        }

        return res.status(200).json({
          success: true,
          result,
        });
      } catch (err) {
        if (count === MAXCOUNT) {
          if (err.code) {
            return res.status(err.code).send(err);
          } else {
            return next(err);
          }
        }
        count++;
      }
    }
  };

  public runDuplicateCrossReferencesJob = async (req: Request, res: Response, next: NextFunction) => {
    const organizationId = 'ICEE';
    logger.info(`${organizationId}: Duplicating cross referrence`);

    try {
      let data = await this.shopifyAcumaticaService.getAllSyncCrossReferenceData();

      logger.info(`Data to be process: ${data.length}`);

      if(data.length > 0) {

        for (let x = 0; x < data.length; x++) {

          try {
            const inventory = data[x];
            const inventoryId = inventory?.InventoryID?.value;

            if (inventoryId && inventory?.ExportToExternal?.value) {
              logger.info(`Processing: ${inventoryId}`);
              await this.shopifyAcumaticaService.duplicateCrossReferencesByAlternateId(inventoryId);
              await this.productService.createProduct(inventoryId);
              logger.info(`Complete: ${inventoryId}`);
            }
          }
          catch(err) {
            logger.info(`Processing Error: ${err.message}`);
          }
        }
      }
      else {
        logger.info(`No product data`);
      }

      return res.status(200).json({
        success: true
      });
    } catch (error) {
      logger.info(`error: ${error}`);

      return res.status(500).send(error);
    }
  };
}

export default ICEEShopifyController;
