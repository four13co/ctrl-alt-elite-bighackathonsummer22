import { Profile } from '@/interfaces/profiles.interface';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  //profile: Profile;
  passwordResetToken: string;
  passwordResetExpiry: Date;
}
