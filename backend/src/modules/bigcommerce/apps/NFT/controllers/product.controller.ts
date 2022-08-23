import { Request, Response, NextFunction } from 'express';
import AppService from '../services/apps.service';
import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';
import { Product as BigCommerceProduct } from '@/apis/bigcommerce/interfaces/products.interface';

class ProductController {
  static dataStore: any;
  private appService = new AppService();
  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const storeInfo = ProductController.dataStore;
    try {
      const body = req.body;
      await this.appService.init();
      const apps = await this.appService.findAllApps({ 'apiKey.storeHash': storeInfo.storeHash });
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(apps[0]._id);
      const productData: BigCommerceProduct = body;
      const products = await bigcommerceWrapper.createProduct(productData);

      res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  };

  public getProduct = async (req: Request, res: Response, next: NextFunction) => {
    const storeInfo = ProductController.dataStore;
    try {
      const { productId } = req.body;
      await this.appService.init();
      const apps = await this.appService.findAllApps({ 'apiKey.storeHash': storeInfo.storeHash });
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(apps[0]._id);

      const products = await bigcommerceWrapper.getProductWithCustomFields(productId);

      res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  };

  public createProductCategory = async (req: Request, res: Response, next: NextFunction) => {
    const storeInfo = ProductController.dataStore;
    try {
      await this.appService.init();
      const apps = await this.appService.findAllApps({ 'apiKey.storeHash': storeInfo.storeHash });
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(apps[0]._id);

      const NFTData = {
        parent_id: 0,
        name: 'NFT',
        description: '',
        views: 0,
        sort_order: 0,
        page_title: 'NFT',
        search_keywords: '',
        meta_keywords: [],
        meta_description: '',
        layout_file: 'category_with_facets.html',
        is_visible: true,
        default_product_sort: 'use_store_settings',
        image_url: '',
        custom_url: {
          url: '/NFT/',
          is_customized: true,
        },
      };

      const products = await bigcommerceWrapper.createNFTCategory(NFTData);

      res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  };

  public getProductCategory = async (req: Request, res: Response, next: NextFunction) => {
    const storeInfo = ProductController.dataStore;
    try {
      await this.appService.init();
      console.log(req.body);
      const apps = await this.appService.findAllApps({ 'apiKey.storeHash': storeInfo.storeHash });
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(apps[0]._id);

      const categoryNFT = await bigcommerceWrapper.getNFTCategory();

      res.status(200).json({ categoryNFT });
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const storeInfo = ProductController.dataStore;
    try {
      const { productId, params, walletAddress } = req.body;
      let products;
      await this.appService.init();
      const apps = await this.appService.findAllApps({ 'apiKey.storeHash': storeInfo.storeHash });
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(apps[0]._id);

      const bcProduct = await bigcommerceWrapper.getProductWithCustomFields(productId);
      if (params === 'hide') {
        products = await bigcommerceWrapper.updateProduct(productId, { ...bcProduct, is_visible: false });
      } else {
        products = await bigcommerceWrapper.updateProduct(productId, {
          ...bcProduct,
          availability: 'disabled',
          availability_description: walletAddress,
        });
      }

      res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;
