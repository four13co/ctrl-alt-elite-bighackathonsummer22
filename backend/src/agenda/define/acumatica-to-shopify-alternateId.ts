import { Agenda, Job } from 'agenda/dist';
import { logger } from '@utils/logger';
import moment from 'moment-timezone';
import ShopifyAccumaticaService from '@services/shopify-accumatica.service';

// import { setTimeout } from 'timers/promises';
import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';
import ShopifyWrapper from '@apis/shopify/shopify-wrapper';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import { AppType } from '@/enums/app-type.enum';

export default function (agenda: Agenda) {
  agenda.define('acumatica-to-shopify-alternateId', async (obj: Job) => {
    const organizationId = obj.attrs.data.organization;
    logger.info(`${organizationId}: Syncing alternate id`);
    try {
      const icee: Organization = await organizationModel.findOne({ name: 'ICEE' }).populate('apps');

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
      const acumaticaParams = `?$select=InventoryID,ExportToExternal,LastModified,CrossReferences/AlternateID&$expand=crossreferences&$filter=LastModified gt datetimeoffset'${moment()
        .tz('US/Central')
        .utc(true)
        .subtract(2, 'hours')
        .format()}'`;
      const acumaticaProduct: any = await acumaticaWrapper.getProducts(`${acumaticaParams}`);

      const filterACProduct = acumaticaProduct
        .filter(ap => ap.ExportToExternal.value)
        .map(ap => {
          let alternateId = '';
          if (ap.CrossReferences.length) {
            alternateId = ap.CrossReferences.map(cr => cr.AlternateID.value).join(', ');
          }
          return { ...ap, alternateId };
        });
      if (filterACProduct.length === 0) {
        logger.info('no updated product');
        return;
      }

      const SKU = filterACProduct.map(ap => `sku:${ap.InventoryID.value}`).join(' OR ');

      const query = {
        query: `
        {
          productVariants(first: 250, query: "${SKU}") {
            edges {
              node {
                sku
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

      const shopifyWrapper = new ShopifyWrapper();
      await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);
      const shopifyProductsResult = await shopifyWrapper.graphQl(query);
      const shopifyProducts = shopifyProductsResult.data.productVariants.edges.map(spr => spr.node);

      logger.info('timeout for 20seconds to regenerate the ratelimit');
      await new Promise(resolve => setTimeout(resolve, 20000));
      logger.info('updating shopify products');
      let updateMetafield = '';

      filterACProduct.forEach(ap => {
        const shopifyProduct = shopifyProducts.find(sp => sp.sku === ap.InventoryID.value);
        if (shopifyProduct) {
          if (shopifyProduct.product.metafield) {
            if (shopifyProduct.product.metafield.value !== ap.alternateId) {
              updateMetafield += `
              product${shopifyProduct.sku}: productUpdate(input: {
                  id: "${shopifyProduct.product.id}",
                    metafields: [
                      {
                        id: "${shopifyProduct.product.metafield.id}"
                        value: "${ap.alternateId}",
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
              `;
            }
          } else {
            updateMetafield += `
            product${shopifyProduct.sku}: productUpdate(input: {
              id: "${shopifyProduct.product.id}",
                metafields: [
                  {
                    namespace: "my_fields",
                    key: "alternate_id",
                    value: "${ap.alternateId}",
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
              }`;
          }
        }
      });

      if (updateMetafield.length === 0) {
        logger.info('product is up to date');
        return;
      }
      const metafieldsGQL = {
        query: `
        mutation {
          ${updateMetafield}
        }
      `,
      };

      await shopifyWrapper.graphQl(metafieldsGQL);

      logger.info('success');
    } catch (error) {
      logger.info(`error: ${error}`);
    }
  });

  agenda.define('acumatica-duplicate-cross-reference', async (obj: Job) => {
    const organizationId = obj.attrs.data.organization;
    logger.info(`${organizationId}: Duplicating cross referrence`);

    try {
      const shopifyAcumaticaService = new ShopifyAccumaticaService('ICEE');
      await shopifyAcumaticaService.duplicateCrossReferencesOfAllInventoriesInAcumatica();
    } catch (error) {
      logger.info(`error: ${error}`);
    }
  });
}
