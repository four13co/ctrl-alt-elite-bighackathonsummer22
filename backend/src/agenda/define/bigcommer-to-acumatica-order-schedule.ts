import webhookLogModel from '@models/webhooks_logs.model';
import { Agenda, Job } from 'agenda/dist';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import AcumaticaWrapper from '@apis/acumatica/acumatica-wrapper';
import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';
import { AppType } from '@/enums/app-type.enum';
import { logger } from '@utils/logger';
import { Order } from '@apis/bigcommerce/interfaces/orders.interface';
import moment from 'moment';

export default function (agenda: Agenda) {
  agenda.define('bigcommerce-to-acumatica-order-schedule', async (obj: Job) => {
    const organizationId = obj.attrs.data.organization;
    const medex: Organization = await organizationModel.findOne({ name: organizationId }).populate('apps');
    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(medex.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const bigcommerceWrapper = new BigcommerceWrapper();
    await bigcommerceWrapper.init(medex.apps.find(ii => ii.type == AppType.BigCommerce)._id);

    const params = encodeURI(
      `?min_date_created=${moment().subtract(1, 'day').toISOString()}&max_date_created=${moment().subtract(1, 'hour').toISOString()}`,
    );
    const orders: Order[] = await bigcommerceWrapper.getOrdersQuery(params);
    const ids = [];
    for (let a = 0; a < orders.length; a++) {
      const order = orders[a];
      const getLog = await webhookLogModel.findOne({ 'data.data.id': order.id }).exec();
      if (!getLog) {
        ids.push(parseInt(order.id));
      }
    }
    if (ids.length) {
      const acApp = medex.apps.find(ii => ii.type == AppType.BigCommerce);
      if (acApp) {
        const webhookLog: any = await webhookLogModel.findOne({ 'data.producer': `stores/${acApp.apiKey.storeHash}` }).exec();
        for (let a = 0; a < ids.length; a++) {
          const acOrder = await acumaticaWrapper.getSalesOrder(ids[a]);
          if (!acOrder.length) {
            logger.info(`${medex.name}: Syncing order ${ids[a]} manually`);
            const obj = {
              type: 'Bigcommerce',
              status: 'open',
              data: {
                created_at: Date.now(),
                store_id: webhookLog ? webhookLog.data.store_id : null,
                producer: `stores/${acApp.apiKey.storeHash}`,
                scope: 'store/order/created',
                channel_id: null,
                hash: `manual_${ids[a]}`,
                data: {
                  type: 'order',
                  id: ids[a],
                },
              },
              organization: medex._id,
              created_at: Date.now(),
            };

            const log = new webhookLogModel(obj);
            await log.save();
            agenda.now('bigcommerce-to-acumatica-order', { log });
          }
        }
      }
    }
  });
}
