import OrganizationController from '@/controllers/organization.controller';
import { CreateOrganizationDto } from '@/dtos/organization.dto';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import { Router } from 'express';

class OrganizationRoute implements Routes {
  public path = '/organizations';
  public router = Router();
  public organizationController = new OrganizationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.organizationController.getOrganizations);
    this.router.post(`${this.path}/`, validationMiddleware(CreateOrganizationDto, 'body'), this.organizationController.createOrganization);
    this.router.delete(`${this.path}/:id`, this.organizationController.deleteOrganization);
  }
}

export default OrganizationRoute;
