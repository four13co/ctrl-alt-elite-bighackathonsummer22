import { NextFunction, Request, Response } from 'express';
import ShopifyWrapper from '@apis/shopify/shopify-wrapper';
import { AppType } from '@/enums/app-type.enum';
import ShopifyAccumaticaService from '@services/shopify-accumatica.service';

class WebhooksController {
  public acumaticaCrossReferenceWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shopifyAcumaticaService = new ShopifyAccumaticaService('ICEE');

      const { Inserted, Deleted } = req.body;
      let inventoryId = '';
      if (Inserted.length !== 0) {
        inventoryId = Inserted[0].InventoryID.trim();
      } else {
        inventoryId = Deleted[0].InventoryID.trim();
      }

      // const acumaticaProductId = 'a75483d7-51eb-eb11-817f-12ab715c9afd';
      // process cross referrence duplicate and check if valid
      const acumaticaProduct: any = await shopifyAcumaticaService.duplicateCrossReferencesByAlternateId(inventoryId);
      const icee = shopifyAcumaticaService.organization;

      if (!acumaticaProduct) {
        res.json({ message: 'no updated product' });
        return;
      }

      const alternateIds = acumaticaProduct.CrossReferences.map(cr => cr?.AlternateID?.value).join(', ');
      const sku = acumaticaProduct.InventoryID?.value;

      const shopifyWrapper = new ShopifyWrapper();
      await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

      const variants = {
        query: `
        {
          productVariants(first: 1, query: "sku:${sku}") {
            edges {
              node {
                product {
                  id
                  metafield(namespace: "my_fields", key: "alternate_id") {
                    id
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
        `,
      };
      const metafieldIdKey = await shopifyWrapper.graphQl(variants);
      if (metafieldIdKey.data.productVariants.edges.length === 0) {
        res.status(404).json({ message: 'shopify product not found' });
        return;
      }
      const shopifyProduct = metafieldIdKey.data.productVariants.edges[0].node.product;

      let metafieldsGQL = {
        query: `
          mutation {
            productUpdate(input: {
            id: "${shopifyProduct.id}",
              metafields: [
                {
                  namespace: "my_fields",
                  key: "alternate_id",
                  value: "${alternateIds}",
                }
              ]
            }) {
              product {
                metafield(namespace: "my_fields", key: "alternate_id") {
                   id
                    namespace
                    key
                    value
                }
              }
            }
          }
        `,
      };

      // IF shopify product alternate id metafield already exist
      if (shopifyProduct.metafield != null) {
        metafieldsGQL = {
          query: `
          mutation {
            productUpdate(input: {
              id: "${shopifyProduct.id}",
                metafields: [
                  {
                    id: "${shopifyProduct.metafield.id}"
                    value: "${alternateIds}",
                  }
                ]
            }) {
              product {
                metafield(namespace: "my_fields", key: "alternate_id") {
                    id
                    namespace
                    key
                    value
                }
              }
            }
          }
        `,
        };
      }

      await shopifyWrapper.graphQl(metafieldsGQL);
      res.json({ msg: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public updateGlobalType = async (req: Request, res: Response, next: NextFunction) => {
    const inventoryId: string = req.params.inventoryId;

    try {
      const shopifyAcumaticaService = new ShopifyAccumaticaService('ICEE');
      const records = await shopifyAcumaticaService.duplicateCrossReferencesByAlternateId(inventoryId);

      res.json(records);
    } catch (error) {
      next(error);
    }
  };

  public duplicateAllInvetory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shopifyAcumaticaService = new ShopifyAccumaticaService('ICEE');
      const records = await shopifyAcumaticaService.duplicateCrossReferencesOfAllInventoriesInAcumatica();
      res.json(records);
    } catch (error) {
      next(error);
    }
  };
}

export default WebhooksController;
