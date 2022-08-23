import { Request, Response, NextFunction } from 'express';
import OrganizationService from '../services/organizations.service';

class OrganizationsController {
  private OrganizationService = new OrganizationService();

  public createStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const store = await this.OrganizationService.createOrganizations({ name: body.name });
      res.status(200).json({ data: store });
    } catch (error) {
      next(error);
    }
  };
}

export default OrganizationsController;
