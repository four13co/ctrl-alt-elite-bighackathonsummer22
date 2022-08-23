interface config {
  default_value?: string;
  checked_by_default?: boolean;
  checkbox_label?: string;
  date_limited?: boolean;
  date_limit_mode?: string;
  date_earliest_value?: string;
  date_latest_value?: string;
  file_types_mode?: string;
  file_types_supported?: string[];
  file_types_other?: string[];
  file_max_size?: number;
  text_characters_limited?: boolean;
  text_min_length?: number;
  text_max_length?: number;
  text_lines_limited?: boolean;
  text_max_lines?: number;
  number_limited?: boolean;
  number_limit_mode?: string;
  number_lowest_value?: number;
  number_highest_value?: number;
  number_integers_only?: boolean;
  product_list_adjusts_inventory?: boolean;
  product_list_adjusts_pricing?: boolean;
  product_list_shipping_calc?: string;
}

interface optionValue {
  is_default?: boolean;
  label?: string;
  sort_order?: number;
  value_data?: any;
  id?: number;
}

export interface ProductOption {
  id?: number;
  product_id?: number;
  display_name?: string;
  type?: string;
  config?: config;
  sort_order?: number;
  option_values?: optionValue[];
  image_url?: string;
}
