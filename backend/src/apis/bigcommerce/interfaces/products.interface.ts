interface custom_fields {
  id?: number;
  name: string;
  value: string;
}

interface bulk_pricing_rules {
  id?: number;
  quantity_min: number;
  quantity_max: number;
  type: string;
  amount: number;
}

export interface images {
  image_file?: string;
  is_thumbnail?: boolean;
  sort_order?: number;
  description?: string;
  image_url?: string;
  id?: number;
  product_id?: number;
  url_zoom?: string;
  url_standard?: string;
  url_thumbnail?: string;
  url_tiny?: string;
  date_modified?: string;
}

interface videos {
  title?: string;
  description?: string;
  sort_order?: string;
  type?: string;
  video_id?: string;
  id?: number;
  product_id: number;
  length: string;
}

interface option_values {
  option_display_name?: string;
  label?: string;
}

export interface variants {
  cost_price?: number;
  price?: number;
  sale_price?: number;
  retail_price?: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  is_free_shipping?: boolean;
  fixed_cost_shipping_price?: number;
  purchasing_disabled?: boolean;
  purchasing_disabled_message?: string;
  upc?: string;
  inventory_level?: number;
  inventory_warning_level?: number;
  bin_picking_number?: string;
  mpn?: string;
  sku?: string;
  option_values?: option_values[];
}

export interface Product {
  id?: number;
  name: string;
  type: string;
  sku?: string;
  description?: string;
  weight: number;
  width?: number;
  depth?: number;
  height?: number;
  price: number;
  cost_price?: number;
  retail_price?: number;
  sale_price?: number;
  map_price?: number;
  tax_class_id?: number;
  product_tax_code?: string;
  categories?: number[];
  brand_id?: number;
  inventory_level?: number;
  inventory_warning_level?: number;
  inventory_tracking?: string;
  fixed_cost_shipping_price?: number;
  is_free_shipping?: boolean;
  is_visible?: boolean;
  is_featured?: boolean;
  related_products?: number[];
  warranty?: string;
  bin_picking_number?: string;
  layout_file?: string;
  upc?: string;
  search_keywords?: string;
  availability?: string;
  availability_description?: string;
  gift_wrapping_options_type?: string;
  gift_wrapping_options_list?: number[];
  sort_order?: number;
  condition?: string;
  is_condition_shown?: boolean;
  order_quantity_minimum?: number;
  order_quantity_maximum?: number;
  page_title?: string;
  meta_keywords?: string[];
  meta_description?: string;
  view_count?: number;
  preorder_release_date?: string;
  preorder_message?: string;
  is_preorder_only?: boolean;
  is_price_hidden?: boolean;
  price_hidden_label?: string;
  custom_url?: {
    url?: string;
    is_customized?: boolean;
  };
  open_graph_type?: string;
  open_graph_title?: string;
  open_graph_description?: string;
  open_graph_use_meta_description?: boolean;
  open_graph_use_product_name?: boolean;
  open_graph_use_image?: boolean;
  brand_name?: string;
  gtin?: string;
  mpn?: string;
  reviews_rating_sum?: number;
  reviews_count?: number;
  total_sold?: number;
  custom_fields?: custom_fields[];
  bulk_pricing_rules?: bulk_pricing_rules[];
  images?: images[];
  videos?: videos[];
  variants?: variants[];
  option_values?: option_values[];
  date_created?: Date;
  date_modified?: Date;
}

export interface Metafields {
  permission_set: string;
  key: string;
  value: string;
  namespace: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  date_created?: string;
  date_modified?: string;
  id?: number;
}

export interface Category {
  id: number;
  parent_id: number;
  name: string;
  description: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  brand: string;
  sku: string;
  barcode: string;
  url: string;
  type: string;
  price: number;
  cost: number;
  regularPrice: number;
  retailPrice: number;
  weight: number;
  width: number;
  depth: number;
  height: number;
  taxable: boolean;
  metaData: string[];
  keywords: string[];
  rating: number;
  soldCount: number;
  createdOn: Date;
  updatedOn: Date;
  availability: string;
  isFeatured: boolean;
  sortOrder: number;
  inventory: {
    name: string;
    quantity: number;
  };
  categories: {
    id: number;
    name: string;
  }[];
  images: {
    id: number;
    standard: string;
    thumbnail: string;
  }[];
  customFields: {
    id: number;
    name: string;
    value: string;
  }[];
  variants: {
    name: string;
    sku: string;
    barcode: string;
    price: number;
    cost: number;
    weight: number;
    width: number;
    depth: number;
    height: number;
  }[];
  options: string[];
}
