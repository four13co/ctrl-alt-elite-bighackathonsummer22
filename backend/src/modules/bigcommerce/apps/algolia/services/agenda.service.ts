import { Agenda, Job } from 'agenda/dist';
import lodash from 'lodash';
import BigCommerce from 'node-bigcommerce';
import { convert as HtmlToText } from 'html-to-text';

import SettingService from './settings.service';
import AlgoliaWrapper from '../api/algolia/algolia-wrapper';
import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';
import algoliaSyncCacheModel from '@/apis/algolia/models/algolia-sync-cache.model';
import { AlgoliaSyncCache } from '@/apis/algolia/interfaces/algolia-sync-cache.interface';

// change soon
import { ProductDetail as BcProduct, Product as BcRawProduct } from '@/apis/bigcommerce/interfaces/products.interface';
import { Product as AlProduct } from '@/apis/algolia/interfaces/products.interface';

const eventType = {
  INSERT: 0,
  UPDATE: 1,
  REPLACE: 2,
  DELETE: -1,
};

class AgendaService {
  private settingService = new SettingService();

  private async createJob(every, name, data, options, agenda) {
    const job = agenda.create(name, data);
    job.unique({ 'data.settingId': data.settingId }).repeatEvery(every, options);

    return job.save();
  }

  private async getWrappers(settingId: any) {
    try {
      if (settingId) {
        const setting = await this.settingService.findSetting(settingId);

        const apikeys = {
          clientId: '1fctxoxgu7chx35bzs22rlzidi59k2j',
          accessToken: setting.bigcommerceStore.token, //'2hyzu3vad9h77int9gl9692p3t4g45i',
          responseType: 'json',
          storeHash: setting.bigcommerceStore.url,
          apiVersion: 'v3',
        };
        if (setting) {
          const ret = {
            algolia: new AlgoliaWrapper(),
            bigcommerce: new BigcommerceWrapper(),
          };

          await ret.algolia.init(setting._id);
          await ret.bigcommerce.initSync(apikeys);

          return ret;
        } else {
          throw new Error('setting not found');
        }
      } else {
        throw new Error('param setting is required');
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  public async initBigcommerceToAlgolia(job: Job, agenda: Agenda) {
    const { settingId } = job.attrs.data;

    const { bigcommerce } = await this.getWrappers(settingId);

    const bcProducts: BcRawProduct[] = await bigcommerce.getProducts('?include_fields=id');

    const commands = [];
    for (let xx = 0; xx < bcProducts.length; xx++) {
      const bcProduct = bcProducts[xx];

      commands.push(
        agenda.now('bigcommerce-to-algolia2', {
          settingId: settingId,
          type: 'store/product/created',
          productId: bcProduct.id,
        }),
      );
    }

    await Promise.all(commands);
    job.remove();
  }

  public async bigcommerceToAlgolia(job: Job, agenda: Agenda) {
    const { settingId, type, productId } = job.attrs.data;
    const { algolia, bigcommerce } = await this.getWrappers(settingId);

    const syncJobs = await agenda.jobs({ name: 'bigcommerce-to-algolia-sync2', 'data.settingId': settingId });
    const syncJob =
      syncJobs && syncJobs.length > 0
        ? syncJobs[0]
        : await this.createJob('1 hour', 'bigcommerce-to-algolia-sync2', { settingId }, { skipImmediate: true }, agenda);

    let bcProduct: BcProduct;
    let alProduct: any;

    switch (type) {
      case 'store/product/created':
        bcProduct = await bigcommerce.getProductDetail(productId);
        let customFields = {};

        bcProduct.customFields.forEach(ii => {
          customFields = {...customFields, [ii["name"]]: ii['value']}
        })

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
          ...customFields
        };

        await algoliaSyncCacheModel.create({
          appId: settingId,
          productId: productId,
          type: eventType.INSERT,
          data: alProduct,
        });

        await syncJob.run();

        break;
      case 'store/product/updated':
        bcProduct = await bigcommerce.getProductDetail(productId);
        const alProductCache = await algoliaSyncCacheModel.findOne({ appId: settingId, productId: productId });
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
                appId: settingId,
                productId: productId,
                type: eventType.UPDATE,
                data: newAlPartialProduct,
              });
            }
          } else if (new Date(bcProduct.updatedOn).toISOString() !== alProduct.updated_at.toISOString()) {
            await algoliaSyncCacheModel.deleteMany({
              appId: settingId,
              productId: productId,
            });

            await algoliaSyncCacheModel.create({
              appId: settingId,
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
            appId: settingId,
            productId: productId,
            type: eventType.INSERT,
            data: newAlProduct,
          });

          await syncJob.run();
        }
        break;
      case 'store/product/deleted':
        await algoliaSyncCacheModel.deleteMany({
          appId: settingId,
          productId: productId,
        });

        await algoliaSyncCacheModel.create({
          appId: settingId,
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
  }

  public async bigcommerceToAlgoliaSync(job: Job, agenda: Agenda) {
    const { settingId } = job.attrs.data;
    const { algolia } = await this.getWrappers(settingId);

    const cacheList = await algoliaSyncCacheModel.find({ appId: settingId });
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
  }
}

export default AgendaService;
