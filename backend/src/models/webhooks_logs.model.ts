import { model, Schema, Document } from 'mongoose';
import { WebhookLog } from '@/interfaces/webhooks_logs.interface';

const webhookLogSchema: Schema = new Schema({
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  type: {
    type: String,
  },
  status: {
    type: String,
    default: 'open',
  },
  customer_id: {
    type: Number,
    default: null,
  },
  data: {
    type: Object,
  },
  retries_count: {
    type: Number,
    default: 0,
  },
  error_message: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

const webhookLogModel = model<WebhookLog & Document>('WebhookLog', webhookLogSchema);

export default webhookLogModel;
