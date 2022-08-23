import { CreateAppDto } from '@/dtos/apps.dto';
import { App } from '@/interfaces/apps.interface';
import AppService from '@/services/apps.service';
import { Request, Response, NextFunction } from 'express';

class AppController {
  public appService = new AppService();

  public getApp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: App[] = await this.appService.findAllApps();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public registerApp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appData: CreateAppDto = req.body;
      const response: App = await this.appService.createApp(appData);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateApp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appData: CreateAppDto = req.body;
      const response: App = await this.appService.updateApp(req.params.id, appData);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteApp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: App = await this.appService.deleteApp(req.params.id);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default AppController;
