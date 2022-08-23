import { Organization } from './organizations.interface';

export interface WebhookLog {
  _id: string;
  organization: Organization | any;
  type: string;
  status: string;
  customer_id: number;
  data: object;
  retries_count: number;
  error_message: string;
  creatd_at: string;
}
