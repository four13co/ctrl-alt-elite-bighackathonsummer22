import { model, Schema, Document } from 'mongoose';
import { AlgoliaSyncCache } from '../interfaces/algolia-sync-cache.interface';

const algoliaSyncCacheSchema = new Schema({
  appId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  productId: {
    type: Schema.Types.Number,
    index: true,
    required: true,
  },
  type: {
    type: Schema.Types.Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const algoliaSyncCacheModel = model<AlgoliaSyncCache & Document>('AlgoliaSyncCache', algoliaSyncCacheSchema);

export default algoliaSyncCacheModel;
