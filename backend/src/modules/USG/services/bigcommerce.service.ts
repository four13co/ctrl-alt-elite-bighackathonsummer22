import { IBigCommerceFetchInput } from '../interfaces/bigcommerce.interface';

import fetch, { RequestInit, Headers } from 'node-fetch';
import path from 'path';
import { URL } from 'url';

class BigCommerceService {
  storeHash: string;
  authToken: string;

  constructor({ env }) {
    if (env === 'PROD') {
      this.storeHash = process.env.USG_BC_PROD_STORE_HASH;
      this.authToken = process.env.USG_BC_PROD_AUTH_TOKEN;
    } else {
      this.storeHash = process.env.USG_BC_DEV_STORE_HASH;
      this.authToken = process.env.USG_BC_DEV_AUTH_TOKEN;
    }
  }

  public async bcFetch({ method = 'GET', resource, apiVersion = 'v3', query = {}, body }: IBigCommerceFetchInput) {
    const managementApiBaseUrl = `https://api.bigcommerce.com/stores/`;
    const requestURL = new URL(managementApiBaseUrl);

    // Join URL paths to form the final request URL
    requestURL.pathname = path.join(requestURL.pathname, this.storeHash, apiVersion, resource);

    for (const [param, value] of Object.entries(query)) {
      requestURL.searchParams.append(param, String(value));
    }

    const fetchHeaders = new Headers();

    fetchHeaders.append('Content-Type', 'application/json');
    fetchHeaders.append('X-Auth-token', this.authToken);
    fetchHeaders.append('Accept', 'application/json');

    const requestOptions: RequestInit = {
      method,
      headers: fetchHeaders,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(requestURL.href, requestOptions);

    return await response.json();
  }

  /**
   * Get the customer all customers.
   * @returns The attribute object.
   */
  public async getCustomers() {
    let attribute = await this.getCustomerAttributeByName('OTT');

    if (!attribute) {
      const attributeCreationResponse = await this.bcFetch({
        method: 'POST',
        resource: '/customers/attributes',
        body: [{ name: 'OTT', type: 'string' }],
      });

      [attribute] = attributeCreationResponse.data;
    }

    const response = await this.bcFetch({
      method: 'GET',
      resource: '/customers',
      apiVersion: 'v2',
    });

    if (response.length === 0) {
      return null;
    }

    return response;
  }

  /**
   * upsertCustomer
   * @returns The attribute object.
   */
  public async upsertCustomer(bodyObj) {
    const response = await this.bcFetch({
      method: 'PUT',
      resource: '/customers/attribute-values',
      body: [bodyObj],
    });

    return response;
  }

  /**
   * upsertCustomer
   * @returns The attribute object.
   */
  public async getCustomersAttributes() {
    const response = await this.bcFetch({
      resource: '/customers/attribute-values',
    });

    if (response.length === 0) {
      return null;
    }
    return response;
  }

  /**
   * deleteCustomersAttributes
   * @returns The attribute object.
   */
  public async deleteCustomersAttributes(id: string | number) {
    // const response = await this.bcFetch({
    //   method: 'DELETE',
    //   resource: `/customers/attribute-values`,
    //   query: { 'id:in': id },
    // });
    const myHeaders = new Headers();
    myHeaders.append('content-type', 'application/json');
    myHeaders.append('x-auth-token', this.authToken);
    myHeaders.append('accept', 'application/json');

    const requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      //redirect: 'follow'
    };

    const response = await fetch(`https://api.bigcommerce.com/stores/${this.storeHash}/v3/customers/attribute-values?id%3Ain=${id}`, requestOptions);

    return response;
  }

  /**
   * updateCustomerPassword
   * @returns The attribute object.
   */
  public async updateCustomerPassword(bodyObj, id: string | number) {
    // const response = await this.bcFetch({
    //   method: 'PUT',
    //   apiVersion: 'v2',
    //   resource: `/customers/attribute-values/${id}`,
    //   body: bodyObj,
    // });
    const myHeaders = new Headers();
    myHeaders.append('content-type', 'application/json');
    myHeaders.append('x-auth-token', this.authToken);
    myHeaders.append('accept', 'application/json');

    const raw = JSON.stringify(bodyObj);
    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      //redirect: 'follow'
    };
    const response = await fetch(`https://api.bigcommerce.com/stores/${this.storeHash}/v2/customers/${id}`, requestOptions);

    return response;
  }

  /**
   * Get the customer attribute from the input name.
   * **DO NOT** mistake it for the customer attribute _value_.
   * @param attributeName The attribute name to find/get.
   * @returns The attribute object.
   */
  public async getCustomerAttributeByName(attributeName: string) {
    const response = await this.bcFetch({
      method: 'GET',
      resource: '/customers/attributes',
      query: { name: attributeName },
    });

    if (response.data.length === 0) {
      return null;
    }

    const [attribute] = response.data;

    return attribute;
  }

  public async getCustomerAddresses(customerId) {
    const response = await this.bcFetch({
      method: 'GET',
      resource: '/customers/addresses',
      query: { 'customer_id:in': customerId },
    });

    const addresses = response.data;

    if (addresses.length === 0) {
      return null;
    }

    return addresses;
  }

  public async getCustomerAddressById(customerId: string | number, addressId: string | number) {
    const response = await this.bcFetch({
      method: 'GET',
      resource: '/customers/addresses',
      query: { 'id:in': addressId, 'customer_id:in': customerId },
    });
    console.log(response);

    if (response.data?.length === 0) {
      return null;
    }

    const [address] = response.data;

    return address;
  }

  public async getCustomerAttributeValueByName(customerId: string | number, attributeName: string) {
    const response = await this.bcFetch({
      method: 'GET',
      resource: '/customers/attribute-values',
      query: { name: attributeName, 'customer_id:in': customerId },
    });

    if (response.data.length === 0) {
      return null;
    }

    const [attribute] = response.data;

    return attribute;
  }

  public async getCustomerDefaultShippingAddress(customerId: string | number) {
    const attribute = await this.getCustomerAttributeValueByName(customerId, 'defaultShippingAddress');
    const addressId = attribute?.attribute_value;

    return addressId ?? null;
  }

  public async getCustomerDefaultBillingAddress(customerId: string | number) {
    const attribute = await this.getCustomerAttributeValueByName(customerId, 'defaultBillingAddress');
    const addressId = attribute?.attribute_value;

    return addressId ?? null;
  }

  public async setCustomerDefaultShippingAddress(customerId: string | number, addressId: string | number) {
    const address = await this.getCustomerAddressById(customerId, addressId);

    if (!address) {
      return false;
    }

    let attribute = await this.getCustomerAttributeByName('defaultShippingAddress');

    if (!attribute) {
      const attributeCreationResponse = await this.bcFetch({
        method: 'POST',
        resource: '/customers/attributes',
        body: [{ name: 'defaultShippingAddress', type: 'number' }],
      });

      [attribute] = attributeCreationResponse.data;
    }

    const attributeValueUpdateResponse = await this.bcFetch({
      method: 'PUT',
      resource: '/customers/attribute-values',
      body: [
        {
          attribute_id: attribute.id,
          value: String(addressId),
          customer_id: customerId,
        },
      ],
    });

    const [updated] = attributeValueUpdateResponse.data;

    return updated ?? null;
  }

  public async setCustomerDefaultBillingAddress(customerId: string | number, addressId: string | number) {
    const address = await this.getCustomerAddressById(customerId, addressId);

    if (!address) {
      return false;
    }

    let attribute = await this.getCustomerAttributeByName('defaultBillingAddress');

    if (!attribute) {
      const attributeCreationResponse = await this.bcFetch({
        method: 'POST',
        resource: '/customers/attributes',
        body: [{ name: 'defaultBillingAddress', type: 'number' }],
      });

      [attribute] = attributeCreationResponse.data;
    }

    const attributeValueUpdateResponse = await this.bcFetch({
      method: 'PUT',
      resource: '/customers/attribute-values',
      body: [
        {
          attribute_id: attribute.id,
          value: String(addressId),
          customer_id: customerId,
        },
      ],
    });

    const [updated] = attributeValueUpdateResponse.data;

    return updated ?? null;
  }

  public async getCustomerOrders(customerId) {
    try {
      const orders = await this.bcFetch({
        method: 'GET',
        resource: '/orders',
        apiVersion: 'v2',
        query: { customer_id: customerId, sort: 'date_created:desc', limit: '3' },
      });

      return orders;
    } catch {
      return [];
    }
  }

  public async getCustomerWishlists(customerId) {
    const response = await this.bcFetch({
      method: 'GET',
      resource: '/wishlists',
      apiVersion: 'v3',
      query: { customer_id: customerId },
    });

    const wishlists = response.data;

    if (wishlists?.length === 0) {
      return null;
    }

    return wishlists;
  }

  public async getCustomerFavoriteSports(customerId: string | number) {
    const attribute = await this.getCustomerAttributeValueByName(customerId, 'favoriteSports');
    const favoriteSports = attribute?.attribute_value ? attribute.attribute_value.split(',') : [];

    return favoriteSports;
  }

  public async getCustomerFavoriteLeagues(customerId: string | number) {
    const attribute = await this.getCustomerAttributeValueByName(customerId, 'favoriteLeagues');
    const favoriteSports = attribute?.attribute_value ? attribute.attribute_value.split(',') : [];

    return favoriteSports;
  }

  public async getCustomerFavoriteTeams(customerId: string | number) {
    const attribute = await this.getCustomerAttributeValueByName(customerId, 'favoriteTeams');
    const favoriteSports = attribute?.attribute_value ? attribute.attribute_value.split(',') : [];

    return favoriteSports;
  }

  public async setCustomerFavoriteSports(customerId: string | number, favoriteSports: string) {
    let attribute = await this.getCustomerAttributeByName('favoriteSports');

    if (!attribute) {
      const attributeCreationResponse = await this.bcFetch({
        method: 'POST',
        resource: '/customers/attributes',
        body: [{ name: 'favoriteSports', type: 'string' }],
      });

      [attribute] = attributeCreationResponse.data;
    }

    const attributeValueUpdateResponse = await this.bcFetch({
      method: 'PUT',
      resource: '/customers/attribute-values',
      body: [
        {
          attribute_id: attribute.id,
          value: favoriteSports,
          customer_id: customerId,
        },
      ],
    });

    const [updated] = attributeValueUpdateResponse.data;

    return updated ?? null;
  }

  public async setCustomerFavoriteLeagues(customerId: string | number, favoriteLeagues: string) {
    let attribute = await this.getCustomerAttributeByName('favoriteLeagues');

    if (!attribute) {
      const attributeCreationResponse = await this.bcFetch({
        method: 'POST',
        resource: '/customers/attributes',
        body: [{ name: 'favoriteLeagues', type: 'string' }],
      });

      [attribute] = attributeCreationResponse.data;
    }

    const attributeValueUpdateResponse = await this.bcFetch({
      method: 'PUT',
      resource: '/customers/attribute-values',
      body: [
        {
          attribute_id: attribute.id,
          value: favoriteLeagues,
          customer_id: customerId,
        },
      ],
    });

    const [updated] = attributeValueUpdateResponse.data;

    return updated ?? null;
  }

  public async setCustomerFavoriteTeams(customerId: string | number, favoriteTeams: string) {
    let attribute = await this.getCustomerAttributeByName('favoriteTeams');

    if (!attribute) {
      const attributeCreationResponse = await this.bcFetch({
        method: 'POST',
        resource: '/customers/attributes',
        body: [{ name: 'favoriteTeams', type: 'string' }],
      });

      [attribute] = attributeCreationResponse.data;
    }

    const attributeValueUpdateResponse = await this.bcFetch({
      method: 'PUT',
      resource: '/customers/attribute-values',
      body: [
        {
          attribute_id: attribute.id,
          value: favoriteTeams,
          customer_id: customerId,
        },
      ],
    });

    const [updated] = attributeValueUpdateResponse.data;

    return updated ?? null;
  }
}

export default BigCommerceService;
