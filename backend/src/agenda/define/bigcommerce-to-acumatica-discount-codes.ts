import { Agenda, Job } from 'agenda/dist';
import BigcommerceAcumaticaService from '@/services/bigcommerce-acumatica.service';
import { logger } from '@utils/logger';

export default function (agenda: Agenda) {
  agenda.define('bigcommerce-to-acumatica-discount-codes', async (obj: Job) => {
    const organizationId = obj.attrs.data.organization;

    logger.info(`${organizationId}: Syncing order discount codes`);

    const bigcommerceAcumaticaService = new BigcommerceAcumaticaService();
    await bigcommerceAcumaticaService.discountSyncWebhooks(organizationId);
  });
}
