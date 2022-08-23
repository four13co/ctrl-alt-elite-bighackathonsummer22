export interface Product {
  body_html?: string;
  created_at?: Date;
  handle?: string;
  id?: number;
  images?: [];
  options?: [];
  product_type?: string;
  published_at?: Date;
  published_scope?: string;
  status?: string;
  tags?: string;
  template_suffix?: string;
  update_at?: Date;
  variants?: [];
  vendor?: string;
}

export interface Variant {
  id?: number;
  sku?: string;
  grams?: number;
  price?: number;
  title?: string;
  weight?: number;
  barcode?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  taxable?: boolean;
  position?: number;
  created_at?: Date;
  product_id?: number;
  updated_at?: Date;
  weight_unit?: string;
  compare_at_price?: string;
  inventory_policy?: string;
  inventory_item_id?: number;
  requires_shipping?: boolean;
  inventory_quantity?: number;
  fulfillment_service?: string;
  inventory_management?: string;
}
