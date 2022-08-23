import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const profileSchema: Schema = new Schema({
  firstName: String,
  lastName: String,
  email: [String],
  mobile: [String],
});

const userSchema: Schema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  // profile: {
  //   type: profileSchema,
  // },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpiry: {
    type: Date,
  },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
