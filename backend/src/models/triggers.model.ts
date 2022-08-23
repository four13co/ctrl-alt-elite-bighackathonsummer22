import { model, Schema, Document } from 'mongoose';
import { Trigger } from '@/interfaces/triggers.model';

const triggerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  trigger: {
    type: String,
    required: true,
  },
  job: {
    type: String,
    required: true,
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  lastRunDate: {
    type: Date,
  },
});

const triggerModel = model<Trigger & Document>('Trigger', triggerSchema);

export default triggerModel;
