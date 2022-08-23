import { model, Schema, Document } from 'mongoose';
import { Organization } from '@/interfaces/organizations.interface';

const billingSchema: Schema = new Schema({
  type: {
    type: String,
  },
  coupon: {
    type: String,
  },
});

const organizationSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  apps: [
    {
      type: Schema.Types.ObjectId,
      ref: 'App',
    },
  ],
  billing: {
    type: billingSchema,
  },
});

const organizationModel = model<Organization & Document>('Organization', organizationSchema);

export default organizationModel;
