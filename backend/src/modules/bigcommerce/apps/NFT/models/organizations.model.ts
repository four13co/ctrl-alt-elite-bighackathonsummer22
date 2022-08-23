import { Schema } from 'mongoose';

const organizationsSchema: Schema = new Schema({
  apps: [{
    type: Schema.Types.ObjectId,
    ref: 'apps',
  }],
  account: [{
    type: Schema.Types.ObjectId,
    ref: 'account',
  }],
  name: {
    type: String,
    required: true,
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

export default organizationsSchema;
