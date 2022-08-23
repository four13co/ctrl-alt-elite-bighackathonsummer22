import { Router } from 'express';
import AuthContoller from '../controllers/auth.controller';
import AccountContoller from '../controllers/account.controller';
import ProductController from '../controllers/product.controller';
import { Routes } from '@interfaces/routes.interface';
import { CreateVerifyDto } from '../dtos/auth.dto';
import { CreateUserDto } from '../dtos/users.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';

class ModuleBigcommerceNFT implements Routes {
  public path = '/modules/bigcommerce/NFT/api/';
  public router = Router();
  private authController = new AuthContoller();
  private accountController = new AccountContoller();
  private productController = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // BigCommerce Callback URLs
    this.router.get(`${this.path}bc/auth`, this.authController.auth);
    this.router.get(`${this.path}bc/load`, this.authController.load);
    this.router.get(`${this.path}bc/uninstall`, this.authController.uninstall);

    // Auth
    this.router.get(`${this.path}verify/:payload`, validationMiddleware(CreateVerifyDto, 'body', true), this.authController.verifyPayload);
    this.router.post(`${this.path}auth`, this.authController.verifyAuthToken);
    this.router.post(`${this.path}login`, this.authController.logIn);

    // NFT Settings
    this.router.get(`${this.path}user/:accountId`, authMiddleware, this.accountController.getAccount);
    this.router.put(
      `${this.path}user/:accountId`,
      authMiddleware,
      validationMiddleware(CreateUserDto, 'body', true),
      this.accountController.updateProfileById,
    );
    //
    this.router.post(`${this.path}create-product`, this.productController.createProduct);
    this.router.post(`${this.path}get-product`, this.productController.getProduct);
    this.router.get(`${this.path}create-product-category`, this.productController.createProductCategory);
    this.router.get(`${this.path}get-product-category`, this.productController.getProductCategory);
    this.router.post(`${this.path}update-product`, this.productController.updateProduct);
  }
}

export default ModuleBigcommerceNFT;
