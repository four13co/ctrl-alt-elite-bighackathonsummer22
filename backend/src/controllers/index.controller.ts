import { NextFunction, Request, Response } from 'express';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import { Product, Metafields } from '@apis/bigcommerce/interfaces/products.interface';
import { Order } from '@apis/bigcommerce/interfaces/orders.interface';
import { User } from '@/interfaces/users.interface';
import userModel from '@/models/users.model';
import synchronizationModel from '@/models/synchronization.model';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import appModel from '@/models/apps.model';
import { App } from '@/interfaces/apps.interface';
import { AppType } from '@/enums/app-type.enum';
import { Trigger } from '@/interfaces/triggers.model';
import triggerModel from '@/models/triggers.model';
import { TriggerType } from '@/enums/trigger-type.enum';
import { BillingType } from '@/enums/billing-type.enum';
import { Variant } from '@/apis/bigcommerce/interfaces/variant.interface';
import { OptionValue } from '@/apis/bigcommerce/interfaces/option-value.interface';
import { Product as AlgoliaProduct } from '@apis/algolia/interfaces/products.interface';
import AlgoliaWrapper from '@/apis/algolia/algolia-wrapper';

class IndexController {
  // init acumatica wrapper using mongo id

  public index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.send('Okay');
    } catch (error) {
      next(error);
    }
  };

  public test = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);
      //const result = await this.acumaticaWrapper.getProducts();
      const result = await acumaticaWrapper.getProduct('b3697195-d0f6-ea11-817a-0a873c70f716');
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public bcTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Product[] = await bigcommerceWrapper.getProducts();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public getBCProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const productId: number = parseInt(req.params.productId);
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Product = await bigcommerceWrapper.getProduct(productId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public createBCProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const product: Product = req.body;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Product = await bigcommerceWrapper.createProduct(product);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public updateBCProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const productId: number = +req.params.productId;
      const product: Product = req.body;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Product = await bigcommerceWrapper.updateProduct(productId, product);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public deleteBCProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const productId: number = +req.params.productId;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result = await bigcommerceWrapper.deleteProduct(productId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public getBCOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Order[] = await bigcommerceWrapper.getOrders();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public getBCOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const orderId: number = +req.params.orderId;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Order = await bigcommerceWrapper.getOrder(orderId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public createBCOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const order: Order = req.body;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Order = await bigcommerceWrapper.createOrder(order);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public updateBCOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const orderId: number = +req.params.orderId;
      const order = req.body;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Order = await bigcommerceWrapper.updateOrder(orderId, order);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public deleteBCOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const orderId: number = +req.params.orderId;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result = await bigcommerceWrapper.deleteOrder(orderId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public getAcumaticaProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.productId;
      console.log('What is Product Id', productId);
      res.json('Test');
    } catch (err) {
      next(err);
    }
  };

  public syncBigCommerceToAcumatica = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const orderId: string = req.orderId;
    } catch (err) {
      next(err);
    }
  };

  public onBCOrderUpdate = async (req: Request, res: Response, next: NextFunction) => {};

  public onBCOrderCreated = async (req: Request, res: Response, next: NextFunction) => {};

  public dbTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: User = await userModel.create({
        email: 'demo@tranzetta.com',
        password: 'demo',
        name: 'Demo User',
        role: 'demo',
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@tranzetta.com',
          mobile: '090909090909',
        },
      });

      const acumaticaApp: App = await appModel.create({
        name: 'Acumatica',
        type: AppType.Acumatica,
        apiKey: {
          baseUrl: 'https://acumatica-dev.four13.co',
          entity: 'Default',
          apiVersion: '20.200.001',
          client_id: 'D02D6100-CE9F-CC98-AC4E-308ACEED70D8@Four13 MAC',
          client_secret: 'rZqlRI-7VEoBmFsTPvb8Cw',
          token: {
            access_token: '296d0793a7b3fc67303cbc9e03216db7',
            expires_in: 3600,
            token_type: 'Bearer',
            refresh_token: '296d0793a7b3fc67303cbc9e03216db7',
          },
        },
      });

      const bigCommerceApp: App = await appModel.create({
        name: 'BigCommerce',
        type: AppType.BigCommerce,
        apiKey: {
          clientId: '62379jhio35d6gzn2fpo9ks2xettq77',
          accessToken: '2hyzu3vad9h77int9gl9692p3t4g45i',
          responseType: 'json',
          storeHash: 'xcxop6k5w1',
          apiVersion: 'v3',
        },
      });

      const organization: Organization = await organizationModel.create({
        name: 'Demo Org',
        users: [user._id],
        apps: [acumaticaApp._id, bigCommerceApp._id],
        billing: {
          type: BillingType.Monthly,
          coupon: '',
        },
      });

      const trigger: Trigger = await triggerModel.create({
        name: 'Acumatica to BigCommerce',
        type: TriggerType.CronJob,
        trigger: '2 hours',
        job: 'acumatica-to-bigcommerce',
        organization: organization._id,
        lastRunDate: Date(),
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  public syncAPOsToBCPOs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);
      //const result = await this.acumaticaWrapper.getProducts();
      // const result = await acumaticaWrapper.getProduct('2a113b2c-d87f-e411-beca-00b56d0561c2');
      const result = await acumaticaWrapper.getPurchaseOrders();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public AProdAvailToBProdAvail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { acumaticaProductId, bigCommerceId } = req.body;
      const acumatica: Organization = await organizationModel.findOne({}).populate('apps');
      const bigCommerce: Organization = await organizationModel.findOne({}).populate('apps');

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(acumatica.apps.find(ii => ii.type == AppType.Acumatica)._id);
      const acumaticaResult = await acumaticaWrapper.getProductAttributes(acumaticaProductId);
      const availability_description = acumaticaResult.Attributes.find(attribute => attribute.AttributeID.value === 'PRODAVAIL').Value.value;

      const product: Product = { availability_description } as Product;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(bigCommerce.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Product = await bigcommerceWrapper.updateProduct(bigCommerceId, product);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public AShippingGroupsToShippingGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { acumaticaProductId, bigCommerceId } = req.body;
      const acumatica: Organization = await organizationModel.findOne({}).populate('apps');
      const bigCommerce: Organization = await organizationModel.findOne({}).populate('apps');

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(acumatica.apps.find(ii => ii.type == AppType.Acumatica)._id);
      const acumaticaResult = await acumaticaWrapper.getProductAttributes(acumaticaProductId);
      const acumaticaAttributes = acumaticaResult.Attributes.filter(
        attribute => attribute.AttributeID.value === 'GROUNDSHIP' || attribute.AttributeID.value === 'HAZMAT',
      );
      const value = JSON.stringify(
        acumaticaAttributes.filter(attribute => attribute.Value.value === '1').map(attribute => attribute.AttributeID.value),
      );

      const metafield: Metafields = {
        value,
        permission_set: 'write',
        namespace: 'shipping.shipperhq',
        key: 'shipping-groups',
      };

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(bigCommerce.apps.find(ii => ii.type == AppType.BigCommerce)._id);

      const metafields: any = await bigcommerceWrapper.getMetafields(bigCommerceId);
      const isShippingGroupExist: any = metafields.find(mf => mf.key === 'shipping-groups');
      let result = null;

      if (isShippingGroupExist) {
        const metafieldId = isShippingGroupExist.id;
        result = await bigcommerceWrapper.updateMetafields(bigCommerceId, metafieldId, metafield);
      } else {
        result = await bigcommerceWrapper.createMetafields(bigCommerceId, metafield);
      }

      res.json(result);
    } catch (error) {}
  };

  public SyncAcumaticaProductToBigcommerceProduct = async (req: Request, res: Response, next: NextFunction) => {
    const acumatica: Organization = await organizationModel.findOne({}).populate('apps');
    const bigCommerce: Organization = await organizationModel.findOne({}).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(acumatica.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const acumaticaProducts: any = await acumaticaWrapper.getProducts(); // Fetch all acumatica products

    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(bigCommerce.apps.find(ii => ii.type == AppType.BigCommerce)._id);
    const bcProducts: any = await bigcommerceWrapper.getProducts(); // Fetch all bigcommerce products

    const syncModel = await synchronizationModel.find(); // Fetch all products that already synchronize

    let synchronization = [];
    const newAcumaticaProduct = acumaticaProducts.filter(element => {
      const isProductExist = syncModel.find(sm => sm.acumaticaProductId === element.id); // search if acumatica product is already synchronize
      if (isProductExist) {
        return false;
      }

      const findProducts = bcProducts.find(product => product.sku === element.InventoryID.value); // search if product is already in bigcommerce products by SKU
      if (findProducts) {
        synchronization = [...synchronization, { acumaticaProductId: element.id, bigcommerceId: findProducts.id }];
        return false;
      } else {
        return true; // return true if acumatica products is not yet in sync and not yet in bigcommerce products
      }
    });

    if (synchronization.length !== 0) {
      // If there are products exist in bigcommerce and not yet yet synchronize and save it to the database
      await synchronizationModel.insertMany(synchronization);
    }

    if (newAcumaticaProduct.length !== 0) {
      // create the product in bigcommerce. Then get the bigcommerce Id and save it in the database
    }

    const result = {
      newProduct: newAcumaticaProduct,
      newSynchronize: synchronization,
      synchronizeProduct: syncModel,
    };

    res.json(result);
  };

  public AcumaticaProductWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const { Inserted, Deleted } = req.body; // request body from acumatica webhook
    const bigCommerce: Organization = await organizationModel.findOne({}).populate('apps');
    const groundShipping = Inserted[0].GroundShipping; // acumatica product attribute. Shipping group
    const hazmat = Inserted[0].Hazmatitems; // acumatica product attribute. shipping group
    const acumaticaProductId = Inserted[0].InventoryItem_noteID; // acumatica product ID
    const availability_description = Inserted[0].Availability;
    const oldAvailabilityDescription = Deleted[0].Availability;

    const synchronization: any = await synchronizationModel.findOne({ acumaticaProductId }); // find if the acumatica product is already sync
    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(bigCommerce.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    if (!synchronization) {
      // if acumatica product is not yet in sync with bigcommerce
      res.json({ message: 'failed' });
    }

    if (hazmat !== null || groundShipping !== null) {
      // check if hazmat and groundshipping is updated
      const metafields: any = await bigcommerceWrapper.getMetafields(synchronization.bigcommerceId); // get the bigcommerce product metafields
      const isShippingGroupExist: any = metafields.find(mf => mf.key === 'shipping-groups'); // find if metafield has shipperhq

      if (isShippingGroupExist) {
        const metafieldId = isShippingGroupExist.id;
        let value = JSON.parse(isShippingGroupExist.value);
        if (hazmat !== null) {
          // if hazmat attribute is updated
          if (hazmat === true) {
            value = [...value, 'HAZMAT']; // add hazmat if true
          } else {
            value = value.filter(x => x !== 'HAZMAT'); //  remove hazmat if false
          }
        }

        if (groundShipping !== null) {
          // if groundshipping is updated
          if (groundShipping === true) {
            value = [...value, 'GROUNDSHIP']; // add groundship if true
          } else {
            value = value.filter(x => x !== 'GROUNDSHIP'); // remove groundship if false
          }
        }

        value = JSON.stringify(value);
        const metafield: Metafields = {
          value,
          permission_set: 'write',
          namespace: 'shipping.shipperhq',
          key: 'shipping-groups',
        };
        await bigcommerceWrapper.updateMetafields(synchronization.bigcommerceId, metafieldId, metafield); // update the bigcommerce metafields
      } else {
        // if there are no shipperhq metafield in the bigcommerce product
        let ship = [];

        if (hazmat !== null && hazmat === true) {
          ship = [...ship, 'HAZMAT'];
        }
        if (groundShipping !== null && groundShipping === true) {
          ship = [...ship, 'GROUNDSHIP'];
        }
        const value = JSON.stringify(ship);

        const metafield: Metafields = {
          value,
          permission_set: 'write',
          namespace: 'shipping.shipperhq',
          key: 'shipping-groups',
        };
        await bigcommerceWrapper.createMetafields(synchronization.bigcommerceId, metafield);
      }
    }

    if (availability_description !== oldAvailabilityDescription) {
      // check if availability is updated
      const product: Product = { availability_description } as Product;
      await bigcommerceWrapper.init(bigCommerce.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      await bigcommerceWrapper.updateProduct(synchronization.bigcommerceId, product);
    }

    res.json({ message: 'success' });
  };

  public AcumaticaProductWebhook2 = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medex: Organization = await organizationModel.findOne({ name: 'Medex Supply' }).populate('apps');

      const { Inserted } = req.body; // request body from acumatica webhook
      const acumaticaProductId = Inserted[0].InventoryItem_noteID; // acumatica product ID

      const acumaticaWrapper = new AcumaticaWrapper();
      await acumaticaWrapper.init(medex.apps.find(ii => ii.type == AppType.Acumatica)._id);
      const acumaticaParams = `?$expand=Attributes&$select=InventoryID,TemplateItemID,Availability,Description,Attributes/AttributeID,Attributes/Value`;
      const acumaticaProduct: any = await acumaticaWrapper.getProduct(`${acumaticaProductId}${acumaticaParams}`);

      const acumaticaAttributes = acumaticaProduct.Attributes.filter(
        attribute => attribute.AttributeID.value === 'AT004' || attribute.AttributeID.value === 'AT003', // AT003=HAZMAT, AT004=GROUNDSHIP
      );
      const value = JSON.stringify(
        acumaticaAttributes.filter(attribute => attribute.Value.value === '1').map(attribute => attribute.AttributeDescription.value),
      );
      const availability_description = acumaticaProduct.Availability.value;
      const sku = acumaticaProduct.InventoryID.value;

      let params = encodeURI(`?sku:in=${sku}`);
      let isVariants = false;
      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      let bigcommerceProduct: any = await bigcommerceWrapper.getProducts(params);

      if (bigcommerceProduct.length === 0) {
        isVariants = true;
        params = encodeURI(`?sku=${sku}`);
        bigcommerceProduct = await bigcommerceWrapper.getVariants(params);
      }

      if (bigcommerceProduct.length === 0) {
        console.log('no product found');
        res.json({ message: 'no bigcommerce product found' });
        return;
      }

      if (isVariants) {
        console.log('Product is a variants');
        const bcProductID = bigcommerceProduct[0].product_id;
        const variantID = bigcommerceProduct[0].id;
        let metafield: any = {
          value,
        };

        const metafields: any = await bigcommerceWrapper.getProductVariantsMetafields(bcProductID, variantID);
        const isShippingGroupExist: any = metafields.find(mf => mf.key === 'shipping-groups');

        if (isShippingGroupExist) {
          const metafieldId = isShippingGroupExist.id;
          await bigcommerceWrapper.updateProductVariantsMetafield(bcProductID, variantID, metafieldId, metafield);
        } else {
          metafield = { ...metafield, permission_set: 'write', namespace: 'shipping.shipperhq', key: 'shipping-groups' };
          await bigcommerceWrapper.createProductVariantsMetafield(bcProductID, variantID, metafield);
        }
        console.log('PRODUCT variant shipping group updated');

        const product: Product = { availability_description } as Product;
        await bigcommerceWrapper.updateProduct(bcProductID, product);
        console.log('PRODUCT variant PRODUCT AVAILABILITY updated');

        res.json({ message: 'success' });
        return;
      }

      const bigcommerceProductId = bigcommerceProduct[0].id;

      let metafield: any = {
        value,
      };

      const metafields: any = await bigcommerceWrapper.getMetafields(bigcommerceProductId);
      const isShippingGroupExist: any = metafields.find(mf => mf.key === 'shipping-groups');

      if (isShippingGroupExist) {
        const metafieldId = isShippingGroupExist.id;
        await bigcommerceWrapper.updateMetafields(bigcommerceProductId, metafieldId, metafield);
      } else {
        metafield = { ...metafield, permission_set: 'write', namespace: 'shipping.shipperhq', key: 'shipping-groups' };
        await bigcommerceWrapper.createMetafields(bigcommerceProductId, metafield);
      }
      console.log('DONE UPDATING SHIPPING GROUPS');

      const product: Product = { availability_description } as Product;
      await bigcommerceWrapper.updateProduct(bigcommerceProductId, product);
      console.log('DONE UPDATING PRODUCT AVAILABILITY');

      res.json({ message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public syncAcumaticaProductsToBC = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultOrg: Organization = await organizationModel.findOne({}).populate('apps');
      // TODO: Replace all products based on Acumatica.
      // Products use here was for testing only.
      const productId: string = req.params.productId;
      const acumaticaWrapper = new AcumaticaWrapper();

      await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);

      const product = await acumaticaWrapper.getProduct(productId);

      const productObject = {
        name: product.Description.value,
        price: product.DefaultPrice.value,
        weight: product.DimensionWeight.value,
        sku: product.InventoryID.value,
        type: 'physical',
      };

      const salePrice = await acumaticaWrapper.getProductSalesPriceDetails(productId);
      const variants = salePrice.SalesPriceDetails.map((salePrice, index) => {
        return {
          sku: `${salePrice.InventoryID.value}-${index + 1}`,
          sale_price: salePrice.Price.value,
          option_values: [
            {
              option_display_name: 'Unit of Measure',
              label: salePrice.UOM.value,
            },
          ],
        };
      });

      productObject['variants'] = variants;

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const result: Product = await bigcommerceWrapper.createProduct(productObject);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  public SaddlebackCustomerUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saddleback: Organization = await organizationModel.findOne({ name: 'Saddleback' }).populate('apps');

      const bigcommerceWrapper = new BigcommerceWrapper();
      await bigcommerceWrapper.init(saddleback.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      const { storeCredit, id } = req.body;
      const customer: any = [
        {
          id: id,
          store_credit_amounts: [
            {
              amount: storeCredit,
            },
          ],
        },
      ];
      const bigcommerceCustomer: any = await bigcommerceWrapper.updateCustomer(customer);
      res.json(bigcommerceCustomer);
    } catch (err) {
      next(err);
    }
  };
}

export default IndexController;
