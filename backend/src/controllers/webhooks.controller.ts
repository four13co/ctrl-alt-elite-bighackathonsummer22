import { NextFunction, Request, Response } from 'express';
import { BigCommerceWebhookResponse, BigCommerceWebhookResponseData } from '@/interfaces/webhooks.interface';
import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import { AppType } from '@/enums/app-type.enum';
import webhookLogModel from '@/models/webhooks_logs.model';
import Agenda from '@/agenda';

class WebhooksController {
  public bcWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
      if (req.headers[process.env.HEADER] == process.env.HEADER_VALUE) {
        const defaultOrg: Organization = await organizationModel.findOne({ name: 'Medex Supply' }).populate('apps');
        const response: BigCommerceWebhookResponse = req.body;
        const data: BigCommerceWebhookResponseData = response.data;

        const bigcommerce = new BigcommerceWrapper();
        await bigcommerce.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);

        const acumaticaWrapper = new AcumaticaWrapper();
        await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);

        const tranzettaAgenda = new Agenda();
        if (response.scope === 'store/order/updated') {
          const createdLog = await webhookLogModel.findOne({
            'data.data.id': req.body.data.id,
            'data.scope': 'store/order/created',
            $or: [{ status: 'close' }, { status: 'fail' }],
          });

          if (createdLog) {
            createdLog.status = 'close';
            await createdLog.save();

            const log = new webhookLogModel({
              type: 'Bigcommerce',
              status: 'open',
              data: req.body,
              organization: defaultOrg._id,
              created_at: Date.now(),
            });

            await log.save();
            tranzettaAgenda.agenda.now('bigcommerce-to-acumatica-order', { log });
          }
        } else if (response.scope === 'store/order/created') {
          const log = new webhookLogModel({
            type: 'Bigcommerce',
            status: 'open',
            data: req.body,
            organization: defaultOrg._id,
            created_at: Date.now(),
          });
          await log.save();

          tranzettaAgenda.agenda.now('bigcommerce-to-acumatica-order', { log });
          // console.log('CREATED');
          // const orderId: number = response.data.id;
          // const orderDetail = await bigcommerce.getOrder(orderId);
          // const orderProducts = await bigcommerce.getOrderProducts(orderId);
          // const customer = await bigcommerce.getCustomer(orderDetail.customer_id);
          // const acumaticaCustomer = await acumaticaWrapper.getCustomer(customer.email);
          // const saleOrderProducts = [];
          // for (const orderProduct of orderProducts) {
          //   const parentProduct = await bigcommerce.getProduct(orderProduct.product_id);
          //   const productUOM = orderProduct.product_options[0].display_value;
          //   saleOrderProducts.push({
          //     OrderQty: { value: orderProduct.quantity },
          //     UOM: { value: productUOM },
          //     InventoryID: { value: parentProduct.sku },
          //   });
          // }
          // const salesOrder = {
          //   OrderType: { value: 'SO' },
          //   CustomerID: { value: acumaticaCustomer[0].CustomerID.value },
          //   ExternalRef: { value: orderDetail.id },
          //   Details: saleOrderProducts,
          // };
          // await acumaticaWrapper.createOrder(salesOrder);
        }
      }
    } catch (error) {
      const errorDefaultOrg: Organization = await organizationModel.findOne({ name: 'Medex Supply' }).populate('apps');
      const errorLog = new webhookLogModel({
        type: 'Bigcommerce',
        status: 'fail',
        data: req.body,
        organization: errorDefaultOrg._id,
        created_at: Date.now(),
      });
      await errorLog.save();
    }
  };

  public acumaticaSalesOrderWebhook = async (req: Request, res: Response, next: NextFunction) => {
    console.log('What is request', req.body);

    const defaultOrg: Organization = await organizationModel.findById('61124a7a34fe670b7cd4cf55').populate('apps');

    const log = new webhookLogModel({
      type: 'Acumatica',
      status: 'open',
      data: req.body,
      organization: defaultOrg._id,
    });

    await log.save();
    const tranzettaAgenda = new Agenda();
    tranzettaAgenda.agenda.now('acumatica-sales-order-update', { log });

    return res.status(200).json();
  };

  public bigcommerceAlgolia = async (req: Request, res: Response, next: NextFunction) => {
    const tranzettaAgenda = new Agenda();

    const { scope, data } = req.body;

    tranzettaAgenda.agenda.now('bigcommerce-to-algolia', {
      orgId: '61124a7a34fe670b7cd4cf55',
      type: scope,
      productId: data.id,
    });

    return res.status(200).json();
  };

  public initBigcommerceAlgolia = async (req: Request, res: Response, next: NextFunction) => {
    const tranzettaAgenda = new Agenda();

    const { scope } = req.body;

    tranzettaAgenda.agenda.now('init-bigcommerce-to-algolia', {
      orgId: '61124a7a34fe670b7cd4cf55',
      type: scope,
    });

    return res.status(200).json();
  };

  public initIceeShopify = async (req: Request, res: Response, next: NextFunction) => {
    const tranzettaAgenda = new Agenda();

    tranzettaAgenda.agenda.every('1 hour', 'acumatica-to-shopify-alternateId', { organization: 'ICEE' });

    return res.status(200).json();
  };
}

export default WebhooksController;
