interface product_one {
  name: string;
  name_customer?: string;
  name_merchant?: string;
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
  upc?: string;
  sku?: string;
}

interface product_two {
  product_id?: number;
  name?: string;
  name_customer?: string;
  name_merchant?: number;
  product_options?: {
    id?: number;
    value?: string;
    display_name?: string;
    display_name_customer?: string;
    display_name_merchant?: string;
    display_value?: string;
    display_value_merchant?: string;
  };
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
  upc?: string;
  variant_id?: number;
  wrapping_name?: string;
  wrapping_message?: string;
  wrapping_cost_ex_tax?: number;
  wrapping_cost_inc_tax?: number;
}

interface form_fields {
  name: string;
  value: string;
}

interface shipping_addresses {
  first_name?: string;
  last_name?: string;
  company?: string;
  street_1?: string;
  street_2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_iso2?: string;
  phone?: string;
  email?: string;
  shipping_method?: string;
  form_fields?: form_fields[];
}

export interface Order {
  id: string;
  status: string;
  products: product_one[] | product_two[];
  shipping_addresses: shipping_addresses[];
  base_handling_cost?: string;
  base_shipping_cost?: string;
  base_wrapping_cost?: string | number;
  billing_address?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    street_1?: string;
    street_2?: string;
    city?: string;
    state?: string;
    zip: number;
    country?: string;
    country_iso2?: string;
    phone?: number;
    email?: string;
    form_fields?: form_fields[];
  };
  channel_id?: number;
  customer_id?: number;
  customer_message?: string;
  date_created?: string;
  default_currency_code?: string;
  discount_amount?: string;
  ebay_order_id?: string;
  external_id?: string | null;
  external_source?: string | null;
  geoip_country?: string;
  geoip_country_iso2?: string;
  handling_cost_ex_tax?: string;
  handling_cost_inc_tax?: string;
  ip_address?: string;
  is_deleted?: boolean;
  items_shipped?: number;
  items_total?: number;
  order_is_digital?: boolean;
  payment_method?: string;
  payment_provider_id?: string | number;
  refunded_amount?: string;
  shipping_cost_ex_tax?: string;
  shipping_cost_inc_tax?: string;
  staff_notes?: string;
  status_id?: number;
  subtotal_ex_tax?: string;
  subtotal_inc_tax?: string;
  tax_provider_id?: string;
  customer_locale?: string;
  total_ex_tax?: string;
  total_inc_tax?: string;
  wrapping_cost_ex_tax?: string;
  wrapping_cost_inc_tax?: string;
  payment_status?: string;
}
