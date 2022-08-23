import { model, Schema, Document } from 'mongoose';
import { App } from '@/interfaces/apps.interface';

const appSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  apiKey: {
    type: Object,
    required: true,
  },
});

const appModel = model<App & Document>('App', appSchema);

export default appModel;
