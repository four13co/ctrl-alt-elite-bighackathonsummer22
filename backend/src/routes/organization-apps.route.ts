import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import OrganizationAppsController from '@/controllers/organization-apps.controller';
import AppController from '@/controllers/app.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateOrgAppDto } from '@/dtos/apps.dto';

class OrgAppRoute implements Routes {
  public path = '/organization-apps';
  public router = Router();
  public organizationAppsController = new OrganizationAppsController();
  public appController = new AppController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, this.organizationAppsController.getOrgApps);
    this.router.post(`${this.path}`, validationMiddleware(CreateOrgAppDto, 'body'), this.organizationAppsController.addOrgApps);
    this.router.get(`/organization-available-apps`, this.organizationAppsController.getAvailableApps);
    this.router.delete(`${this.path}/:orgId/:appId/:userId`, this.organizationAppsController.deleteOrgApp);
  }
}

export default OrgAppRoute;