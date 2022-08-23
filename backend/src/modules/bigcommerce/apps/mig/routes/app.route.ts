import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

import CalculatorController from '../controllers/calculator.controller';
import { CalculatorDto, CalculatorParamDto } from '../dtos/calculator.dto';

class ModuleBigcommerceMigRoute implements Routes {
  public path = '/modules/bigcommerce/mig/api/';
  public router = Router();

  private calculatorController = new CalculatorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}getPrice`, validationMiddleware(CalculatorDto, 'body'), this.calculatorController.calculatePrice);
    this.router.post(`${this.path}updatePrice`, validationMiddleware(CalculatorParamDto, 'body'), this.calculatorController.updatePrice);
  }
}

export default ModuleBigcommerceMigRoute;
