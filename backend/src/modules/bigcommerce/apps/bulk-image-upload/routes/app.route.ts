import { Router } from 'express';
import AuthContoller from '../controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { CreateAppDto } from '../dtos/apps.dtos';
import AppsController from '../controllers/app.controller';

const multer = require('multer');
const upload = multer();

class ModuleBigcommerceBulkImage implements Routes {
  public path = '/modules/bigcommerce/bulk-image-upload/api/';
  public router = Router();
  private authController = new AuthContoller();
  private appsController = new AppsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // BigCommerce Callback URLs
    this.router.get(`${this.path}bc/auth`, this.authController.auth);
    this.router.get(`${this.path}bc/load`, this.authController.load);
    this.router.get(`${this.path}bc/uninstall`, this.authController.uninstall);

    // WebDav
    this.router.post(`${this.path}webdav`, this.authController.webDavConfig);
    this.router.get(`${this.path}search/:storeHash/:searchParams`, authMiddleware, this.authController.searchProducts);
    this.router.get(`${this.path}verify/:payload`, this.authController.verifyPayload);

    // Apps 
    this.router.put(`${this.path}apps`,
      authMiddleware,
      this.appsController.updateWebDavConfig,
    );
    this.router.post(`${this.path}upload`, upload.array('files'), this.appsController.uploadImages);
    this.router.get(`${this.path}get-images/:storeHash`, authMiddleware, this.appsController.getAllImages);
    this.router.put(`${this.path}update-tags`, this.appsController.tagImages);
  }
}

export default ModuleBigcommerceBulkImage;
