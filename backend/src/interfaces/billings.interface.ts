import { BillingType } from '@/enums/billing-type.enum';

export interface Billing {
  type: BillingType;
  coupon: string;
}
