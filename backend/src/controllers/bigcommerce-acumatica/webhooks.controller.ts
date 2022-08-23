import { NextFunction, Request, Response } from 'express';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import BigcommerceAcumaticaService from '@/services/bigcommerce-acumatica.service';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { AppType } from '@/enums/app-type.enum';
import Agenda from '@/agenda';
import { Order } from '@/apis/bigcommerce/interfaces/orders.interface';
import webhookLogModel from '@/models/webhooks_logs.model';

class WebhooksController {
  public bigcommerceAcumaticaService = new BigcommerceAcumaticaService();

  public captureWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      res.status(200).send();
      if (req.headers[process.env.HEADER] == process.env.HEADER_VALUE) {
        const defaultOrg: Organization = await organizationModel.findOne({ name: 'Nuvo' }).populate('apps');

        const bigcommerce = new BigcommerceWrapper();
        await bigcommerce.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);

        const acumaticaWrapper = new AcumaticaWrapper();
        await acumaticaWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.Acumatica)._id);

        const tranzettaAgenda = new Agenda();

        const result: Order = await bigcommerce.getOrder(parseInt(data.data.id));
        const customerId = result.customer_id;
        if (customerId > 0) {
          const log = new webhookLogModel({
            type: 'Bigcommerce',
            status: 'open',
            data: req.body,
            customer_id: result.customer_id,
            organization: defaultOrg._id,
            created_at: Date.now(),
          });
          await log.save();
          //tranzettaAgenda.agenda.now('update-customers-via-sales-order', { log });
          tranzettaAgenda.agenda.schedule('in 5 minutes', 'update-customers-via-sales-order', { log });
        }
      }
    } catch (err) {
      next(err);
    }
  };

  public discountSyncWebhooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      res.status(200).send();
      //if (req.headers[process.env.HEADER] == process.env.HEADER_VALUE) {
      //await this.bigcommerceAcumaticaService.discountSyncWebhooks();
      //}
    } catch (err) {
      next(err);
    }
  };
}

export default WebhooksController;
