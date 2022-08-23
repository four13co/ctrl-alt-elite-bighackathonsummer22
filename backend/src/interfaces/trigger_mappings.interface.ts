import { TriggerType } from '@/enums/trigger-type.enum';

export interface TriggerMapping {
  _id: string;
  trigger: TriggerType;
}
