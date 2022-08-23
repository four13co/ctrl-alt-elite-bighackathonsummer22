import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import { Product } from '@apis/bigcommerce/interfaces/products.interface';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { AppType } from '@/enums/app-type.enum';
import { BigCommerceAcumaticaType } from '@/enums/bigcommerce-acumatica-type.enum';
import { ProductOption } from '@/apis/bigcommerce/interfaces/product-options.interface';
import { Variant } from '@/apis/bigcommerce/interfaces/variant.interface';
import { OptionValue } from '@/apis/bigcommerce/interfaces/option-value.interface';
import { logger } from '@utils/logger';
import moment from 'moment';

class BigcommerceAcumaticaService {
  private variantSep = ':';

  /**
   * Format BC Variant Sku
   *
   * @param {any} price AC Sales Price object
   */
  private formatVariantSku(price) {
    return `${price.InventoryID.value}${this.variantSep}${price.UOM.value.replace(/ /g, '_')}`;
  }

  /**
   * Get UOM Weight
   *
   * @param {any} product BC product object
   * @param {any} conversion AC conversion object
   */
  private getUOMWeight(product, conversion) {
    if (!conversion || conversion.FromUOM.value.toLowerCase().includes('each') || conversion.FromUOM.value.toLowerCase() == 'ea') {
      return product.DimensionWeight.value.toFixed(2);
    } else {
      return (product.DimensionWeight.value * (conversion ? conversion.ConversionFactor.value : 0)).toFixed(2);
    }
  }

  private prepareCrossReferences(product, variants: Variant[]) {
    if (product.UOMConversions !== undefined) delete product.UOMConversions;
    // [UOM, AlternateID]
    let newCrossReferences: object[] = [];
    if (product.CrossReferences !== undefined && product.CrossReferences.length) {
      for (let a = 0; a < product.CrossReferences.length; a++) {
        const c = product.CrossReferences[a];
        if (c.AlternateType.value == 'Global') {
          if (c.AlternateID.value.includes(':') && c.Description.value == 'Bigcommerce Variant SKU') {
            newCrossReferences.push({ id: c.id, delete: true });
          }
        }
      }
    }

    const arr = [];
    for (let a = 0; a < variants.length; a++) {
      const e = variants[a];
      if (e.sku.includes(this.variantSep)) {
        arr.push({
          AlternateID: {
            value: e.sku,
          },
          AlternateType: {
            value: 'Global',
          },
          Description: {
            value: 'Bigcommerce Variant SKU',
          },
          VendorOrCustomer: {},
          UOM: {
            value: e.sku.split(this.variantSep).pop().replace(/_/g, ' '),
          },
          custom: {},
        });
      }
    }
    newCrossReferences = [...newCrossReferences, ...arr];

    console.log(`newCrossReferences: `, newCrossReferences);
    if (newCrossReferences.length) product.CrossReferences = newCrossReferences;

    return product;
  }

  /**
   * Sync AC Sales Prices to BC Variants
   *
   * @param {string} org Tranzetta Org unique name
   * @param {Product} result BC Product
   * @param {string} productSku BC Product Sku
   * @param {string} variantSku BC Variant Sku
   */
  public async syncSalesPrice(org: string, result: Product, productSku: string, variantSku: string = null): Promise<void> {
    const medex: Organization = await organizationModel.findOne({ name: org }).populate('apps');
    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(medex.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    logger.info(`${medex.name} UOM: Start Sync - ${variantSku ? variantSku : productSku}`);
    // test manual salesPrice
    // let salePrice: any =
    //   '{"id":"f49d5f0e-6579-4dd0-8731-11c0648d9c6f","rowNumber":1,"note":null,"EffectiveAsOf":{},"InventoryID":{"value":"ZVX-PCK3001"},"ItemClassID":{},"PriceClass":{},"PriceCode":{},"PriceManager":{},"PriceManagerIsMe":{"value":false},"PriceType":{"value":"All Prices"},"PriceWorkgroup":{},"PriceWorkgroupIsMine":{"value":false},"SalesPriceDetails":[{"id":"7c117a3e-c013-ec11-8187-0a873c70f716","rowNumber":1,"note":{"value":""},"BreakQty":{"value":0},"CreatedDateTime":{"value":"2021-09-12T11:55:51.253+00:00"},"Description":{"value":"Moog Infinity Fanny Pack"},"EffectiveDate":{"value":"2021-09-12T00:00:00+00:00"},"ExpirationDate":{},"InventoryID":{"value":"ZVX-PCK3001"},"LastModifiedDateTime":{"value":"2021-09-12T11:55:51.253+00:00"},"NoteID":{"value":"7c117a3e-c013-ec11-8187-0a873c70f716"},"Price":{"value":160},"PriceCode":{},"PriceType":{"value":"Base"},"Promotion":{"value":false},"RecordID":{"value":4908},"Tax":{},"UOM":{"value":"1 BOX"},"Warehouse":{},"custom":{}},{"id":"7c117a3e-c013-ec11-8187-0a873c70f716","rowNumber":1,"note":{"value":""},"BreakQty":{"value":0},"CreatedDateTime":{"value":"2021-09-12T11:55:51.253+00:00"},"Description":{"value":"Moog Infinity Fanny Pack"},"EffectiveDate":{"value":"2021-09-12T00:00:00+00:00"},"ExpirationDate":{},"InventoryID":{"value":"ZVX-PCK3001"},"LastModifiedDateTime":{"value":"2021-09-12T11:55:51.253+00:00"},"NoteID":{"value":"7c117a3e-c013-ec11-8187-0a873c70f716"},"Price":{"value":100},"PriceCode":{},"PriceType":{"value":"Base"},"Promotion":{"value":false},"RecordID":{"value":4908},"Tax":{},"UOM":{"value":"1 DOZE"},"Warehouse":{},"custom":{}}],"custom":{}}';
    // salePrice = JSON.parse(salePrice);

    const product = await acumaticaWrapper.getProduct(variantSku ? variantSku : productSku, {
      params: { $expand: 'UOMConversions,CrossReferences' },
    });

    const salePrice = await acumaticaWrapper.getProductSalesPriceDetails(variantSku ? variantSku : productSku);

    logger.info(`${medex.name} UOM: Fetched Sale Prices`);

    const variants = salePrice.SalesPriceDetails.map(salePrice => {
      return salePrice.UOM.value;
    });

    const bcProduct = await bigcommerceWrapper.getProductBySku(productSku);
    const variations: Variant[] = await bigcommerceWrapper.getProductVariants(result.id);
    const options: ProductOption[] = await bigcommerceWrapper.getProductOptions(result.id);
    let uom: ProductOption = options.find(e => e.display_name === BigCommerceAcumaticaType.UOMDisplayName);
    let uomExists = false;
    if (variantSku && variations.length && variations[0].option_values.length > 1) {
      // logic for matrix item
      const clearVariations: Variant[] = variations.filter(e => {
        return (
          e.sku.toLowerCase().startsWith(variantSku.toLowerCase()) || e.sku.toLowerCase().startsWith(variantSku.replace(/_/g, ' ').toLowerCase())
        );
      });

      logger.info(`${medex.name} UOM: Deleting Multi UOM Variants`);
      for (let a = 0; a < clearVariations.length; a++) {
        await bigcommerceWrapper.deleteProductVariant(result.id, clearVariations[a].id);
      }

      if (salePrice.SalesPriceDetails.length) {
        if (!uom) {
          const productOption: ProductOption = {
            product_id: result.id,
            display_name: BigCommerceAcumaticaType.UOMDisplayName,
            type: 'rectangles',
            sort_order: 100,
            option_values: salePrice.SalesPriceDetails.map((price, index) => {
              return {
                is_default: price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea' ? true : false,
                label: price.UOM.value,
                sort_order: price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea' ? 0 : (index + 1) * 10,
              };
            }),
          };
          uom = await bigcommerceWrapper.createProductOption(result.id, productOption);
          logger.info(`${medex.name} UOM: Created UOM`);
        } else {
          uomExists = true;

          // Delete unused Product Option
          const usedOptions = [];
          for (let a = 0; a < variations.length; a++) {
            const varOptions = variations[a].option_values;
            const uom = varOptions.find(e => e.option_display_name == BigCommerceAcumaticaType.UOMDisplayName);
            if (uom) {
              if (!usedOptions.includes(uom.label)) {
                usedOptions.push(uom.label);
              }
            }
          }

          if (usedOptions.length) {
            const uomOptions = options.find(e => e.display_name == BigCommerceAcumaticaType.UOMDisplayName);
            if (uomOptions) {
              const option_values = uomOptions.option_values;
              for (let a = 0; a < option_values.length; a++) {
                if (!usedOptions.includes(option_values[a].label)) {
                  await bigcommerceWrapper.deleteOptionValue(result.id, uomOptions.id, option_values[a].id);
                  logger.info(`${medex.name} UOM: Deleted Option ${uom.option_values[a].label}`);
                }
              }
            }
          }
        }

        if (clearVariations.length) {
          // Create variations
          for (let a = 0; a < salePrice.SalesPriceDetails.length; a++) {
            const price = salePrice.SalesPriceDetails[a];

            if (uomExists) {
              // refetch UOM
              const options: ProductOption[] = await bigcommerceWrapper.getProductOptions(result.id);
              uom = options.find(e => e.display_name === BigCommerceAcumaticaType.UOMDisplayName);
            }

            let option: OptionValue = uom.option_values.find(e => e.label == price.UOM.value);
            const isEach = price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea';
            if (!option) {
              const optionValue: OptionValue = {
                is_default: isEach ? true : false,
                label: price.UOM.value,
                sort_order: 0,
              };
              option = await bigcommerceWrapper.createOptionValue(result.id, uom.id, optionValue);
              logger.info(`${medex.name} UOM: Created Option - ${price.UOM.value}`);
            }
            const conversion = product.UOMConversions.find(e => e.FromUOM.value == price.UOM.value);
            const weight = this.getUOMWeight(product, conversion);
            const variantValue: Variant = {
              sku: this.formatVariantSku(price),
              price: price.Price.value,
              weight: weight,
              option_values: [
                ...clearVariations[0].option_values.filter(e => e.option_display_name != BigCommerceAcumaticaType.UOMDisplayName),
                {
                  id: option.id,
                  label: price.UOM.value,
                  option_id: uom.id,
                  option_display_name: BigCommerceAcumaticaType.UOMDisplayName,
                },
              ],
            };
            await bigcommerceWrapper.createProductVariant(result.id, variantValue);
            logger.info(`${medex.name} UOM: Created Variant - ${price.UOM.value}`);

            // If each update base item price
            if (isEach) {
              await bigcommerceWrapper.updateProduct(bcProduct.id, { ...bcProduct, price: price.Price.value });
            }
          }
        }
      }
    } else {
      let deleteVariants = false;
      if (salePrice.SalesPriceDetails.length) {
        if (!uom && salePrice.SalesPriceDetails.length > 1) {
          const productOption: ProductOption = {
            product_id: result.id,
            display_name: BigCommerceAcumaticaType.UOMDisplayName,
            type: 'rectangles',
            sort_order: 100,
            option_values: salePrice.SalesPriceDetails.map((price, index) => {
              return {
                is_default: price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea' ? true : false,
                label: price.UOM.value,
                sort_order: price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea' ? 0 : (index + 1) * 10,
              };
            }),
          };

          uom = await bigcommerceWrapper.createProductOption(result.id, productOption);
          logger.info(`${medex.name} UOM: Created UOM`);
        } else {
          // remove missing variations and options
          for (let a = 0; a < variations.length; a++) {
            if (variations[a].sku_id) {
              const value = variations[a].option_values.find(e => variants.includes(e.label));
              if (!value) {
                bigcommerceWrapper.deleteProductVariant(result.id, variations[a].id);
                bigcommerceWrapper.deleteOptionValue(result.id, uom.id, variations[a].option_values[0].id);
                logger.info(`${medex.name} UOM: Deleted Option ${variations[a].option_values[0].label}`);
              }
            }
          }
        }
        if (salePrice.SalesPriceDetails.length > 1) {
          // Create or update Variants and Options
          for (let a = 0; a < salePrice.SalesPriceDetails.length; a++) {
            const price = salePrice.SalesPriceDetails[a];
            const conversion = product.UOMConversions.find(e => e.FromUOM.value == price.UOM.value);
            const variant = variations.find(e => e.option_values.find(f => f.label == price.UOM.value));
            if (variant) {
              if (variant.price != price.Price.value) {
                const isEach = price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea';
                const weight = this.getUOMWeight(product, conversion);
                await bigcommerceWrapper.updateProductVariant(result.id, variant.id, {
                  ...variant,
                  price: price.Price.value,
                  weight: weight,
                });
                logger.info(`${medex.name} UOM: Updated Variant - ${price.UOM.value}`);

                // If each update base item price
                if (isEach) {
                  await bigcommerceWrapper.updateProduct(bcProduct.id, { ...bcProduct, price: price.Price.value });
                }
              }
            } else {
              let option: OptionValue = uom.option_values.find(e => e.label == price.UOM.value);
              const isEach = price.UOM.value.toLowerCase().includes('each') || price.UOM.value.toLowerCase() == 'ea';
              if (!option) {
                const optionValue: OptionValue = {
                  is_default: isEach ? true : false,
                  label: price.UOM.value,
                  sort_order: 0,
                };
                option = await bigcommerceWrapper.createOptionValue(result.id, uom.id, optionValue);
                logger.info(`${medex.name} UOM: Created Option - ${price.UOM.value}`);
              }
              const weight = this.getUOMWeight(product, conversion);
              const variantValue: Variant = {
                sku: this.formatVariantSku(price),
                price: price.Price.value,
                weight: weight,
                option_values: [
                  {
                    id: option.id,
                    label: price.UOM.value,
                    option_id: uom.id,
                    option_display_name: BigCommerceAcumaticaType.UOMDisplayName,
                  },
                ],
              };
              await bigcommerceWrapper.createProductVariant(result.id, variantValue);
              logger.info(`${medex.name} UOM: Created Variant - ${price.UOM.value}`);

              // If each update base item price
              if (isEach) {
                await bigcommerceWrapper.updateProduct(bcProduct.id, { ...bcProduct, price: price.Price.value });
              }
            }
          }
        } else {
          // Do not create variation for single uom
          deleteVariants = true;

          // Update price of base item
          logger.info(`${medex.name} UOM: Update price of base item - ${productSku}`);
          const price = salePrice.SalesPriceDetails[0];
          await bigcommerceWrapper.updateProduct(bcProduct.id, { ...bcProduct, price: price.Price.value });
        }
      } else {
        deleteVariants = true;
      }
      if (deleteVariants) {
        // delete all UOMs/variations
        variations.forEach(e => {
          bigcommerceWrapper.deleteProductVariant(result.id, e.id);
        });
        if (uom) {
          uom.option_values.forEach(e => {
            bigcommerceWrapper.deleteOptionValue(result.id, uom.id, e.id);
          });
          await bigcommerceWrapper.deleteProductOption(result.id, uom.id);
        }
      }
    }

    // Update cross references
    const newVariations: Variant[] = await bigcommerceWrapper.getProductVariants(result.id);
    await acumaticaWrapper.UpdateProduct(this.prepareCrossReferences(product, newVariations));
  }

  /**
   * Get BC Product From AC variant Sku
   *
   * @param {string} org Tranzetta Org unique name
   * @param {string} sku AC Variant Sku
   */
  public async getBCProductByVariantSku(org: string, sku: string): Promise<Product> {
    const medex: Organization = await organizationModel.findOne({ name: org }).populate('apps');
    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    const skus = sku.split('-');

    for (let a = 0; a < skus.length; a++) {
      const product = await bigcommerceWrapper.getProductBySku(skus[a]);
      if (product) {
        return product;
        break;
      }
    }

    return null;
  }

  /**
   * Get AC UOM from BC Product
   *
   * @param {any} orderProduct BC Order product object
   * @param {Product} parentProduct BC Parent Product
   * @param {string} separator BC Sku separator
   */
  public async getOrderProductUOM(orderProduct: any, parentProduct: Product, separator = ':'): Promise<any> {
    let productUOM = '1 EACH';
    let sku = parentProduct ? parentProduct.sku : '';
    const obj: any = { OrderQty: { value: orderProduct.quantity } };
    if (orderProduct.product_options.length) {
      const getUOM = orderProduct.product_options.find(e => e.display_name == BigCommerceAcumaticaType.UOMDisplayName);
      if (orderProduct.sku.includes(separator)) {
        sku = orderProduct.sku.split(separator)[0];
        obj.AlternateID = { value: orderProduct.sku };
        if (getUOM) {
          productUOM = getUOM.display_value;
        }
      } else {
        sku = orderProduct.sku;
      }
      //sku = sku.replace(/ /g, '_');
    }
    obj.UOM = { value: productUOM };
    obj.InventoryID = { value: sku.toLocaleUpperCase() };
    console.log('Parsed Inventory:', obj);

    return obj;
  }

  /**
   * Modify AC Order DiscountDetails
   *
   * @param {string} id BC order id
   * @param {any} order AC order object
   * @param {any} acumaticaWrapper acumaticaWrapper instance
   */
  private async prepareDiscountDetails(id: string, order: any, acumaticaWrapper: any) {
    const newDiscountDetails: object[] = [];
    if (order.DiscountDetails !== undefined && order.DiscountDetails.length) {
      for (let a = 0; a < order.DiscountDetails.length; a++) {
        const d = order.DiscountDetails[a];
        if (d.ExternalDiscountCode !== undefined && d.ExternalDiscountCode.value !== undefined && d.DiscountCode.value === undefined) {
          const discounts = await acumaticaWrapper.getDiscountCodesByFilter(`DiscountCodeID eq '${d.ExternalDiscountCode.value}'`);
          if (discounts.length) {
            logger.info(`Syncing discounts of order #${id}`);
            newDiscountDetails.push({
              id: d.id,
              delete: true,
            });
            delete d.id;
            newDiscountDetails.push({
              ...d,
              ...{
                DiscountCode: {
                  value: d.ExternalDiscountCode.value,
                },
                SkipDiscount: { //skip from calculation as document discount
                  value: true
                }
              },
            });
          }
        }
      }
    }

    console.log(`newDiscountDetails: `, newDiscountDetails);
    if (newDiscountDetails.length) order.DiscountDetails = newDiscountDetails;

    return order;
  }

  /**
   * Sync Discount codes between BC and AC when an order is created
   *
   * @param {string} org Org name
   */
  public async discountSyncWebhooks(org = 'Nuvo') {
    const medex: Organization = await organizationModel.findOne({ name: org }).populate('apps');
    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(medex.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    const orders = await bigcommerceWrapper.getOrdersQuery(`?min_date_modified=${moment().subtract(10, 'minutes').toISOString()}`);
    if (orders) {
      for (let a = 0; a < orders.length; a++) {
        const id = orders[a].id;
        const acOrder = await acumaticaWrapper.getSalesOrderByParams({
          params: {
            $filter: org == 'Nuvo' ? `ExternalRef eq '${id} - NuvoH2o'` : `ExternalRef eq '${id}'`,
            $expand: `DiscountDetails`,
            $select: `DiscountDetails`,
          },
        });
        if (acOrder.length) {
          const acOrderDiscountDetails = acOrder[0].DiscountDetails;

          if (acOrderDiscountDetails !== undefined && acOrderDiscountDetails.length) {
            const updateOrder = await this.prepareDiscountDetails(id, acOrder[0], acumaticaWrapper);
            const updateOrderDiscountDetails = updateOrder.DiscountDetails;

            /* Add validation for update order discount code */
            if(updateOrderDiscountDetails[0].delete !== undefined) {
              await acumaticaWrapper.updateOrder(updateOrder);
            }
          }
        }
      }
    }
  }
}

export default BigcommerceAcumaticaService;
