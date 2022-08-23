import webhookLogModel from '@/models/webhooks_logs.model';
import { Agenda, Job } from 'agenda/dist';

export default function (agenda: Agenda) {
  agenda.define('recon-bigcommerce-order', async (job: Job) => {
    const webhookLogsIds: any = await webhookLogModel.aggregate([
      {
        $match: { status: 'fail' },
      },
      {
        $group: {
          _id: { id: '$data.data.id' },
        },
      },
      {
        $project: {
          _id: 0,
          salesOrderId: '$_id',
        },
      },
    ]);

    for (const webhookLogsId of webhookLogsIds) {
      const webhookLogInfo = await webhookLogModel
        .find({ 'data.data.id': webhookLogsId.salesOrderId.id, status: 'fail', customer_id: { $exists: true, $ne: null } })
        .sort({ created_at: -1 })
        .limit(1);

      agenda.now('bigcommerce-to-acumatica-order', { log: webhookLogInfo[0] });
    }
  });
}
