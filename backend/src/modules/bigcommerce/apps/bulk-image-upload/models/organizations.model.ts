import { Schema } from 'mongoose';

const organizationsSchema: Schema = new Schema({
  apps: [{
    type: Schema.Types.ObjectId,
    ref: 'apps',
  }],
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'users',
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
