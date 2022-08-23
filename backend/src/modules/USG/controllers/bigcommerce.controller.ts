import { Request, Response, NextFunction } from 'express';
// import fetch, { Headers } from 'node-fetch';
import BigCommerceService from '../services/bigcommerce.service';

class BigcommerceController {
  /**
   * Get All Bigcommerce store customers  endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new BigCommerceService({ env: req.query.env });
      const data = await service.getCustomers();
      res.status(200).send(data);
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };

  /**
   * Upsert a customer in Bigcommerce endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public upsertCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new BigCommerceService({ env: req.query.env });
      let attribute = await service.getCustomerAttributeByName('OTT');
      if (!attribute) {
        const attributeCreationResponse = await service.bcFetch({
          method: 'POST',
          resource: '/customers/attributes',
          body: [{ name: 'OTT', type: 'string' }],
        });

        [attribute] = attributeCreationResponse.data;
      }
      const dataObj = { attribute_id: attribute.id, value: req.body.value, customer_id: req.body.customer_id };
      const data = await service.upsertCustomer(dataObj);
      res.status(200).send(data);
      // res.status(200).json('Customer is Upsert!');
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };

  /**
   * get all a customer attribute values endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public getCustomersAttributes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new BigCommerceService({ env: req.query.env });
      const data = await service.getCustomersAttributes();
      res.status(200).send(data);
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };

  /**
   * delete a customer attribute values endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public deleteCustomersAttributes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new BigCommerceService({ env: req.query.env });
      await service.deleteCustomersAttributes(req.body.id);
      res.status(200).json('deleteCustomersAttributes');
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };

  /**
   * update customers password endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public updateCustomerPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new BigCommerceService({ env: req.query.env });
      const bodyObj = { _authentication: { password: req.body.password, force_reset: false } };
      await service.updateCustomerPassword(bodyObj, req.body.customer_id);
      res.status(200).json('updateCustomerPassword!');
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };

  /**
   * Get customer info that cannot be requested from the storefront (on a custom page).
   * @param req Request object.
   * @param res Response object.
   * @param next Next function handler.
   */
  public getCustomerInfo = async function (req: Request, res: Response, next: NextFunction) {
    try {
      const service = new BigCommerceService({ env: req.query.env });
      const customerId = req.query.customerId as string;

      const [orders, wishlists, addresses, favoriteSports, favoriteLeagues, favoriteTeams, defaultBillingAddress, defaultShippingAddress] =
        await Promise.all([
          service.getCustomerOrders(customerId),
          service.getCustomerWishlists(customerId),
          service.getCustomerAddresses(customerId),
          service.getCustomerFavoriteSports(customerId),
          service.getCustomerFavoriteLeagues(customerId),
          service.getCustomerFavoriteTeams(customerId),
          service.getCustomerDefaultBillingAddress(customerId),
          service.getCustomerDefaultShippingAddress(customerId),
        ]);

      return res.json({
        orders,
        wishlists,
        addresses,
        favoriteSports,
        favoriteLeagues,
        favoriteTeams,
        defaultBillingAddress,
        defaultShippingAddress,
      });
    } catch (err) {
      // res.status(500).json('Something went wrong while processing your request.');
      next(err);
    }
  };

  public setDefaultShippingAddress = async function (req: Request, res: Response, next: NextFunction) {
    try {
      const service = new BigCommerceService({ env: req.body.env });

      const { addressId, customerId } = req.body;

      const updated = await service.setCustomerDefaultShippingAddress(customerId, addressId);

      if (updated) {
        return res.json('Successfully updated default shipping address.');
      } else {
        return res.status(400).json('Nothing was updated, please check your input.');
      }
    } catch (err) {
      // res.status(500).json('Something went wrong while processing your request.');
      next(err);
    }
  };

  public setDefaultBillingAddress = async function (req: Request, res: Response, next: NextFunction) {
    try {
      const service = new BigCommerceService({ env: req.body.env });

      const { addressId, customerId } = req.body;

      const updated = await service.setCustomerDefaultBillingAddress(customerId, addressId);

      if (updated) {
        return res.json('Successfully updated default billing address.');
      } else {
        return res.status(400).json('Nothing was updated, please check your input.');
      }
    } catch (err) {
      // res.status(500).json('Something went wrong while processing your request.');
      next(err);
    }
  };

  public setFavoriteSports = async function (req: Request, res: Response, next: NextFunction) {
    try {
      const service = new BigCommerceService({ env: req.body.env });

      const { favoriteSports, customerId } = req.body;

      const updated = await service.setCustomerFavoriteSports(customerId, favoriteSports);

      if (updated) {
        return res.json('Successfully updated favorite sports.');
      } else {
        return res.status(400).json('Nothing was updated, please check your input.');
      }
    } catch (err) {
      // res.status(500).json('Something went wrong while processing your request.');
      next(err);
    }
  };

  public setFavoriteLeagues = async function (req: Request, res: Response, next: NextFunction) {
    try {
      const service = new BigCommerceService({ env: req.body.env });

      const { favoriteLeagues, customerId } = req.body;

      const updated = await service.setCustomerFavoriteLeagues(customerId, favoriteLeagues);

      if (updated) {
        return res.json('Successfully updated favorite leagues.');
      } else {
        return res.status(400).json('Nothing was updated, please check your input.');
      }
    } catch (err) {
      // res.status(500).json('Something went wrong while processing your request.');
      next(err);
    }
  };

  public setFavoriteTeams = async function (req: Request, res: Response, next: NextFunction) {
    try {
      const service = new BigCommerceService({ env: req.body.env });

      const { favoriteTeams, customerId } = req.body;

      const updated = await service.setCustomerFavoriteTeams(customerId, favoriteTeams);

      if (updated) {
        return res.json('Successfully updated favorite teams.');
      } else {
        return res.status(400).json('Nothing was updated, please check your input.');
      }
    } catch (err) {
      // res.status(500).json('Something went wrong while processing your request.');
      next(err);
    }
  };
}

export default BigcommerceController;
