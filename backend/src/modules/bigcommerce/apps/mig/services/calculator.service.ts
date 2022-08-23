import AcumaticaWrapper from '@/apis/acumatica/acumatica-wrapper';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { AppType } from '@/enums/app-type.enum';
import BigcommerceWrapper from '@/apis/bigcommerce/bigcommerce-wrapper';
import ErrorHandle from '@utils/ErrorHandle';

class CalculatorService {
  public async calculatePrice(cartId, sku, quantity, productId, lineItemId): Promise<any> {
    const org = 'MIG';
    const defaultOrg: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    const urlParams = new URLSearchParams();
    urlParams.set(
      '$select',
      [
        'InventoryID',
        'FinalCutHeight',
        'FinalCutWidth',
        'Width',
        'Height',
        'ColorCount',
        'ItemInkType',
        'IsBarcodeOrSerial',
        'IsDieCutRequired',
        'IsItASet',
        'PricingInkType',
      ].join(','),
    );

    let product: any = [];
    try {
      product = await acumaticaWrapper.getProduct(`${sku}?${urlParams}`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }
    if (!product.InventoryID) {
      if (JSON.parse(product)) {
        throw new ErrorHandle(500, `api hit it's limit`);
      }
      throw new ErrorHandle(404, `product not found`);
    }

    const throwError = (key: any) => {
      throw new ErrorHandle(404, `${key} is not defined`);
    };

    product = {
      InventoryID: sku,
      OrderQuantity: quantity,
      CutHeight: product.FinalCutHeight.value || throwError('FinalCutHeight'),
      CutWidth: product.FinalCutWidth.value || throwError('FinalCutWidth'),
      PricingInkType: product.PricingInkType.value || throwError('PricingInkType'),
      Width: product.Width.value || throwError('Width'),
      Height: product.Height.value || throwError('Height'),
      ColorCount: product.ColorCount.value || throwError('ColorCount'),
      ItemInkType: product.ItemInkType.value || throwError('ItemInkType'),
      IsBarcodeOrSerial: product.IsBarcodeOrSerial.value || throwError('IsBarcodeOrSerial'),
      IsDiecutRequired: product.IsDiecutRequired.value || throwError('IsDieCutRequired'),
      IsitaSet: product.IsitaSet.value || throwError('IsItASet'),
    };

    const data = {
      sku,
      data: [product],
    };

    const result = await acumaticaWrapper.getMigItemPrice(data.sku, data.data);

    const price = result.find(p => p.InventoryID == sku);

    const cartData = {
      line_item: {
        quantity: quantity,
        list_price: Number(price.UnitPrice).toFixed(3),
        product_id: productId,
      },
    };
    const cart = await bigcommerceWrapper.updateCart(cartId, lineItemId, cartData);

    return cart;
  }

  public async getPrice(sku, quantity): Promise<any> {
    const org = 'MIG';
    const defaultOrg: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const urlParams = new URLSearchParams();
    urlParams.set(
      '$select',
      [
        'InventoryID',
        'FinalCutHeight',
        'FinalCutWidth',
        'Width',
        'Height',
        'ColorCount',
        'ItemInkType',
        'IsBarcodeOrSerial',
        'IsDieCutRequired',
        'IsItASet',
        'PricingInkType',
      ].join(','),
    );

    let product: any = [];
    try {
      product = await acumaticaWrapper.getProduct(`${sku}?${urlParams}`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }
    if (!product.InventoryID) {
      if (JSON.parse(product)) {
        throw new ErrorHandle(500, `api hit it's limit`);
      }
      throw new ErrorHandle(404, `product not found`);
    }

    const throwError = (key: any) => {
      throw new ErrorHandle(404, `${key} is not defined`);
    };
    console.log('ahaha');

    product = {
      InventoryID: sku,
      OrderQuantity: quantity,
      CutHeight: product.FinalCutHeight.value || throwError('FinalCutHeight'),
      CutWidth: product.FinalCutWidth.value || throwError('FinalCutWidth'),
      PricingInkType: product.PricingInkType.value || throwError('PricingInkType'),
      Width: product.Width.value || throwError('Width'),
      Height: product.Height.value || throwError('Height'),
      ColorCount: product.ColorCount.value || throwError('ColorCount'),
      ItemInkType: product.ItemInkType.value || throwError('ItemInkType'),
      IsBarcodeOrSerial: product.IsBarcodeOrSerial.value || throwError('IsBarcodeOrSerial'),
      IsDiecutRequired: product.IsDiecutRequired.value || throwError('IsDieCutRequired'),
      IsitaSet: product.IsitaSet.value || throwError('IsItASet'),
    };

    const data = {
      sku,
      data: [product],
    };

    const result = await acumaticaWrapper.getMigItemPrice(data.sku, data.data);

    const price = result.find(p => p.InventoryID == sku);

    return {
      InventoryID: sku,
      OrderQuantity: quantity,
      RoundedOrderQty: price.RoundedOrderQty,
      UnitPrice: price.UnitPrice,
      ExtPrice: price.ExtPrice,
    };
  }
}

export default CalculatorService;
