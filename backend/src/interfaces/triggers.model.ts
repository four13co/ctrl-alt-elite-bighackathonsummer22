import { TriggerType } from '@/enums/trigger-type.enum';
import { Organization } from './organizations.interface';

export interface Trigger {
  _id: string;
  name: string;
  type: TriggerType;
  trigger: string;
  job: string;
  organization: Organization;
  lastRunDate: Date;
}
