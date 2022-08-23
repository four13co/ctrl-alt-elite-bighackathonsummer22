import { Organization } from './organizations.interface';
import { Trigger } from './triggers.model';
import { User } from './users.interface';

export interface AccessLog {
  trigger: Trigger;
  organization: Organization;
  user: User;
  startDate: Date;
  endDate: Date;
  inputData: any;
  outputData: any;
  processLog: [string];
}
