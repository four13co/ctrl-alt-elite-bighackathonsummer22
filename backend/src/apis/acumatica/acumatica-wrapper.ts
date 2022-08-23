import AcumaticaHelper from './acumatica-helper';
import { Product } from './interfaces/products.interface';
import { AxiosError } from 'axios';
import { ObjectId } from 'mongoose';
import { MigPricing } from './interfaces/migprice.interface';
import ErrorHandle from '@utils/ErrorHandle';
import { sleep } from '@utils/util';

class AcumaticaWrapper extends AcumaticaHelper {
  private products: Product[];

  public async init(appId: ObjectId): Promise<void> {
    await this.initHelper(appId);
  }

  public async getProduct(id: string, params: object = {}): Promise<any> {
    return this.http.get(this.formatUrl('/StockItem/') + id, params, this.config).then((data: any) => {
      return data.data;
    });
  }

  public async getFile(id: string): Promise<any> {
    return this.http.get(this.formatUrl('/files/') + id, this.config).then((data: any) => {
      return data.data;
    });
  }
  public async getCategory(params = ''): Promise<any> {
    return this.http.get(this.formatUrl('/ItemSalesCategory' + params), this.config).then((data: any) => {
      return data.data;
    });
  }

  public async UpdateProduct(params: object = {}): Promise<any> {
    return this.http.put(this.formatUrl('/StockItem'), params, this.config).then((data: any) => {
      return data.data;
    });
  }

  public async getProducts(params = ''): Promise<any> {
    return this.http
      .get(this.formatUrl('/StockItem' + params), this.config)
      .then((data: any) => {
        return data.data;
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        return err.response;
      });
  }

  public async getProductSalesPriceDetails(id: string): Promise<any> {
    return this.http
      .put(
        this.formatUrl('/SalesPricesInquiry?$expand=SalesPriceDetails'),
        {
          InventoryID: {
            value: id,
          },
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async logoutAcumaticaUser(): Promise<any> {
    return this.http.post(this.formatUrl('/auth/logout'), this.config).then((data: any) => {
      return data;
    });
  }

  public async loginAcumaticaUser(): Promise<any> {
    return this.http
      .post(
        this.formatUrl('/auth/login'),
        {
          data: {
            name: 'Devleads@four13.co',
            password: 'Four13dev',
            company: 'Test Company',
          },
        },
        this.config,
      )
      .then((data: any) => {
        return data;
      });
  }

  public async getCustomer(params): Promise<any> {
    return this.http
      .get(
        this.formatUrl('/Customer'),
        {
          params: { ...params },
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async createOrder(data): Promise<any> {
    return this.http
      .put(
        this.formatUrl('/SalesOrder'),
        {
          ...data,
        },
        this.config,
      )
      .then((data: any) => {
        return data;
      });
  }

  public async updateOrder(data): Promise<any> {
    return this.http
      .put(
        this.formatUrl('/SalesOrder'),
        {
          ...data,
        },
        this.config,
      )
      .then((data: any) => {
        return data;
      });
  }

  public async getSalesOrderByParams(params: object = {}): Promise<any> {
    return this.http.get(this.formatUrl('/SalesOrder'), params, this.config).then((data: any) => {
      return data.data;
    });
  }

  public async getSalesOrdersByFilter(filter: string, expand = 'Details'): Promise<any> {
    return this.http
      .get(
        this.formatUrl('/SalesOrder'),
        {
          params: {
            $filter: filter,
            $expand: `${expand}`,
          },
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async getSalesOrder(externalRef, expand = 'Details'): Promise<any> {
    return this.http
      .get(
        this.formatUrl('/SalesOrder'),
        {
          params: {
            $filter: `ExternalRef eq '${externalRef}'`,
            $expand: `${expand}`,
          },
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async getSalesOrderPayment(id: any): Promise<any> {
    return this.http
      .get(
        this.formatUrl(`/SalesOrder/SO/${id}`),
        {
          params: {
            $expand: `Payments`,
          },
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async getDiscountCodesByFilter(filter: string): Promise<any> {
    return this.http
      .get(
        this.formatUrl('/DiscountCode'),
        {
          params: {
            $filter: filter,
          },
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async getPurchaseOrders(): Promise<any> {
    return this.http
      .get(this.formatUrl('/purchaseorder/'), this.config)
      .then((data: any) => {
        return data.data;
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        return err.response;
      });
  }

  public async getProductAttributes(id: string): Promise<any> {
    const urlParams = `${id}?$expand=attributes&$select=InventoryID,Attributes/AttributeID,Attributes/Value`;

    return this.http.get(this.formatUrl('/StockItem/') + urlParams, this.config).then((data: any) => {
      return data.data;
    });
  }

  public async createCustomer(data): Promise<any> {
    return this.http
      .put(this.formatUrl('/Customer'), {
        ...data,
      })
      .then((data: any) => {
        return data.data;
      });
  }

  public async postMigPricing(data: any): Promise<any> {
    const url = `/opportunity/recalculatePrice`;

    return this.http
      .post(
        this.formatUrl(url),
        {
          ...data,
        },
        this.config,
      )
      .then((data: any) => {
        return data.data;
      });
  }

  public async getMigItemPrice(cartId: string, data: MigPricing[]): Promise<MigPricing[]> {
    const url = `/opportunity`;
    let createResult: any = {};
    const MAXCOUNT = 3;
    let count = 1;
    while (true) {
      console.log(`recalculating price : attempt -> ${count}`);
      try {
        const createData = {
          Subject: { value: `Estimation for sku: ${cartId}` },
        };
        console.log('creating opportunity');
        createResult = await this.http.put(this.formatUrl(`${url}`), createData);
        console.log('successfully created opportunity');

        const modifyData = {
          entity: {
            id: createResult.data.id,
            PricingVolumeDiscount: data.map(ii => {
              const ret = {};

              const keys = Object.keys(ii);

              keys.forEach(iii => {
                ret[iii] = { value: ii[iii] };
              });

              return ret;
            }),
          },
        };

        console.log(`recalculating price`);
        await await this.http.post(this.formatUrl(`${url}/recalculatePrice`), modifyData);
        console.log('successfully recalculated the price');

        console.log('getting the price');
        const selectResult = await this.http.get(this.formatUrl(`${url}/${createResult.data.id}?$expand=PricingVolumeDiscount`));
        console.log('successfully gotten the price');

        // this.http.delete(this.formatUrl(`${url}/${createResult.data.id}`));

        const ret = selectResult.data.PricingVolumeDiscount.map(ii => ({
          InventoryID: ii.InventoryID.value,
          OrderQuantity: ii.OrderQuantity.value,
          RoundedOrderQty: ii.RoundedOrderQty.value,
          Discount: ii.Discount.value,
          UnitPrice: ii.UnitPrice.value,
          ExtPrice: ii.ExtPrice.value,
        }));

        return ret;
      } catch (err) {
        if (count === MAXCOUNT) {
          if (err.response) {
            throw new ErrorHandle(err.response.status, 'unable to recalculate price', err.response.statusText, err.response.data);
          } else {
            throw new ErrorHandle(500, 'unable to recalculate price', 'internal server error', err);
          }
        }
        const rndInt = Math.floor(Math.random() * 5000) + 1000;
        await sleep(rndInt);
        count++;
      } finally {
        if (createResult.data) {
          console.log('deleting opportunity');
          this.http.delete(this.formatUrl(`${url}/${createResult.data.id}`));
        } else {
          console.log('no recalcation price happen and no opportunity created ');
        }
      }
    }
  }
  public async recalculatePrice(data: any, url: string): Promise<any> {
    const MAXCOUNT = 3;
    let count = 0;
    let sleepcount = 1000;
    while (true) {
      console.log(`recalculating price : attempt -> ${count}`);
      try {
        await this.http.post(this.formatUrl(`${url}/recalculatePrice`), data);
        break;
      } catch (err) {
        if (count === MAXCOUNT) {
          throw new ErrorHandle(err.response.status, 'unable to recalculate price', err.response.statusText, err.response.data);
        }
      }
      await sleep(sleepcount);
      sleepcount += 1000;
      count++;
    }
  }

  public async calculateMigPrice(inventoryId: string, quantity: number): Promise<any> {
    const urlParams = new URLSearchParams();
    urlParams.set(
      '$custom',
      [
        'INSetup.UsrMIGHeightUp1',
        'INSetup.UsrMIGWidthUp1',
        'INSetup.UsrMIGHeightUp2',
        'INSetup.UsrMIGWidthUp2',
        'INSetup.UsrMIGCostFactor',
        'INSetup.UsrLgShtModCC1',
        'INSetup.UsrLgShtModCC2',
        'INSetup.UsrLgShtModCC3',
        'INSetup.UsrLgShtModCC4',
        'INSetup.UsrLgShtModCC5',
        'INSetup.UsrLgShtModCC6',
        'INSetup.UsrLgShtModCC7',
        'INSetup.UsrLgShtModCC8',
        'INSetup.UsrLgShtModCC9',
        'INSetup.UsrLgShtModCC10',
        'INSetup.UsrMIGStrokesPerHr',
        'INSetup.UsrMIGInkTypeModifier',
        'INSetup.UsrBarcode',
        'INSetup.UsrDiecut',
        'INSetup.UsrPackagingFees',
        'INSetup.UsrPPUAdder1',
        'INSetup.UsrPPUAdder2',
        'INSetup.UsrPPUAdder3',
        'INSetup.UsrOrderCostAdder1',
        'INSetup.UsrOrderCostAdder2',
        'INSetup.UsrOrderCostAdder3',
        'INSetup.UsrMIGMarkupPct',
        'INSetup.UsrPGCHeightUp1',
        'INSetup.UsrPGCWidthUp1',
        'INSetup.UsrPGCHeightUp2',
        'INSetup.UsrPGCWidthUp2',
        'INSetup.UsrPGCStrokesPerHr',
        'INSetup.UsrPGCInkTypeModifier',
        'INSetup.UsrPGCCostFactor',
        'INSetup.UsrPGCMarkupPct',
      ].join(','),
    );

    const stockItemResult = await this.http.get(this.formatUrl(`/StockItem/${inventoryId}?${urlParams.toString()}`));
    const inventory = stockItemResult.data;

    const throwError = (key: string) => {
      throw new Error(key + ' is not defined');
    };

    const convertInkType = (value: any) => {
      if (!value) return null;
      if (value.toUpperCase().includes('MIG')) return 'MIG';
      if (value.toUpperCase().includes('MOM')) return 'MOM';
      if (value.toUpperCase().includes('POLY')) return 'POLY';
      if (value.toUpperCase().includes('PGC')) return 'POLY';
    };

    const row = {
      InkType: convertInkType(inventory.ItemInkType.value) || throwError('ItemInkType'),
      ColorCount: inventory.ColorCount.value || throwError('ColorCount'),
      FinalCutHeight: inventory.FinalCutHeight.value || throwError('FinalCutHeight'),
      FinalCutWidth: inventory.FinalCutWidth.value || throwError('FinalCutWidth'),
      QTUserQuantity: quantity,
      UnitPrice: 0,
      QTTotalAmount: 0,
    };
    const rowExt = {
      UsrCIsBarCodeOrSerial: inventory.IsBarcodeOrSerial.value || '',
      UsrCIsDieCutRequired: inventory.IsDieCutRequired.value || '',
      UsrCIsPckgOrHandlingFees: inventory.IsItASet.value || '',
      UsrCPPUAdder1: 'Y',
      UsrCPPUAdder2: 'Y',
      UsrCPPUAdder3: 'Y',
      UsrCOrderCostAdder1: 'Y',
      UsrCOrderCostAdder2: 'Y',
      UsrCOrderCostAdder3: 'Y',
      UsrVal1: 0,
      UsrVal2: 0,
      UsrVal3: 0,
      UsrVal4: 0,
      UsrMaxUp1: 0,
      UsrMaxUp2: 0,
      UsrNumberUp: 0,
      UsrNumOfSheets: 0,
      UsrGraphicsPerHour: 0,
      UsrHoursPerColorRun: 0,
      UsrOperatorTime: null,
      UsrSetupTime: null,
      UsrTotalJobTime: null,
      UsrCostingTime: null,
      UsrPricePerUnitAdder: 0,
      UsrOrdercostAdder: 0,
    };
    const prefExt = {
      UsrMIGHeightUp1: inventory.custom.INSetup.UsrMIGHeightUp1.value || throwError('UsrMIGHeightUp1'),
      UsrMIGWidthUp1: inventory.custom.INSetup.UsrMIGWidthUp1.value || throwError('UsrMIGWidthUp1'),
      UsrMIGHeightUp2: inventory.custom.INSetup.UsrMIGHeightUp2.value || throwError('UsrMIGHeightUp2'),
      UsrMIGWidthUp2: inventory.custom.INSetup.UsrMIGWidthUp2.value || throwError('UsrMIGWidthUp2'),
      UsrMIGCostFactor: inventory.custom.INSetup.UsrMIGCostFactor.value || throwError('UsrMIGCostFactor'),
      UsrLgShtModCC1: inventory.custom.INSetup.UsrLgShtModCC1.value || throwError('UsrLgShtModCC1'),
      UsrLgShtModCC2: inventory.custom.INSetup.UsrLgShtModCC2.value || throwError('UsrLgShtModCC2'),
      UsrLgShtModCC3: inventory.custom.INSetup.UsrLgShtModCC3.value || throwError('UsrLgShtModCC3'),
      UsrLgShtModCC4: inventory.custom.INSetup.UsrLgShtModCC4.value || throwError('UsrLgShtModCC4'),
      UsrLgShtModCC5: inventory.custom.INSetup.UsrLgShtModCC5.value || throwError('UsrLgShtModCC5'),
      UsrLgShtModCC6: inventory.custom.INSetup.UsrLgShtModCC6.value || throwError('UsrLgShtModCC6'),
      UsrLgShtModCC7: inventory.custom.INSetup.UsrLgShtModCC7.value || throwError('UsrLgShtModCC7'),
      UsrLgShtModCC8: inventory.custom.INSetup.UsrLgShtModCC8.value || throwError('UsrLgShtModCC8'),
      UsrLgShtModCC9: inventory.custom.INSetup.UsrLgShtModCC9.value || throwError('UsrLgShtModCC9'),
      UsrLgShtModCC10: inventory.custom.INSetup.UsrLgShtModCC10.value || throwError('UsrLgShtModCC10'),
      UsrMIGStrokesPerHr: inventory.custom.INSetup.UsrMIGStrokesPerHr.value || throwError('UsrMIGStrokesPerHr'),
      UsrMIGInkTypeModifier: inventory.custom.INSetup.UsrMIGInkTypeModifier.value || throwError('UsrMIGInkTypeModifier'),
      UsrBarcode: inventory.custom.INSetup.UsrBarcode.value || 0,
      UsrDiecut: inventory.custom.INSetup.UsrDiecut.value || 0,
      UsrPackagingFees: inventory.custom.INSetup.UsrPackagingFees.value || 0,
      UsrPPUAdder1: inventory.custom.INSetup.UsrPPUAdder1.value || 0,
      UsrPPUAdder2: inventory.custom.INSetup.UsrPPUAdder2.value || 0,
      UsrPPUAdder3: inventory.custom.INSetup.UsrPPUAdder3.value || 0,
      UsrOrderCostAdder1: inventory.custom.INSetup.UsrOrderCostAdder1.value || 0,
      UsrOrderCostAdder2: inventory.custom.INSetup.UsrOrderCostAdder2.value || 0,
      UsrOrderCostAdder3: inventory.custom.INSetup.UsrOrderCostAdder3.value || 0,
      UsrMIGMarkupPct: inventory.custom.INSetup.UsrMIGMarkupPct.value || throwError('UsrMIGMarkupPct'),
      UsrPGCHeightUp1: inventory.custom.INSetup.UsrPGCHeightUp1.value || throwError('UsrPGCHeightUp1'),
      UsrPGCWidthUp1: inventory.custom.INSetup.UsrPGCWidthUp1.value || throwError('UsrPGCWidthUp1'),
      UsrPGCHeightUp2: inventory.custom.INSetup.UsrPGCHeightUp2.value || throwError('UsrPGCHeightUp2'),
      UsrPGCWidthUp2: inventory.custom.INSetup.UsrPGCWidthUp2.value || throwError('UsrPGCWidthUp2'),
      UsrPGCStrokesPerHr: inventory.custom.INSetup.UsrPGCStrokesPerHr.value || throwError('UsrPGCStrokesPerHr'),
      UsrPGCInkTypeModifier: inventory.custom.INSetup.UsrPGCInkTypeModifier.value || throwError('UsrPGCInkTypeModifier'),
      UsrPGCCostFactor: inventory.custom.INSetup.UsrPGCCostFactor.value || throwError('UsrPGCCostFactor'),
      UsrPGCMarkupPct: inventory.custom.INSetup.UsrPGCMarkupPct.value || throwError('UsrPGCMarkupPct'),
    };

    // FROM C# Code Copy + Paste Here
    if (row.InkType == 'MIG' || row.InkType == 'MOM') {
      // Pricing Ink Type - MIG = MIG5 & MOM = Mold On
      const colorCount = row.InkType == 'MIG' ? row.ColorCount : row.ColorCount + 1;
      const pricingHeight = row.FinalCutHeight;
      const pricingWidth = row.FinalCutWidth;

      const val1 =
        Math.floor(parseFloat(prefExt.UsrMIGHeightUp1) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrMIGWidthUp1) / parseFloat(pricingWidth));
      const val2 =
        Math.floor(parseFloat(prefExt.UsrMIGWidthUp1) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrMIGHeightUp1) / parseFloat(pricingWidth));
      const maxUp1 = Math.max(val1, val2) > 30 ? 30 : Math.max(val1, val2);

      const val3 =
        Math.floor(parseFloat(prefExt.UsrMIGHeightUp2) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrMIGWidthUp2) / parseFloat(pricingWidth));
      const val4 =
        Math.floor(parseFloat(prefExt.UsrMIGWidthUp2) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrMIGHeightUp2) / parseFloat(pricingWidth));
      const maxUp2 = Math.max(val3, val4) > 30 ? 30 : Math.max(val3, val4);

      const calculatedUp = maxUp1 == 0 ? maxUp2 : maxUp1;

      let MIGCostFactor = 0;
      if (maxUp1 == 0 && maxUp2 == 1) {
        switch (colorCount) {
          case 1:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC1);
            break;
          case 2:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC2);
            break;
          case 3:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC3);
            break;
          case 4:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC4);
            break;
          case 5:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC5);
            break;
          case 6:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC6);
            break;
          case 7:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC7);
            break;
          case 8:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC8);
            break;
          case 9:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC9);
            break;
          case 10:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor) * parseFloat(prefExt.UsrLgShtModCC10);
            break;
          default:
            MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor);
            break;
        }
      } else {
        MIGCostFactor = parseFloat(prefExt.UsrMIGCostFactor);
      }

      const numOfSheets = row.QTUserQuantity / calculatedUp;
      const graphicsPerHour = prefExt.UsrMIGStrokesPerHr * calculatedUp;
      const hoursPerColorRun = row.QTUserQuantity / graphicsPerHour;

      const operatorTime = colorCount * hoursPerColorRun;
      const setupTime = colorCount * prefExt.UsrMIGInkTypeModifier;
      const totalJobTime = operatorTime + setupTime;
      const costingTime = totalJobTime < 1 ? 1 : totalJobTime;

      const pricePerUnitAdder =
        (rowExt.UsrCIsBarCodeOrSerial == 'Y' ? prefExt.UsrBarcode : 0) +
        (rowExt.UsrCIsDieCutRequired == 'Y' ? prefExt.UsrDiecut : 0) +
        (rowExt.UsrCIsPckgOrHandlingFees == 'Y' ? prefExt.UsrPackagingFees : 0);

      const orderCostAdder =
        (rowExt.UsrCPPUAdder1 == 'Y' ? prefExt.UsrPPUAdder1 : 0) +
        (rowExt.UsrCPPUAdder2 == 'Y' ? prefExt.UsrPPUAdder2 : 0) +
        (rowExt.UsrCPPUAdder3 == 'Y' ? prefExt.UsrPPUAdder3 : 0) +
        (rowExt.UsrCOrderCostAdder1 == 'Y' ? prefExt.UsrOrderCostAdder1 : 0) +
        (rowExt.UsrCOrderCostAdder2 == 'Y' ? prefExt.UsrOrderCostAdder2 : 0) +
        (rowExt.UsrCOrderCostAdder3 == 'Y' ? prefExt.UsrOrderCostAdder3 : 0);

      const unitPrice = (costingTime * MIGCostFactor * prefExt.UsrMIGMarkupPct) / row.QTUserQuantity + pricePerUnitAdder;
      const totalOrderPrice = unitPrice * row.QTUserQuantity + orderCostAdder;

      rowExt.UsrVal1 = val1;
      rowExt.UsrVal2 = val2;
      rowExt.UsrVal3 = val3;
      rowExt.UsrVal4 = val4;
      rowExt.UsrMaxUp1 = maxUp1;
      rowExt.UsrMaxUp2 = maxUp2;

      rowExt.UsrNumberUp = calculatedUp;
      rowExt.UsrNumOfSheets = numOfSheets;
      rowExt.UsrGraphicsPerHour = graphicsPerHour;
      rowExt.UsrHoursPerColorRun = hoursPerColorRun;
      rowExt.UsrOperatorTime = operatorTime;
      rowExt.UsrSetupTime = setupTime;
      rowExt.UsrTotalJobTime = totalJobTime;
      rowExt.UsrCostingTime = costingTime;
      rowExt.UsrPricePerUnitAdder = pricePerUnitAdder;
      rowExt.UsrOrdercostAdder = orderCostAdder;
      row.UnitPrice = unitPrice;
      row.QTTotalAmount = totalOrderPrice;

      //PriceCalculator.Cache.Update(row);
      //Base.Save.Press();
    } else if (row.InkType == 'POLY') {
      //Pricing Ink Type - PGC = Polyfuze
      const colorCount = row.ColorCount;
      const pricingHeight = row.FinalCutHeight + 1;
      const pricingWidth = row.FinalCutWidth + 1.5;

      const val1 =
        Math.floor(parseFloat(prefExt.UsrPGCHeightUp1) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrPGCWidthUp1) / parseFloat(pricingWidth));
      const val2 =
        Math.floor(parseFloat(prefExt.UsrPGCWidthUp1) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrPGCHeightUp1) / parseFloat(pricingWidth));
      const maxUp1 = Math.max(val1, val2) > 30 ? 30 : Math.max(val1, val2);

      const val3 =
        Math.floor(parseFloat(prefExt.UsrPGCHeightUp2) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrPGCWidthUp2) / parseFloat(pricingWidth));
      const val4 =
        Math.floor(parseFloat(prefExt.UsrPGCWidthUp2) / parseFloat(pricingHeight)) *
        Math.floor(parseFloat(prefExt.UsrPGCHeightUp2) / parseFloat(pricingWidth));
      const maxUp2 = Math.max(val3, val4) > 30 ? 30 : Math.max(val3, val4);

      const calculatedUp = maxUp1 == 0 ? maxUp2 : maxUp1;

      const numOfSheets = row.QTUserQuantity / calculatedUp;
      const graphicsPerHour = prefExt.UsrPGCStrokesPerHr * calculatedUp;
      const hoursPerColorRun = row.QTUserQuantity / graphicsPerHour;

      const operatorTime = Math.round(row.ColorCount / 2 + 0.5) * hoursPerColorRun;
      const setupTime = colorCount * prefExt.UsrPGCInkTypeModifier;
      const totalJobTime = operatorTime + setupTime;
      const costingTime = totalJobTime < 1 ? 1 : totalJobTime;

      const pricePerUnitAdder =
        (rowExt.UsrCIsBarCodeOrSerial == 'Y' ? prefExt.UsrBarcode / 2 : 0) +
        (rowExt.UsrCIsDieCutRequired == 'Y' ? prefExt.UsrDiecut * 0 : 0) +
        (rowExt.UsrCIsPckgOrHandlingFees == 'Y' ? prefExt.UsrPackagingFees : 0);

      const orderCostAdder =
        (rowExt.UsrCPPUAdder1 == 'Y' ? prefExt.UsrPPUAdder1 : 0) +
        (rowExt.UsrCPPUAdder2 == 'Y' ? prefExt.UsrPPUAdder2 : 0) +
        (rowExt.UsrCPPUAdder3 == 'Y' ? prefExt.UsrPPUAdder3 : 0) +
        (rowExt.UsrCOrderCostAdder1 == 'Y' ? prefExt.UsrOrderCostAdder1 : 0) +
        (rowExt.UsrCOrderCostAdder2 == 'Y' ? prefExt.UsrOrderCostAdder2 : 0) +
        (rowExt.UsrCOrderCostAdder3 == 'Y' ? prefExt.UsrOrderCostAdder3 : 0);

      const unitPrice = (costingTime * prefExt.UsrPGCCostFactor * prefExt.UsrPGCMarkupPct) / row.QTUserQuantity + pricePerUnitAdder;
      const totalOrderPrice = unitPrice * row.QTUserQuantity + orderCostAdder;

      rowExt.UsrVal1 = val1;
      rowExt.UsrVal2 = val2;
      rowExt.UsrVal3 = val3;
      rowExt.UsrVal4 = val4;
      rowExt.UsrMaxUp1 = maxUp1;
      rowExt.UsrMaxUp2 = maxUp2;

      rowExt.UsrNumberUp = calculatedUp;
      rowExt.UsrNumOfSheets = numOfSheets;
      rowExt.UsrGraphicsPerHour = graphicsPerHour;
      rowExt.UsrHoursPerColorRun = hoursPerColorRun;
      rowExt.UsrOperatorTime = operatorTime;
      rowExt.UsrSetupTime = setupTime;
      rowExt.UsrTotalJobTime = totalJobTime;
      rowExt.UsrCostingTime = costingTime;
      rowExt.UsrPricePerUnitAdder = pricePerUnitAdder;
      rowExt.UsrOrdercostAdder = orderCostAdder;
      row.UnitPrice = unitPrice;
      row.QTTotalAmount = totalOrderPrice;
    }

    return { ...row, ...rowExt };
  }

  public async calculateMigPrices(cartId: string, data: MigPricing[]): Promise<MigPricing[]> {
    const ret = [];

    console.log(`Estimation for Bigcommerce cart ${cartId}`);
    for (let xx = 0; xx < data.length; xx++) {
      const dataItem = data[xx];
      const item = await this.calculateMigPrice(dataItem.InventoryID, dataItem.OrderQuantity);

      ret.push({
        InventoryID: dataItem.InventoryID,
        OrderQuantity: dataItem.OrderQuantity,
        RoundedOrderQty: Math.ceil(item.UsrNumberUp * item.UsrNumOfSheets),
        Discount: item.UsrMaxUp2,
        UnitPrice: Math.round((item.UnitPrice + Number.EPSILON) * 100) / 100,
        ExtPrice: Math.round((item.QTTotalAmount + Number.EPSILON) * 100) / 100,
      });
    }

    return ret;
  }
}

export default AcumaticaWrapper;
