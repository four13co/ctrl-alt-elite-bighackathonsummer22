import { model, Schema, Document } from 'mongoose';
import { Invoice } from '@/interfaces/invoice.interface';

const invoiceSchema: Schema = new Schema({
  organization: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  accessUsage: {
    type: Schema.Types.Number,
    required: true,
  },
  processUsage: {
    type: Schema.Types.Number,
    required: true,
  },
});

const invoiceModel = model<Invoice & Document>('Invoice', invoiceSchema);

export default invoiceModel;
