import { model, Schema, Document } from 'mongoose';
import { TriggerMapping } from '@/interfaces/trigger_mappings.interface';

const triggerMappingSchema: Schema = new Schema({
  trigger: {
    type: Schema.Types.ObjectId,
    ref: 'Trigger',
  },
});

const triggerMappingModel = model<TriggerMapping & Document>('TriggerMapping', triggerMappingSchema);

export default triggerMappingModel;
