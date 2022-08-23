import { Organization } from './organizations.interface';

export interface Invoice {
  organization: Organization;
  accessUsage: number;
  processUsage: number;
}
