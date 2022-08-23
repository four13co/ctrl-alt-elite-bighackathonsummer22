import { CreateOrganizationDto } from '@/dtos/organization.dto';
import { Organization } from '@/interfaces/organizations.interface';
import OrganizationService from '@/services/organizations.service';
import { Request, Response, NextFunction } from 'express';

class OrganizationController {
  public organizationService = new OrganizationService();

  public getOrganizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Organization[] = await this.organizationService.findAllOrganizations();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrganizationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Organization = await this.organizationService.findOrganization(req.params.id);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationData: CreateOrganizationDto = req.body;
      const response: Organization = await this.organizationService.createOrganization(organizationData);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Organization = await this.organizationService.deleteOrganization(req.params.id);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationController;
