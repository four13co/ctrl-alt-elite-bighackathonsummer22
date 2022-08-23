import { Schema } from 'mongoose';

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
  appData: {
    type: Object,
    required: true
  }
});

export default appSchema;
