import { ApiKeys } from './bigcommerce-helper';
import BigcommerceHelper from './bigcommerce-helper';
import { Category, Metafields, Product, ProductDetail, variants } from './interfaces/products.interface';
import { Variant } from './interfaces/variant.interface';
import { ProductOption } from './interfaces/product-options.interface';
import { OptionValue } from './interfaces/option-value.interface';
import { Order } from './interfaces/orders.interface';
import { BigCommerceWebhook, BigCommerceWebhookResponseData, Webhook } from '@/interfaces/webhooks.interface';
import { ObjectId } from 'mongoose';
import { logger } from '@/utils/logger';

class BigcommerceWrapper extends BigcommerceHelper {
  private products: Product[];
  private product: Product;
  private orders: Order[];
  private order: Order;

  public async init(id: ObjectId): Promise<void> {
    await this.initHelper(id);
  }

  public async initSync(apiKeys: ApiKeys): Promise<void> {
    await this.initSyncHelper(apiKeys);
  }

  public async getProducts(params = ''): Promise<Product[]> {
    const ret: Product[] = [];
    let hasPage = true;
    let queryParam = params;

    do {
      const result = await this.client.get(`/catalog/products${queryParam}`);
      if (result && result.meta) {
        ret.push(...result.data);

        queryParam = result.meta?.pagination?.links?.next;
        hasPage = !!queryParam;
      }
    } while (hasPage);

    return ret;
  }

  public async getProductBySku(sku: string): Promise<Product> {
    return this.client.get(`/catalog/products?sku=${encodeURIComponent(sku)}`).then((data: any) => {
      if (data.data.length) {
        const product: Product = data.data[0];
        return product;
      } else return null;
    });
  }

  public async getProduct(id: number): Promise<Product> {
    this.client.apiVersion = 'v3';
    return this.client
      .get(`/catalog/products/${id}`)
      .then((data: any) => {
        const product: Product = data.data;
        return product;
      })
      .catch(err => {
        console.log('What is err', err);
      });
  }

  public async getNFTCategory(): Promise<Product> {
    this.client.apiVersion = 'v3';
    return this.client
      .get(`/catalog/trees/categories?name=NFT`)
      .then((data: any) => {
        // const product: Product = data.data;
        return data.data;
      })
      .catch(err => {
        console.log('What is err', err);
      });
  }

  public async createNFTCategory(NFTdata: any): Promise<Product> {
    this.client.apiVersion = 'v3';
    return this.client
      .post(`/catalog/categories`, NFTdata)
      .then((data: any) => {
        // const product: Product = data.data;
        return data.data;
      })
      .catch(err => {
        console.log('What is err', err);
      });
  }

  public async getProductWithCustomFields(id: number): Promise<Product> {
    this.client.apiVersion = 'v3';
    return this.client
      .get(`/catalog/products/${id}?include=custom_fields,primary_image`)
      .then((data: any) => {
        const product: Product = data.data;
        return product;
      })
      .catch(err => {
        console.log('What is err', err);
      });
  }

  public async createProduct(product: Product): Promise<Product> {
    return this.client.post(`/catalog/products`, product).then((data: any) => {
      const product: Product = data.data;
      return product;
    });
  }

  public async updateProduct(id: number, product: Product): Promise<Product> {
    return this.client.put(`/catalog/products/${id}`, product).then((data: any) => {
      const product: Product = data.data;
      return product;
    });
  }

  public async deleteProduct(id: number): Promise<void> {
    return this.client.delete(`/catalog/products/${id}`);
  }

  public async getCustomer(id: number | string): Promise<any> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/customers/${id}`).then((data: any) => {
      return data;
    });
  }

  public async updateCustomer(customer: any): Promise<any> {
    return this.client.put(`/customers`, customer).then((data: any) => {
      const customer: any = data.data;
      return customer;
    });
  }

  public async getOrders(): Promise<Order[]> {
    // Need to switch to API Version 2 when using this route
    // since GET,READ,UPDATE,DELETE Order belongs to BigCommerce API Version 2
    this.client.apiVersion = 'v2';
    return this.client.get('/orders').then((data: any) => {
      const orders: Order[] = data;
      return orders;
    });
  }

  public async getOrdersQuery(params = ''): Promise<Order[]> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/orders${params}`).then((data: any) => {
      const orders: Order[] = data;
      return orders;
    });
  }

  public async getOrder(id: number): Promise<Order> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/orders/${id}`).then((data: any) => {
      const order: Order = data;
      return order;
    });
  }

  // TODO: Change Type
  public async getOrderProducts(id: number): Promise<any> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/orders/${id}/products`).then((data: any) => {
      const order: Order = data;
      return order;
    });
  }

  public async getOrderShippingAddresses(id: number): Promise<any> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/orders/${id}/shipping_addresses`).then((data: any) => {
      const order: Order = data;
      return order;
    });
  }

  public async createOrder(order: Order): Promise<Order> {
    this.client.apiVersion = 'v2';
    return this.client.post(`/orders`, order).then((data: any) => {
      const order: Order = data;
      return order;
    });
  }

  public async updateOrder(orderId: number, order: Order): Promise<Order> {
    this.client.apiVersion = 'v2';
    return this.client.put(`/orders/${orderId}`, order).then((data: any) => {
      const order: Order = data;
      return order;
    });
  }

  public async deleteOrder(orderId: number): Promise<void> {
    this.client.apiVersion = 'v2';
    return this.client.delete(`/orders/${orderId}`);
  }

  public async registerWebhook(scope: string, destination: string, name = ''): Promise<BigCommerceWebhook> {
    const webhooks = await this.getWebhooks();
    const findWebhook = await webhooks.data.find(e => e.scope == scope && e.destination == destination);
    if (!findWebhook) {
      logger.info(`${name}: Bigcommerce Webhook Registration - ${scope}`);
      return this.client
        .post('/hooks', {
          scope: scope,
          destination: destination,
          is_active: true,
          headers: {
            [process.env.HEADER]: process.env.HEADER_VALUE,
          },
        })
        .then(data => {
          const webhook: BigCommerceWebhook = data;
          return webhook;
        });
    } else {
      return findWebhook;
    }
  }

  // TODO - Replace Return Type
  public async getWebhooks(): Promise<any> {
    return this.client.get('/hooks');
  }

  // TODO - Replace Return Type
  public async updateWebhook(id: string, webhook: Webhook): Promise<void> {
    return this.client.put(`/hooks/${id}`, webhook).then((data: any) => {
      const webhook: Webhook = data;
      return webhook;
    });
  }

  // TODO - Replace Return Type
  public async deleteWebhook(id: string): Promise<void> {
    return this.client.delete(`/hooks/${id}`);
  }

  // TODO - Replace Return Type
  public async onOrderCreated(data: BigCommerceWebhookResponseData): Promise<string> {
    console.log('Order Created', data);
    return 'test';
  }

  // TODO - Replace Return Type
  public async onOrderUpdated(data: BigCommerceWebhookResponseData): Promise<string> {
    console.log('Order Updated', data);
    return 'test';
  }

  public async getProductVariants(productId: number): Promise<Variant[]> {
    return this.client.get(`/catalog/products/${productId}/variants`).then((data: any) => {
      const variant: Variant[] = data.data;
      return variant;
    });
  }

  public async getProductVariant(productId: number, variantId: number): Promise<Variant> {
    return this.client.get(`/catalog/products/${productId}/variants/${variantId}`).then((data: any) => {
      const variant: Variant = data.data;
      return variant;
    });
  }

  public async createProductVariant(productId: number, variant: Variant): Promise<Variant> {
    return this.client.post(`/catalog/products/${productId}/variants`, variant).then((data: any) => {
      const variant: Variant = data.data;
      return variant;
    });
  }

  public async updateProductVariant(productId: number, variantId: number, variant: Variant): Promise<Variant> {
    return this.client.put(`/catalog/products/${productId}/variants/${variantId}`, variant).then((data: any) => {
      const variant: Variant = data.data;
      return variant;
    });
  }

  public async deleteProductVariant(productId: number, variantId: number): Promise<void> {
    return this.client.delete(`/catalog/products/${productId}/variants/${variantId}`);
  }

  public async createProductVariantImage(productId: number, variantId: number, imageUrl: string): Promise<void> {
    const postData = {
      image_url: imageUrl,
    };

    return this.client.post(`/catalog/products/${productId}/variants/${variantId}/image`, postData);
  }

  public async getProductOptions(productId: number): Promise<ProductOption[]> {
    return this.client.get(`/catalog/products/${productId}/options`).then((data: any) => {
      const option: ProductOption[] = data.data;
      return option;
    });
  }

  public async createProductOption(productId: number, option: ProductOption): Promise<ProductOption> {
    return this.client.post(`/catalog/products/${productId}/options`, option).then((data: any) => {
      const option: ProductOption = data.data;
      return option;
    });
  }

  public async getProductOption(productId: number, optionId: number): Promise<ProductOption> {
    return this.client.get(`/catalog/products/${productId}/options/${optionId}`).then((data: any) => {
      const option: ProductOption = data.data;
      return option;
    });
  }

  public async updateProductOption(productId: number, optionId: number, option: ProductOption): Promise<ProductOption> {
    return this.client.put(`/catalog/products/${productId}/options/${optionId}`, option).then((data: any) => {
      const option: ProductOption = data.data;
      return option;
    });
  }

  public async deleteProductOption(productId: number, optionId: number): Promise<void> {
    return this.client.delete(`/catalog/products/${productId}/options/${optionId}`);
  }

  public async getOptionValues(productId: number, optionId: number): Promise<[OptionValue]> {
    return this.client.get(`/catalog/products/${productId}/options/${optionId}/values`).then((data: any) => {
      const option_values: [OptionValue] = data.data;
      return option_values;
    });
  }

  public async createOptionValue(productId: number, optionId: number, optionValue: OptionValue): Promise<OptionValue> {
    return this.client.post(`/catalog/products/${productId}/options/${optionId}/values`, optionValue).then((data: any) => {
      const option_value: OptionValue = data.data;
      return option_value;
    });
  }

  public async getOptionValue(productId: number, optionId: number, optionValueId: number): Promise<OptionValue> {
    return this.client.get(`/catalog/products/${productId}/options/${optionId}/values/${optionValueId}`).then((data: any) => {
      const option_value: OptionValue = data.data;
      return option_value;
    });
  }

  public async updateOptionValue(productId: number, optionId: number, optionValueId: number, optionValue: OptionValue): Promise<OptionValue> {
    return this.client.put(`/catalog/products/${productId}/options/${optionId}/values/${optionValueId}`, optionValue).then((data: any) => {
      const option_value: OptionValue = data.data;
      return option_value;
    });
  }

  public async deleteOptionValue(productId: number, optionId: number, optionValueId: number): Promise<void> {
    return this.client.delete(`/catalog/products/${productId}/options/${optionId}/values/${optionValueId}`);
  }

  public async createMetafields(productId: number, metafield: Metafields): Promise<void> {
    return this.client.post(`/catalog/products/${productId}/metafields`, metafield).then((data: any) => {
      const metafield: Metafields = data.data;

      return metafield;
    });
  }

  public async updateMetafields(productId: number, metafieldId: number, metafield: Metafields): Promise<void> {
    return this.client.put(`/catalog/products/${productId}/metafields/${metafieldId}`, metafield).then((data: any) => {
      const metafield: Metafields = data.data;

      return metafield;
    });
  }

  public async getMetafields(productId: number): Promise<void> {
    return this.client.get(`/catalog/products/${productId}/metafields`).then((data: any) => {
      const metafield: Metafields = data.data;

      return metafield;
    });
  }

  public async getVariants(params = ''): Promise<void> {
    return this.client.get(`/catalog/variants${params}`).then((data: any) => {
      const variants: any = data.data;

      return variants;
    });
  }

  public async createProductVariantsMetafield(productId: number, variantId, metafield: any): Promise<void> {
    return this.client.post(`/catalog/products/${productId}/variants/${variantId}/metafields`, metafield).then((data: any) => {
      const metafield: any = data.data;

      return metafield;
    });
  }

  public async updateProductVariantsMetafield(productId: number, variantId: number, metafieldId: number, metafield: any): Promise<void> {
    return this.client.put(`/catalog/products/${productId}/variants/${variantId}/metafields/${metafieldId}`, metafield).then((data: any) => {
      const metafield: any = data.data;

      return metafield;
    });
  }

  public async getProductVariantsMetafields(productId: number, variantId: number): Promise<void> {
    return this.client.get(`/catalog/products/${productId}/variants/${variantId}/metafields`).then((data: any) => {
      const metafield: any = data.data;

      return metafield;
    });
  }

  public async getOrderTransactions(orderId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/orders/${orderId}/transactions`).then((data: any) => {
      return data;
    });
  }

  public async getProductDetail(productId: number): Promise<ProductDetail | null> {
    this.client.apiVersion = 'v3';
    const queries = ['images', 'custom_fields']

    const query_include = encodeURIComponent(queries.join());

    let result = await this.client.get(`/catalog/products/${productId}?include=${query_include}`);
    this.client.apiVersion = 'v2';
    const store = await this.client.get(`/store`);
    this.client.apiVersion = 'v3';
    const storeUrl = store.secure_url;
    if (result) {
      const product: Product = result.data;

      const query_categories = encodeURIComponent(product.categories?.join(','));
      result = await this.client.get(`/catalog/categories?id:in=${query_categories}`);
      const categories: Category[] = result.data;

      const ret: ProductDetail = {
        id: product.id,
        name: product.name,
        description: product.description,
        brand: null,
        sku: product.sku,
        barcode: product.upc,
        type: product.type,
        url: `${storeUrl}${product.custom_url.url}`,
        weight: product.weight,
        width: product.width,
        depth: product.depth,
        height: product.height,
        price: product.retail_price,
        cost: product.cost_price,
        regularPrice: product.price,
        createdOn: product.date_created,
        updatedOn: product.date_modified,
        taxable: !!product.tax_class_id,
        metaData: [product.meta_description],
        keywords: [product.search_keywords],
        rating: (product.total_sold / product.view_count) * 100,
        soldCount: product.total_sold,
        inventory: {
          name: product.inventory_tracking,
          quantity: product.inventory_level,
        },
        variants: [],
        options: [],
        retailPrice: product.retail_price,
        availability: product.availability,
        isFeatured: product.is_featured,
        sortOrder: product.sort_order,
        categories: categories.map(ii => ({ id: ii.id, name: ii.name })),
        images: product.images.map(ii => ({ id: ii.id, standard: ii.url_standard, thumbnail: ii.url_thumbnail })),
        customFields: product.custom_fields.map(ii => ({id: ii.id, name: ii.name, value: ii.value}))
      };

      if (product.brand_id) {
        const brand_query_include_fields = encodeURIComponent('id,name');
        result = await this.client.get(`/catalog/brands/${product.brand_id}?include_fields=${brand_query_include_fields}`);
        ret.brand = result.data.name;
      }

      result = await this.client.get(`/catalog/products/${productId}/variants`);
      if (Array.isArray(result.data) && result.data.length > 0) {
        const variants: variants[] = result.data;

        const variant_options: { [key: string]: boolean } = {};
        for (let xx = 0; xx < variants.length; xx++) {
          const variant = variants[xx];

          variant.option_values.forEach(ii => (variant_options[ii.label] = true));
          const variant_name = variant.option_values.map(ii => ii.label).join(' ');

          ret.variants.push({
            name: `${product.name} ${variant_name}`,
            barcode: variant.upc,
            cost: variant.cost_price,
            depth: variant.depth,
            height: variant.height,
            price: variant.price,
            sku: variant.sku,
            weight: variant.weight,
            width: variant.width,
          });
        }

        ret.options = Object.keys(variant_options);
      }

      return ret;
    }

    return null;
  }

  public async getOrderCoupons(orderId: number | String): Promise<void> {
    this.client.apiVersion = 'v2';
    return this.client.get(`/orders/${orderId}/coupons`).then((data: any) => {
      return data;
    });
  }

  public async getScripts(): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/content/scripts`).then((data: any) => {
      return data;
    });
  }

  public async getScript(scriptId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/content/scripts/${scriptId}`).then((data: any) => {
      return data;
    });
  }

  public async createScript(scriptData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.post(`/content/scripts`, scriptData).then((data: any) => {
      return data;
    });
  }

  public async updateScript(scriptId: number | String, scriptData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.put(`/content/scripts${scriptId}`, scriptData).then((data: any) => {
      return data;
    });
  }

  public async deleteScript(scriptId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.delete(`/content/scripts/${scriptId}`);
  }

  public async getWidgetTemplates(): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/content/widget-templates`).then((data: any) => {
      return data;
    });
  }

  public async getWidgetTemplate(widgetTemplateId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/content/widget-templates${widgetTemplateId}`).then((data: any) => {
      return data;
    });
  }

  public async updateWidgetTemplate(widgetTemplateId: number | String, widgetTemplateData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.post(`/content/widget-templates${widgetTemplateId}`, widgetTemplateData).then((data: any) => {
      return data;
    });
  }

  public async createWidgetTemplate(widgetTemplateData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.post(`/content/widget-templates`, widgetTemplateData).then((data: any) => {
      return data;
    });
  }

  public async deleteWidgetTemplate(widgetTemplateId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.delete(`/content/widget-templates/${widgetTemplateId}`);
  }

  public async getWidgets(): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/content/widgets`).then((data: any) => {
      return data;
    });
  }

  public async getWidget(widgetId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.get(`/content/widgets${widgetId}`).then((data: any) => {
      return data;
    });
  }

  public async updateWidget(widgetId: number | String, widgetData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.post(`/content/widgets${widgetId}`, widgetData).then((data: any) => {
      return data;
    });
  }

  public async createWidget(widgetData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.post(`/content/widgets`, widgetData).then((data: any) => {
      return data;
    });
  }

  public async deleteWidget(widgetId: number | String): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.delete(`/content/widgets/${widgetId}`);
  }

  public async updateCart(cartId: string, lineItemId: string, cartData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.put(`/carts/${cartId}/items/${lineItemId}`, cartData).then((data: any) => {
      return data;
    });
  }

  public async addCartLineItem(cartId: string, cartData: any): Promise<void> {
    this.client.apiVersion = 'v3';
    return this.client.post(`/carts/${cartId}/items`, cartData).then((data: any) => {
      return data;
    });
  }
}

export default BigcommerceWrapper;
