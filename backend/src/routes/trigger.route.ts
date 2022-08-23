import TriggerController from '@/controllers/trigger.controller';
import { CreateTriggerDto } from '@/dtos/triggers.dto';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import { Router } from 'express';

class TriggerRoute implements Routes {
  public path = '/triggers';
  public router = Router();
  public triggerController = new TriggerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.triggerController.getTriggers);
    this.router.get(`${this.path}/:id`, this.triggerController.getTriggerById);
    this.router.post(`${this.path}/`, validationMiddleware(CreateTriggerDto, 'body'), authMiddleware, this.triggerController.createTrigger);
    this.router.put(`${this.path}/:id`, this.triggerController.updateTrigger);
    this.router.delete(`${this.path}/:id`, this.triggerController.deleteTrigger);
  }
}

export default TriggerRoute;
