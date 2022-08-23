import { model, Schema, Document } from 'mongoose';
import { AccessLog } from '@/interfaces/accessLog.interface';

const accessLogSchema: Schema = new Schema({
  trigger: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  organization: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  inputData: {
    type: Object,
  },
  outputData: {
    type: Object,
  },
  processLog: {
    type: [String],
  },
});

const accessLogModel = model<AccessLog & Document>('AccessLog', accessLogSchema);

export default accessLogModel;
