import { TriggerMapping } from '@/interfaces/trigger_mappings.interface';

// TODO
// Remove any type in trigger_mapping types
// 'any' is use for testing only

export interface Webhook {
  _id: string;
  trigger_mapping: TriggerMapping | any;
  route: string;
  app_endpoint: string;
  webhook_id: string | number;
}

export interface BigCommerceWebhookData {
  client_id: string;
  created_at: number;
  destination: string;
  headers: object;
  id: number;
  is_active: boolean;
  scope: string;
  store_hash: string;
  updated_at: number;
}

export interface BigCommerceWebhookMeta {
  meta?: object;
}

export interface BigCommerceWebhookResponse {
  created_at: number;
  store_id: string;
  producer: string;
  scope: string;
  channel_id: string;
  hash: string;
  data: BigCommerceWebhookResponseData;
}

export interface BigCommerceWebhookResponseData {
  type: string;
  id: number;
}

export interface BigCommerceWebhook {
  data: BigCommerceWebhookData;
  meta: BigCommerceWebhookMeta;
}
