import { Schema } from 'mongoose';

const storeSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    require: true,
  },
  url: {
    // TODO: url is to be removed later; was replaced with storeHash
    type: String,
    require: true,
  },
  storeHash: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

export default storeSchema;
