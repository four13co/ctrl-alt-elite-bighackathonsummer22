import AcumaticaWrapper from '@/apis/acumatica/acumatica-wrapper';
import { Organization } from '@/interfaces/organizations.interface';
import organizationModel from '@/models/organizations.model';
import { AppType } from '@/enums/app-type.enum';
import ShopifyWrapper from '@apis/shopify/shopify-wrapper';
import ErrorHandle from '@utils/ErrorHandle';
import util from 'util';

import FormData from 'form-data';
import fetch, { RequestInit } from 'node-fetch';
import { Blob } from 'buffer';

class ProductService {
  public async createProduct(sku): Promise<any> {
    console.log('creating alternate products');
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const shopifyWrapper = new ShopifyWrapper();
    await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

    let product: any = [];
    try {
      console.log('fetching acumatica products');
      product = await acumaticaWrapper.getProduct(`${sku}?$expand=CrossReferences,Categories,WarehouseDetails`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }
    const crossReferences = [...new Set([sku, ...product.CrossReferences.map(cr => this.hasWhiteSpace(cr.AlternateID.value))])];

    const gqlQueryParams = crossReferences.map(cr => `sku:${cr}`).join(' OR ');

    const gqlProductVariants = {
      query: `
        {
          productVariants(first: 50, query: "${gqlQueryParams}") {
              edges {
                  node {
                      sku
                      product {
                        images(first:10){
                          edges{
                              node {
                                id
                                src
                              }
                          }
                        }
                      }
                  }
              }
          }
        }
      `,
    };

    const categories = product.Categories.map(cat => cat.CategoryID.value);
    console.log('Fetching Acumatica Categories');
    const tags = await acumaticaWrapper.getCategory(`?$select=CategoryID,Description`);

    const category = tags
      .filter(item => categories.includes(item.CategoryID.value))
      .map(t => t.Description.value)
      .join(',');

    console.log('fetching shopify products');
    let shopifyProductsFresh = await shopifyWrapper.graphQl(gqlProductVariants);

    let shopifyProducts = shopifyProductsFresh.data?.productVariants.edges.map(pv => {
      const p = pv.node;
      return {
        sku: p.sku,
      };
    });
    let shopifyMainProduct = shopifyProducts.find(sp => sp.sku == sku);
    shopifyProducts = shopifyProducts.map(sp => sp.sku).filter(sp => sp != sku);

    //todo check if main SKU exist
    if (shopifyMainProduct === undefined) {
      console.log('no primary product in shopify');
      let reprocess = true;
      let count = 1;

      while(reprocess) {
        console.log(`${count} retry in 3 mins`);
        await new Promise(r => setTimeout(r, 180000));

        console.log('refetching shopify products');
        shopifyProductsFresh = await shopifyWrapper.graphQl(gqlProductVariants);

        shopifyProducts = shopifyProductsFresh.data?.productVariants.edges.map(pv => {
          const p = pv.node;
          return {
            sku: p.sku,
          };
        });
        shopifyMainProduct = shopifyProducts.find(sp => sp.sku == sku);
        shopifyProducts = shopifyProducts.map(sp => sp.sku).filter(sp => sp != sku);

        if(shopifyMainProduct !== undefined) {
          console.log('Primary product found in shopify')
          reprocess = false
        }

        if(count === 3) {
          reprocess = false
        }

        count++;
      }

      if(shopifyMainProduct === undefined) {
        console.log('no primary product in reprocessing');
        throw new ErrorHandle(404, 'no primary product in shopify');
      }
    }

    let images = shopifyProductsFresh.data?.productVariants.edges.find(pvf => {
      const p = pvf.node;
      return p.sku === sku;
    });
    images = images.node.product.images.edges.map(i => ({
      src: i.node.src,
    }));

    //todo check if alternate id exist in shopify
    const alternateIds = crossReferences.filter(cr => cr !== sku);
    const notExistingAlternateId = alternateIds.filter(item => !shopifyProducts.includes(item));
    if (notExistingAlternateId.length < 1) {
      console.log('all alternate id already exist in shopify');
      return { message: 'all alternate id already exist in shopify' };
    }
    const gqlLocations = {
      query: `
        {
          locations(first:1){
            edges{
              node {
                id
              }
            }
          }
        }
      `,
    };

    const locations = await shopifyWrapper.graphQl(gqlLocations);
    const locationID = locations.data.locations.edges[0].node.id;

    let quantity = 0;
    if (product.WarehouseDetails.length > 0) {
      quantity = product.WarehouseDetails.reduce((total, wd) => total + wd.QtyOnHand.value, 0);
    }
    let res = [];
    const trueDescription = this.getDescription(product.Description.value);
    for (let i = 0; i < notExistingAlternateId.length; i++) {
      console.log(`creating product for sku ${notExistingAlternateId[i]}`);
      const gqlProductInput = {
        title: trueDescription,
        productType: product.ItemClass.value || '',
        descriptionHtml: product.Content.value || '',
        status: product.Visibility.value === 'Invisible' ? 'DRAFT' : 'ACTIVE',
        tags: category,
        published: true,
        publishedAt: new Date(),
        variants: {
          sku: notExistingAlternateId[i],
          weight: product.DimensionWeight.value,
          weightUnit: 'POUNDS',
          requiresShipping: true,
          taxable: product.TaxCategory.value === 'TAXABLE' ? true : false,
          compareAtPrice: product.MSRP.value || 0,
          price: product.DefaultPrice.value || 0,
          inventoryManagement: 'SHOPIFY',
          inventoryQuantities: {
            availableQuantity: quantity,
            locationId: locationID,
          },
        },
        images,
        seo: {
          description: product.MetaDescription.value || '',
          title: product.PageTitle.value || '',
        },
      };

      const gqlProduct = {
        query: `
            mutation CreateProduct($input: ProductInput!){
              productCreate(input: $input) {
                product{
                  id
                }
              }
            }
          `,
        variables: { input: gqlProductInput },
      };

      res = [...res, await shopifyWrapper.graphQl(gqlProduct)];
    }

    return { crossReferences, res, product, shopifyProducts, shopifyMainProduct, notExistingAlternateId };
  }

  public async deleteProduct(AI): Promise<any> {
    console.log('deleting alternate products');
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const shopifyWrapper = new ShopifyWrapper();
    await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

    const alternateId = [...new Set(AI)];
    const gqlQueryParams = alternateId.map(cr => `sku:${cr}`).join(' OR ');

    const gqlProductVariants = {
      query: `
        {
          productVariants(first: 50, query: "${gqlQueryParams}") {
              edges {
                  node {
                      sku
                      product{
                        id
                      }
                  }
              }
          }
        }
      `,
    };

    let shopifyProducts = await shopifyWrapper.graphQl(gqlProductVariants);
    shopifyProducts = shopifyProducts.data.productVariants.edges.map(pv => {
      const p = pv.node;
      return {
        id: p.product.id,
      };
    });

    if (shopifyProducts.length < 1) {
      throw new ErrorHandle(404, 'no more products to delete');
    }

    let res = [];
    for (let i = 0; i < shopifyProducts.length; i++) {
      const gqlProduct = {
        query: `
        mutation ProductDelete($input: ProductDeleteInput!){
          productDelete(input: $input) {
            deletedProductId
          }
        }
      `,
        variables: { input: shopifyProducts[i] },
      };
      res = [...res, await shopifyWrapper.graphQl(gqlProduct)];
    }

    console.log(res);
    return { shopifyProducts, res };
  }

  public async uploadImages(sku): Promise<any> {
    const formData = new FormData();
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const shopifyWrapper = new ShopifyWrapper();
    await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

    let product: any = [];
    try {
      product = await acumaticaWrapper.getProduct(`${sku}?$expand=CrossReferences,Categories,Files`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }

    const fileId = product.files[0].id;
    const imageData = await acumaticaWrapper.getFile(fileId);

    const blob = new Blob([imageData]);

    // newer promise based version of img.onload

    formData.append('productImage', blob);

    const gqlStageUpload = {
      query: `
        mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets {
                resourceUrl
                url
                parameters {
                  name
                  value
                }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          filename: '42424.png',
          httpMethod: 'POST',
          mimeType: 'image/png',
          resource: 'COLLECTION_IMAGE',
        },
      },
    };

    const data = await shopifyWrapper.graphQl(gqlStageUpload);
    const [{ url, parameters }] = data.data.stagedUploadsCreate.stagedTargets;

    parameters.forEach(({ name, value }) => {
      formData.append(name, value);
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const key = parameters.find(p => p.name === 'key');
    const gqlCollection = {
      query: `
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
            image {
              originalSrc
            }
          }
          userErrors {
            field
            message
          }
        }
      }
      `,
      variables: {
        input: {
          id: 'gid://shopify/Collection/267919523990',
          image: {
            src: `${url}/${key.value}`,
          },
        },
      },
    };

    const data2 = await shopifyWrapper.graphQl(gqlCollection);

    return { formData, product, response, data, data2 };
  }

  public async updateAlternateProduct(sku): Promise<any> {
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const shopifyWrapper = new ShopifyWrapper();
    await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

    let product: any = [];
    try {
      console.log('Fetching Acumatica Product');
      product = await acumaticaWrapper.getProduct(`${sku}?$expand=CrossReferences,Categories`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }

    if (!product.ExportToExternal.value) {
      console.log('export to external is false');
      return { message: 'export to external is false' };
    }

    const categories = product.Categories.map(cat => cat.CategoryID.value);
    console.log('Fetching Acumatica Categories');
    const tags = await acumaticaWrapper.getCategory(`?$select=CategoryID,Description`);

    const category = tags
      .filter(item => categories.includes(item.CategoryID.value))
      .map(t => t.Description.value)
      .join(',');

    const crossReferences = [...new Set(product.CrossReferences.map(cr => this.hasWhiteSpace(cr.AlternateID.value)))];

    const gqlQueryParams = crossReferences.map(cr => `sku:${cr}`).join(' OR ');

    const gqlProductVariants = {
      query: `
        {
          productVariants(first: 50, query: "${gqlQueryParams}") {
              edges {
                  node {
                      sku
                      product{
                        id
                        variants(first: 1){
                          edges{
                              node{
                                  id
                              }
                          }
                      }
                      }
                  }
              }
          }
        }
      `,
    };

    console.log('Fetching shopify Products');
    let shopifyProducts = await shopifyWrapper.graphQl(gqlProductVariants);
    const trueDescription = this.getDescription(product.Description.value);
    shopifyProducts = shopifyProducts.data.productVariants.edges.map(sp => ({
      id: sp.node.product.id,
      title: trueDescription,
      productType: product.ItemClass.value || '',
      descriptionHtml: product.Content.value || '',
      status: product.Visibility.value === 'Invisible' ? 'DRAFT' : 'ACTIVE',
      tags: category,
      variants: {
        id: sp.node.product.variants.edges[0].node.id,
        weight: product.DimensionWeight.value,
        weightUnit: 'POUNDS',
        requiresShipping: true,
        taxable: product.TaxCategory.value === 'TAXABLE' ? true : false,
        compareAtPrice: product.MSRP.value || 0,
        price: product.DefaultPrice.value || 0,
      },
      seo: {
        description: product.MetaDescription.value || '',
        title: product.PageTitle.value || '',
      },
    }));

    let res = [];
    for (let i = 0; i < shopifyProducts.length; i++) {
      console.log(`updating product ${shopifyProducts[i].id}`);
      const gqlUpdateProduct = {
        query: `
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { input: shopifyProducts[i] },
      };
      res = [...res, await shopifyWrapper.graphQl(gqlUpdateProduct)];
    }

    console.log(res);
    return { product, shopifyProducts };
  }

  public hasWhiteSpace(s) {
    return s.replace(/\s/g, '');
  }

  public async iceeInit(): Promise<any> {
    console.log('creating alternate products');
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);

    const urlParams1 = new URLSearchParams();
    urlParams1.set('$filter', ['ExportToExternal eq true'].join(','));
    const urlParams2 = new URLSearchParams();
    urlParams2.set('$select', ['ExportToExternal', 'InventoryID'].join(','));

    const acumaticaProducts = await acumaticaWrapper.getProducts(`?${urlParams1}&${urlParams2}`);

    const acID = acumaticaProducts.map(ap => ap.InventoryID.value);

    let res = [];
    for (let i = 0; i < acID.length; i++) {
      console.log(`creating alternate products for sku: ${acID[i]}`);
      res = [...res, await this.createProduct(acID[i].trim())];
    }

    console.log(res);
    return { acID, res };
  }

  public async stockAvailability(id): Promise<any> {
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const shopifyWrapper = new ShopifyWrapper();
    await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

    let product: any = [];
    try {
      console.log('Fetching Acumatica Product');
      product = await acumaticaWrapper.getProduct(`${id}?$expand=CrossReferences,WarehouseDetails`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }

    if (!product.ExportToExternal.value) {
      console.log('export to external is false');
      return { message: 'export to external is false' };
    }

    const crossReferences = [...new Set(product.CrossReferences.map(cr => this.hasWhiteSpace(cr.AlternateID.value)))];

    const gqlQueryParams = crossReferences.map(cr => `sku:${cr}`).join(' OR ');
    const gqlProductVariants = {
      query: `
        {
          productVariants(first: 50, query: "${gqlQueryParams}") {
              edges {
                  node {
                      sku
                      product{
                        id
                        variants(first: 1){
                          edges{
                              node{
                                  id
                              }
                          }
                      }
                      }
                  }
              }
          }
        }
      `,
    };

    console.log('fetching shopify products');
    let shopifyProducts = await shopifyWrapper.graphQl(gqlProductVariants);

    const gqlLocations = {
      query: `
      {
        locations(first:1){
            edges{
                node {
                    id
                }
            }
        }
      }
    `,
    };
    console.log('fetching location in shopify');
    const locations = await shopifyWrapper.graphQl(gqlLocations);
    const locationID = locations.data.locations.edges[0].node.id;

    let quantity = 0;
    if (product.WarehouseDetails.length > 0) {
      quantity = product.WarehouseDetails.reduce((total, wd) => total + wd.QtyOnHand.value, 0);
    }

    shopifyProducts = shopifyProducts.data.productVariants.edges.map(sp => ({
      id: sp.node.product.id,
      variants: {
        id: sp.node.product.variants.edges[0].node.id,
        inventoryManagement: 'SHOPIFY',
        inventoryQuantities: {
          availableQuantity: quantity,
          locationId: locationID,
        },
      },
    }));

    let res = [];
    for (let i = 0; i < shopifyProducts.length; i++) {
      console.log(`updating product stocks ${shopifyProducts[i].id}`);
      const gqlUpdateProduct = {
        query: `
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { input: shopifyProducts[i] },
      };
      res = [...res, await shopifyWrapper.graphQl(gqlUpdateProduct)];
    }

    console.log(res);
    return { crossReferences, shopifyProducts, res };
  }

  public async productImages(shopifyProductID, productImageID): Promise<any> {
    const org = 'ICEE';
    const icee: Organization = await organizationModel.findOne({ name: org }).populate('apps');

    const acumaticaWrapper = new AcumaticaWrapper();
    await acumaticaWrapper.init(icee.apps.find(ii => ii.type == AppType.Acumatica)._id);
    const shopifyWrapper = new ShopifyWrapper();
    await shopifyWrapper.init(icee.apps.find(ii => ii.type == AppType.Shopify)._id);

    const gqlProduct = {
      query: `
        {
          product(id: "${shopifyProductID}") {
              images(first:10){
                  edges{
                      node {
                        id
                        url
                      }
                  }
              }
              variants(first:1){
                  edges {
                      node{
                          sku
                      }
                  }
              }
          }
        }
      `,
    };

    console.log('fetching shopify products');
    const shopifyProducts = await shopifyWrapper.graphQl(gqlProduct);

    const images = shopifyProducts.data.product.images.edges.map(i => ({ src: i.node.url }));
    const sku = shopifyProducts.data.product.variants.edges[0].node.sku;

    let product: any = [];
    try {
      console.log('Fetching Acumatica Product');
      product = await acumaticaWrapper.getProduct(`${sku}?$expand=CrossReferences`);
    } catch (error) {
      throw new ErrorHandle(404, `product not found`);
    }

    const crossReferences = [...new Set(product.CrossReferences.map(cr => this.hasWhiteSpace(cr.AlternateID.value)))];

    console.log('fetching all shopify alternate products');
    const gqlQueryParams = crossReferences.map(cr => `sku:${cr}`).join(' OR ');
    const gqlProductVariants = {
      query: `
        {
          productVariants(first: 50, query: "${gqlQueryParams}") {
              edges {
                  node {
                      product{
                        id
                      }
                  }
              }
          }
        }
      `,
    };

    console.log('fetching shopify products');
    let shopifyProducts2 = await shopifyWrapper.graphQl(gqlProductVariants);

    shopifyProducts2 = shopifyProducts2.data.productVariants.edges.map(sp => ({
      id: sp.node.product.id,
      images,
    }));

    let res = [];
    for (let i = 0; i < shopifyProducts2.length; i++) {
      console.log(`updating product stocks ${shopifyProducts2[i].id}`);
      const gqlUpdateProduct = {
        query: `
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { input: shopifyProducts2[i] },
      };
      res = [...res, await shopifyWrapper.graphQl(gqlUpdateProduct)];
    }
    console.log(util.inspect(res, false, null, true /* enable colors */));
    return { crossReferences, product, shopifyProducts2, sku, res };
  }

  private getDescription(description) {
    const arrDescription = description.split('-');
    const trueDescription = arrDescription[0].trim();
    return trueDescription;
  }
}

export default ProductService;

// FUEL FILTER - BFU700X, 1679805
