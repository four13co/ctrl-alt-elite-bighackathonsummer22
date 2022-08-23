import { Agenda, Job } from 'agenda/dist';
import BigcommerceWrapper from '@apis/bigcommerce/bigcommerce-wrapper';
import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';
import { AppType } from '@/enums/app-type.enum';
import { logger } from '@utils/logger';

export default function (agenda: Agenda) {
  agenda.define('register-bigcommerce-webhook', async (job: Job) => {
    try {
      const bigcommerceWrapper = new BigcommerceWrapper();

      // Medex
      let org = 'Medex Supply';
      const getMedexOrganization: Organization = await organizationModel.findOne({ name: org });
      let defaultOrg: Organization = await organizationModel.findById(getMedexOrganization._id).populate('apps');
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      await bigcommerceWrapper.registerWebhook('store/order/updated', `${process.env.SERVER_URL}/api/webhooks/bigcommerce/medex`, org);
      await bigcommerceWrapper.registerWebhook('store/order/created', `${process.env.SERVER_URL}/api/webhooks/bigcommerce/medex`, org);

      // Nuvo
      org = 'Nuvo';
      const getNuvoOrganization: Organization = await organizationModel.findOne({ name: org });
      defaultOrg = await organizationModel.findById(getNuvoOrganization._id).populate('apps');
      await bigcommerceWrapper.init(defaultOrg.apps.find(ii => ii.type == AppType.BigCommerce)._id);
      await bigcommerceWrapper.registerWebhook('store/order/created', `${process.env.SERVER_URL}/api/bigcommerce-acumatica/webhooks`, org);
      //await bigcommerceWrapper.registerWebhook('store/order/updated', `${process.env.SERVER_URL}/api/bigcommerce-acumatica/webhooks`, org);

      await job.remove();
    } catch (err) {
      logger.info(`Webhooks Registration Error: ${JSON.stringify(err)}`);
    }
  });
}
