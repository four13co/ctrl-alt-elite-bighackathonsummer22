import { logger } from '@/utils/logger';
import { BlogPost, Brand, CatalogCategory, Page } from '../bigcommerce/interfaces/catalog.interface';

import { ApiKeys } from '../bigcommerce/bigcommerce-helper';
import BigcommerceWrapper from '../bigcommerce/bigcommerce-wrapper';
import { Product } from '../bigcommerce/interfaces/products.interface';

class TranzettaWrapper extends BigcommerceWrapper {
  public async initSync(apiKeys: ApiKeys): Promise<void> {
    await this.initSyncHelper(apiKeys);
  }

  public async getProductByIds(ids: any[]): Promise<Product[]> {
    const query_products = encodeURIComponent(ids?.join(','));
    return this.client.get(`/catalog/products?id:in=${query_products}`).then((data: any) => {
      return data.data
    })
  }

  public async getProductBySkuList(skuIds: any[]): Promise<Product[]> {
    const query_products = encodeURIComponent(skuIds?.join(','));
    return this.client.get(`/catalog/products?sku:in=${query_products}`).then((data: any) => {
      return data.data
    })
  }



  //Implement Custom method not covered by BigcommerceWrapper
  // Start Blog Categories
  public async getCategories(): Promise<CatalogCategory[]> {
    return this.client.get(`/catalog/categories`).then((data: any) => {
      return data.data;
    });
  }

  public async getPaginatedCategories(params = ''): Promise<CatalogCategory[]> {
    const ret: CatalogCategory[] = [];
    let hasPage = true;
    let queryParam = params;

    do {
      const result = await this.client.get(`/catalog/categories${queryParam}`);
      if (result && result.meta) {
        ret.push(...result.data);

        queryParam = result.meta?.pagination?.links?.next;
        hasPage = !!queryParam;
      }
    } while (hasPage);

    return ret;
  }


  public async getCategoryByName(name: string): Promise<CatalogCategory[]> {
    const query = encodeURIComponent(name);

    return this.client.get(`/catalog/categories?name=${query}`).then((data: any) => {
      return data.data;
    });

  }
  public async getCategoriesByIds(query_categories: any[]): Promise<CatalogCategory[]> {
    let query_cat = encodeURIComponent(query_categories?.join(','));

    return this.client.get(`/catalog/categories?id:in=${query_cat}`).then((data: any) => {
      return data.data;
    });

  }
  public async getCategoriesById(id: any): Promise<CatalogCategory[]> {

    return this.client.get(`/catalog/categories/${id}`).then((data: any) => {
      return [data.data];
    });


  }

  public async createCategories(category: CatalogCategory): Promise<any> {
    return this.client.post(`/catalog/categories`, category).then((data: any) => {
      const category: any = data.data;
      return category;
    });
  }

  public async deleteCategoryById(category_id: any): Promise<void> {
    return await this.client.delete(`/catalog/categories/${category_id}`);
  }

  public async updateCategoryById(category_id: any, category: CatalogCategory): Promise<CatalogCategory> {
    return this.client.put(`/catalog/categories/${category_id}`, category).then((data: any) => {
      return data.data;
    });
  }
  // End Blog Categories

  // Start Blog Post
  public async getBlogPosts(): Promise<BlogPost[]> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/blog/posts`).then((data: any) => {
      const blogPosts: [] = data;
      return blogPosts;
    });
  }

  public async createBlogPost(blogPost: BlogPost): Promise<BlogPost> {
    this.client.apiVersion = 'v2';
    return this.client.post(`/blog/posts`, blogPost).then((data: any) => {
      return data;
    });
  }

  public async deleteBlogPostById(id: any): Promise<void> {
    this.client.apiVersion = 'v2';
    return await this.client.delete(`/blog/posts/${id}`);
  }

  public async updateBlogPost(id: any, blogPost: BlogPost): Promise<BlogPost> {
    this.client.apiVersion = 'v2';
    return this.client.put(`/blog/posts/${id}`, blogPost).then((data: any) => {
      return data;
    });
  }


  public async getBlogPostByURL(url: string): Promise<BlogPost[]> {
    const query_blogpost = encodeURIComponent(url);
    logger.info(`query_blogpostquery_blogpost ${query_blogpost}`)
    this.client.apiVersion = 'v2';
    return this.client.get(`/blog/posts?url=${query_blogpost}`).then((data: any) => {
      return data
    });
  }
  //posts?url
  // End Blog Post

  // Start Brands
  public async createBrand(brand: Brand): Promise<Brand> {
    return this.client.post(`/catalog/brands`, brand).then((data: any) => {
      const blogPosts: [] = data.data;
      return blogPosts;
    });
  }
  public async getBrandById(brand_id: any): Promise<Brand> {
    if (brand_id) {
      return this.client.get(`/catalog/brands/${brand_id}`).then((data: any) => {
        return data.data;
      });
    }
  }

  public async getBrandByIds(query_brands: any[]): Promise<Brand[]> {
    const query_brnd = encodeURIComponent(query_brands?.join(','));
    return this.client.get(`/catalog/brands?id:in=${query_brnd}`).then((data: any) => {
      return data.data;
    });
  }

  public async getBrandByName(name: string): Promise<Brand> {
    return this.client.get(`/catalog/brands?name=${name}`).then((data: any) => {
      return data.data;
    });
  }

  public async deleteBrandById(brand_id: any): Promise<void> {
    return await this.client.delete(`/catalog/brands/${brand_id}`);
  }

  public async updateBrand(brand_id: any, brand: Brand): Promise<Brand> {
    return this.client.put(`/catalog/brands/${brand_id}`, brand).then((data: any) => {
      return data.data;
    });
  }

  public async getBrands(): Promise<Brand[]> {
    return this.client.get(`/catalog/brands`).then((data: any) => {
      const brands: [] = data.data;
      return brands;
    });
  }

  public async getPaginatedBrands(params = ''): Promise<Brand[]> {
    const ret: Brand[] = [];
    let hasPage = true;
    let queryParam = params;

    do {
      const result = await this.client.get(`/catalog/brands${queryParam}`);
      if (result && result.meta) {
        ret.push(...result.data);

        queryParam = result.meta?.pagination?.links?.next;
        hasPage = !!queryParam;
      }
    } while (hasPage);

    return ret;
  }

  //End Brands

  // Start Pages
  public async getPages(): Promise<[Page]> {
    try {
      return await this.client.get('/content/pages');
    } catch {
      return null;
    }
  }
}

export default TranzettaWrapper;
