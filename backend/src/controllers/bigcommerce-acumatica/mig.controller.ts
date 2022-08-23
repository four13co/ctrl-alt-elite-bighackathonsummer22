import { NextFunction, Request, Response } from 'express';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { AppType } from '@/enums/app-type.enum';
import AcumaticaWrapper from '@/apis/acumatica/acumatica-wrapper';
import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';

class MIGController {
  public updatePrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = 'MIG';
      const mig: Organization = await organizationModel.findOne({ name: org }).populate('apps');
      const acumaticaWrapper = new AcumaticaWrapper();
      const bigcommerceWrapper = new BigcommerceWrapper();
      await acumaticaWrapper.init(mig.apps.find(ii => ii.type == AppType.Acumatica)._id);
      await bigcommerceWrapper.init(mig.apps.find(ii => ii.type == AppType.BigCommerce)._id);

      // REQUEST BODY
      const { sku, quantity, lineItemId, cartId, productId } = req.body;

      // temporary pricing
      let price = 100;
      switch (true) {
        case quantity <= 10:
          price = 1;
          break;
        case quantity <= 20:
          price = 2;
          break;
        case quantity <= 30:
          price = 3;
          break;
        case quantity <= 40:
          price = 4;
          break;
        case quantity <= 50:
          price = 5;
          break;
        default:
          price = 10;
          break;
      }

      const cartData = {
        line_item: {
          quantity: quantity,
          list_price: price,
          product_id: productId,
        },
      };

      const cart = await bigcommerceWrapper.updateCart(cartId, lineItemId, cartData);

      const params =
        '?$select=FinalCutHeight,FinalCutWidth,Height,InkType,IsArtworkCharge,ArtworkNotReadyFee,IsBarcodeOrSerial,IsDiecutRequired,IsPackagingHandlingFees,ItemInkType,ColorCount,OneTimePlateFree,OrderCostAdder1,OrderCostAdder2,OrderCostAdder3,Orientationofgraphic,PPAPCharge,PPUAdder1,PPUAdder2,PPUAdder3,Reimaginationofgraphic,Width';

      // const data = {
      //   entity: {
      //     id: '59aa0809-6ba0-ec11-b81f-00155d962e56',
      //   },
      // };

      // const price = await acumaticaWrapper.postMigPricing(data);

      return res.json({ message: 'success', cart });
    } catch (err) {
      next(err);
    }
  };

  public createCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = 'MIG';
      const mig: Organization = await organizationModel.findOne({ name: org }).populate('apps');
      const acumaticaWrapper = new AcumaticaWrapper();
      const bigcommerceWrapper = new BigcommerceWrapper();
      await acumaticaWrapper.init(mig.apps.find(ii => ii.type == AppType.Acumatica)._id);
      await bigcommerceWrapper.init(mig.apps.find(ii => ii.type == AppType.BigCommerce)._id);
    } catch (err) {
      next(err);
    }
  };

  public addLineItemCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = 'MIG';
      const mig: Organization = await organizationModel.findOne({ name: org }).populate('apps');
      const acumaticaWrapper = new AcumaticaWrapper();
      const bigcommerceWrapper = new BigcommerceWrapper();
      await acumaticaWrapper.init(mig.apps.find(ii => ii.type == AppType.Acumatica)._id);
      await bigcommerceWrapper.init(mig.apps.find(ii => ii.type == AppType.BigCommerce)._id);

      // Request body
      const { sku, quantity, cartId, productId } = req.body;

      // temporary pricing
      let price = 100;
      switch (true) {
        case quantity <= 10:
          price = 1;
          break;
        case quantity <= 20:
          price = 2;
          break;
        case quantity <= 30:
          price = 3;
          break;
        case quantity <= 40:
          price = 4;
          break;
        case quantity <= 50:
          price = 5;
          break;
        default:
          price = 10;
          break;
      }

      const cartData = {
        line_item: {
          quantity: quantity,
          list_price: price,
          product_id: productId,
        },
      };

      const cart = await bigcommerceWrapper.addCartLineItem(cartId, cartData);

      return res.json({ message: 'success', cart });
    } catch (err) {
      next(err);
    }
  };
}

export default MIGController;
