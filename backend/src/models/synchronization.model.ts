import { model, Schema, Document } from 'mongoose';
import { Synchronization } from '@/interfaces/synchronization.interface';

const synchronizationSchema : Schema = new Schema ({
  acumaticaProductId: String,
  bigcommerceId: Number
})

const synchronizationModel = model<Synchronization & Document>('Synchronization', synchronizationSchema);

export default synchronizationModel;