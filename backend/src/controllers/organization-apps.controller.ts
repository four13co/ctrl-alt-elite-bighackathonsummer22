import { Organization } from '@/interfaces/organizations.interface';
import OrganizationAppsService from '@/services/organization-apps.service';
import { Request, Response, NextFunction } from 'express';
import { CreateOrgAppDto } from '@/dtos/apps.dto';
import { App } from '@/interfaces/apps.interface';
import AppService from '@/services/apps.service';

class OrganizationAppsController {
    public organizationAppsService = new OrganizationAppsService();
    public appService = new AppService();

    public getOrgApps = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: any = req.params;

            const response: Organization[] = await this.organizationAppsService.getAllOrgApps(userId.id);

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    public addOrgApps = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appData: CreateOrgAppDto = req.body;
            const response: App = await this.appService.createApp(appData);
            const newApp: any = await this.organizationAppsService.updateOrgApp(appData.userId, appData.orgId, response);
            res.status(201).json(newApp);
        } catch (error) {
            next(error);
        }
    };

    public getAvailableApps = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const availableApps: any = [
                'Acumatica',
                'BigCommerce',
                'Algolia',
                'Shopify',
            ];
            res.status(200).json(availableApps);
        } catch (error) {
            next(error);
        }
    };

    public deleteOrgApp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orgId = req.params.orgId;
            const appId = req.params.appId;
            const userId = req.params.userId;
            const response: App = await this.appService.deleteApp(appId);

            const newApp: any = await this.organizationAppsService.deleteOrgApp(userId, orgId, response);
            res.status(201).json(newApp);
        } catch (error) {
            next(error);
        }
    };

}

export default OrganizationAppsController;