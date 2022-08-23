import { model, Schema, Document } from 'mongoose';
import { Webhook } from '@/interfaces/webhooks.interface';

const webhookSchema: Schema = new Schema({
  trigger_mapping: {
    type: Schema.Types.ObjectId,
    ref: 'TriggerMapping',
  },
  route: {
    type: String,
  },
  app_end_point: {
    type: String,
  },
  webhook_id: {
    type: Number,
  },
});

const webhookModel = model<Webhook & Document>('Webhook', webhookSchema);

export default webhookModel;
