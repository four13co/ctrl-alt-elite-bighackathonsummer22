import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AppController from '@/controllers/app.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateAppDto } from '@/dtos/apps.dto';

class AppRoute implements Routes {
  public path = '/apps';
  public router = Router();
  public appController = new AppController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.appController.getApp);
    this.router.post(`${this.path}`, validationMiddleware(CreateAppDto, 'body'), this.appController.registerApp);
    this.router.put(`${this.path}/:id`, validationMiddleware(CreateAppDto, 'body'), this.appController.updateApp);
    this.router.delete(`${this.path}/:id`, this.appController.deleteApp);
  }
}

export default AppRoute;
