import TriggerService from '@/services/triggers.service';
import { Request, Response, NextFunction } from 'express';
import { Trigger } from '@/interfaces/triggers.model';
import { RequestWithUser } from '@/interfaces/auth.interface';

class TriggerController {
  public triggerService = new TriggerService();

  public getTriggers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Trigger[] = await this.triggerService.findAllTriggers();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTriggerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Trigger = await this.triggerService.findTrigger(req.params.id);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createTrigger = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const response: Trigger = await this.triggerService.createTrigger(req.organization._id, req.body);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateTrigger = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Trigger = await this.triggerService.updateTrigger(req.params.id, req.body);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteTrigger = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: Trigger = await this.triggerService.deleteTrigger(req.params.id);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default TriggerController;
