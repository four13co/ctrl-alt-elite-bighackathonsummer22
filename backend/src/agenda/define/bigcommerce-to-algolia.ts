import lodash from 'lodash';
import { convert as HtmlToText } from 'html-to-text';
import { Agenda, Job } from 'agenda/dist';
import organizationModel from '@/models/organizations.model';
import algoliaSyncCacheModel from '@/apis/algolia/models/algolia-sync-cache.model';
import { AppType } from '@/enums/app-type.enum';
import AlgoliaWrapper from '@/apis/algolia/algolia-wrapper';
import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';
import { ProductDetail as BcProduct, Product as BcRawProduct } from '@/apis/bigcommerce/interfaces/products.interface';
import { Product as AlProduct } from '@/apis/algolia/interfaces/products.interface';
import { AlgoliaSyncCache } from '@/apis/algolia/interfaces/algolia-sync-cache.interface';
import AgendaService from '@/modules/bigcommerce/apps/algolia/services/agenda.service';

const eventType = {
  INSERT: 0,
  UPDATE: 1,
  REPLACE: 2,
  DELETE: -1,
};

async function getWrappers(orgId: number) {
  if (orgId) {
    const organization = await organizationModel.findById(orgId).populate('apps');

    if (organization) {
      const ret = {
        algolia: new AlgoliaWrapper(),
        bigcommerce: new BigcommerceWrapper(),
      };

      const algoliaApp = organization.apps.find(ii => ii.type == AppType.Algolia);
      if (algoliaApp) {
        await ret.algolia.init(algoliaApp._id);
      } else {
        throw new Error('Algolia app was not set');
      }

      const bigcommerceApp = organization.apps.find(ii => ii.type == AppType.BigCommerce);
      if (bigcommerceApp) {
        await ret.bigcommerce.init(bigcommerceApp._id);
      } else {
        throw new Error('Bigcommerce app was not set');
      }

      return ret;
    } else {
      throw new Error('Organization not found');
    }
  } else {
    throw new Error('param orgId is required');
  }
}

export default function (agenda: Agenda) {
  const createJob = async (every, name, data, options) => {
    const job = agenda.create(name, data);
    job.unique({ 'data.orgId': data.orgId }).repeatEvery(every, options);

    return job.save();
  };

  agenda.define('bigcommerce-to-algolia-sync', async (job: Job) => {
    const { orgId } = job.attrs.data;
    const { algolia } = await getWrappers(orgId);

    const cacheList = await algoliaSyncCacheModel.find({ appId: algolia.app._id });
    const cacheChunk = lodash.chunk(cacheList, 100);

    for (let xx = 0; xx < cacheChunk.length; xx++) {
      const cache: AlgoliaSyncCache[] = cacheChunk[xx];
      await algolia.batchSave(
        cache.map(ii => {
          const value = {
            action: '',
            body: ii.data,
          };

          if (ii.type == eventType.INSERT) {
            value.action = 'addObject';
          } else if (ii.type == eventType.UPDATE) {
            value.action = 'partialUpdateObject';
          } else if (ii.type == eventType.REPLACE) {
            value.action = 'partialUpdateObjectNoCreate';
          } else {
            value.action = 'deleteObject';
          }

          return value;
        }),
      );

      const idToDelete = [];
      for (let xx = 0; xx < cache.length; xx++) {
        const c: any = cache[xx];
        idToDelete.push(c._id);
      }

      await algoliaSyncCacheModel.deleteMany({
        _id: {
          $in: idToDelete,
        },
      });
    }
  });

  agenda.define('bigcommerce-to-algolia', async (job: Job) => {
    const { orgId, type, productId } = job.attrs.data;
    const { algolia, bigcommerce } = await getWrappers(orgId);

    const syncJobs = await agenda.jobs({ name: 'bigcommerce-to-algolia-sync', 'data.orgId': orgId });
    const syncJob =
      syncJobs && syncJobs.length > 0 ? syncJobs[0] : await createJob('1 hour', 'bigcommerce-to-algolia-sync', { orgId }, { skipImmediate: true });

    let bcProduct: BcProduct;
    let alProduct: AlProduct;

    switch (type) {
      case 'store/product/created':
        bcProduct = await bigcommerce.getProductDetail(productId);
        alProduct = {
          objectID: `bcprod-${productId}`,
          sku: bcProduct.sku,
          upc: bcProduct.barcode,
          id: bcProduct.id,
          name: bcProduct.name,
          type: bcProduct.type,
          brand: bcProduct.brand,
          product_url: bcProduct.url,
          keywords: bcProduct.keywords,
          description: HtmlToText(bcProduct.description, { wordwrap: 200 }),
          price: bcProduct.price,
          retail_price: bcProduct.retailPrice,
          taxable: bcProduct.taxable,
          depth: bcProduct.depth,
          width: bcProduct.width,
          height: bcProduct.height,
          weight: bcProduct.weight,
          image: bcProduct.images[0]?.standard,
          thumbnail: bcProduct.images[0]?.thumbnail,
          inventory_level: bcProduct.inventory.quantity,
          rating: bcProduct.rating,
          total_sold: bcProduct.soldCount,
          categories: bcProduct.categories.map(ii => ii.name),
          availability: bcProduct.availability,
          is_featured: bcProduct.isFeatured,
          sort_order: bcProduct.sortOrder,
          variants: bcProduct.variants.map(ii => ii.name),
          created_at: new Date(bcProduct.createdOn),
          updated_at: new Date(bcProduct.updatedOn),
        };

        await algoliaSyncCacheModel.create({
          appId: algolia.app._id,
          productId: productId,
          type: eventType.INSERT,
          data: alProduct,
        });

        await syncJob.run();

        break;
      case 'store/product/updated':
        bcProduct = await bigcommerce.getProductDetail(productId);
        const alProductCache = await algoliaSyncCacheModel.findOne({ appId: algolia.app._id, productId: productId });
        if (alProductCache) {
          alProduct = alProductCache.data;
        } else {
          alProduct = await algolia.findProduct(`bcprod-${productId}`);
        }

        const newAlProduct: AlProduct = {
          objectID: `bcprod-${productId}`,
          sku: bcProduct.sku,
          upc: bcProduct.barcode,
          id: bcProduct.id,
          name: bcProduct.name,
          type: bcProduct.type,
          brand: bcProduct.brand,
          product_url: bcProduct.url,
          keywords: bcProduct.keywords,
          description: HtmlToText(bcProduct.description, { wordwrap: 200 }),
          price: bcProduct.price,
          retail_price: bcProduct.retailPrice,
          taxable: bcProduct.taxable,
          depth: bcProduct.depth,
          width: bcProduct.width,
          height: bcProduct.height,
          weight: bcProduct.weight,
          image: bcProduct.images[0]?.standard,
          thumbnail: bcProduct.images[0]?.thumbnail,
          inventory_level: bcProduct.inventory.quantity,
          rating: bcProduct.rating,
          total_sold: bcProduct.soldCount,
          categories: bcProduct.categories.map(ii => ii.name),
          availability: bcProduct.availability,
          is_featured: bcProduct.isFeatured,
          sort_order: bcProduct.sortOrder,
          variants: bcProduct.variants.map(ii => ii.name),
          created_at: new Date(bcProduct.createdOn),
          updated_at: new Date(bcProduct.updatedOn),
        };

        if (alProduct) {
          alProduct.created_at = new Date(alProduct.created_at);
          alProduct.updated_at = new Date(alProduct.updated_at);

          if (bcProduct.soldCount != alProduct.total_sold || bcProduct.inventory.quantity < alProduct.inventory_level) {
            const newAlPartialProduct = {
              objectID: newAlProduct.objectID,
              id: newAlProduct.id,
              total_sold: newAlProduct.total_sold,
              inventory_level: newAlProduct.inventory_level,
              updated_at: newAlProduct.updated_at,
            };

            if (alProductCache) {
              await algoliaSyncCacheModel.findByIdAndUpdate(alProductCache._id, {
                data: alProductCache.type == eventType.REPLACE ? newAlProduct : newAlPartialProduct,
              });
            } else {
              await algoliaSyncCacheModel.create({
                appId: algolia.app._id,
                productId: productId,
                type: eventType.UPDATE,
                data: newAlPartialProduct,
              });
            }
          } else if (new Date(bcProduct.updatedOn).toISOString() !== alProduct.updated_at.toISOString()) {
            await algoliaSyncCacheModel.deleteMany({
              appId: algolia.app._id,
              productId: productId,
            });

            await algoliaSyncCacheModel.create({
              appId: algolia.app._id,
              productId: productId,
              type: eventType.REPLACE,
              data: newAlProduct,
            });

            await syncJob.run();
          } else {
            console.log('Skip data update of product ' + bcProduct.name);
          }
        } else {
          await algoliaSyncCacheModel.create({
            appId: algolia.app._id,
            productId: productId,
            type: eventType.INSERT,
            data: newAlProduct,
          });

          await syncJob.run();
        }
        break;
      case 'store/product/deleted':
        await algoliaSyncCacheModel.deleteMany({
          appId: algolia.app._id,
          productId: productId,
        });

        await algoliaSyncCacheModel.create({
          appId: algolia.app._id,
          productId: productId,
          type: eventType.DELETE,
          data: {
            objectID: `bcprod-${productId}`,
          },
        });

        await syncJob.run();
        break;
    }

    await job.remove();
  });

  agenda.define('init-bigcommerce-to-algolia', async (job: Job) => {
    const { orgId } = job.attrs.data;
    const { bigcommerce } = await getWrappers(orgId);

    const bcProducts: BcRawProduct[] = await bigcommerce.getProducts('?include_fields=id');
    const commands = [];
    for (let xx = 0; xx < bcProducts.length; xx++) {
      const bcProduct = bcProducts[xx];

      commands.push(
        agenda.now('bigcommerce-to-algolia', {
          orgId: orgId,
          type: 'store/product/created',
          productId: bcProduct.id,
        }),
      );
    }

    await Promise.all(commands);
    job.remove();
  });

  agenda.define('init-bigcommerce-to-algolia2', async (job: Job) => {
    const algoliaAgenda = new AgendaService();
    await algoliaAgenda.initBigcommerceToAlgolia(job, agenda);
  });

  agenda.define('bigcommerce-to-algolia2', async (job: Job) => {
    const algoliaAgenda = new AgendaService();
    await algoliaAgenda.bigcommerceToAlgolia(job, agenda);
  });

  agenda.define('bigcommerce-to-algolia-sync2', async (job: Job) => {
    const algoliaAgenda = new AgendaService();
    await algoliaAgenda.bigcommerceToAlgoliaSync(job, agenda);
  });
}
