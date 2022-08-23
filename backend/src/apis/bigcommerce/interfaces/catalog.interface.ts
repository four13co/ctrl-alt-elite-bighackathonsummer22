//published_date format Fri, 6 Sep 2019 12:55:31 +0000
export interface BlogPost {
  title: string;
  body: string;
  author?: string;
  thumbnail_path?: string;
  is_published: boolean;
  published_date: any;
  tags?: string[];
  id?: number;
  preview_url: string;
  summary: string;
  published_date_iso8601: string;
}

export interface CustomUrl {
  url?: string;
  is_customized?: boolean;
}
export interface Brand {
  id: number;
  name: string;
  meta_keywords?: any[]
  image_url?: string;
  custom_url?: CustomUrl;
}

export interface Page {
  id?: number;
  name: string;
  body?: string;
  is_visible?: boolean;
  parent_id: number;
  sort_order: number;
  type: string;
  is_homepage: boolean;
  is_customers_only: boolean;
  search_keywords: string;
  has_mobile_version: boolean;
  mobile_body: string;
  content_type: string; //"text/javascript",
  url: string;
}


export interface CatalogCategory {
  id?: number;
  parent_id: number;
  name: string;
  description?: string;
  views?: number;
  sort_order?: number;
  page_title?: string;
  meta_keywords?: any[];
  meta_description?: string;
  layout_file?: string;//"category.html",
  is_visible: boolean;
  default_product_sort: string;
  image_url: string;
  search_keywords: string
  custom_url: CustomUrl;
}
