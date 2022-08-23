import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AuthController from '../controllers/auth.controller';
import MessageController from '../controllers/message.controller';
import BigcommerceController from '../controllers/bigcommerce.controller';
class ModuleBigcommerceUSGListrakRoute implements Routes {
  public path = '/modules/USG/listrak/';
  public router = Router();
  private authController = new AuthController();
  private messageController = new MessageController();
  private bigcommerceController = new BigcommerceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get listrak token
    this.router.get(`${this.path}token`, this.authController.getToken);
    // create JWT resetPassToken for customer
    this.router.post(`${this.path}resetPassToken`, this.authController.createResetJwtToken);
    // validate jwt token
    this.router.post(`${this.path}decodePasswordResetToken`, this.authController.validateJwt);

    // Send listrak transactional message
    this.router.post(`${this.path}message`, this.messageController.sendMessage);

    // get bigcommerce all customers
    this.router.get(`${this.path}getCustomers`, this.bigcommerceController.getCustomers);
    // get upsert a customer
    this.router.post(`${this.path}upsertCustomer`, this.bigcommerceController.upsertCustomer);
    // get all a customer attribute values
    this.router.get(`${this.path}getCustomersAttributes`, this.bigcommerceController.getCustomersAttributes);
    // delete a customer attribute values
    this.router.post(`${this.path}deleteCustomersAttributes`, this.bigcommerceController.deleteCustomersAttributes);
    // update customers password
    this.router.post(`${this.path}updateCustomerPassword`, this.bigcommerceController.updateCustomerPassword);

    // Get a customer's list of addresses
    this.router.get(`${this.path}getCustomerInfo`, this.bigcommerceController.getCustomerInfo);
    // Set a customer's default shipping address
    this.router.post(`${this.path}setDefaultShippingAddress`, this.bigcommerceController.setDefaultShippingAddress);
    // Set a customer's default billing address
    this.router.post(`${this.path}setDefaultBillingAddress`, this.bigcommerceController.setDefaultBillingAddress);

    this.router.post(`${this.path}setFavoriteSports`, this.bigcommerceController.setFavoriteSports);
    this.router.post(`${this.path}setFavoriteLeagues`, this.bigcommerceController.setFavoriteLeagues);
    this.router.post(`${this.path}setFavoriteTeams`, this.bigcommerceController.setFavoriteTeams);
  }
}

export default ModuleBigcommerceUSGListrakRoute;
