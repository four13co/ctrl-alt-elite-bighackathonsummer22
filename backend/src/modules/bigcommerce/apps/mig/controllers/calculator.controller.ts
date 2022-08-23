import { Request, Response, NextFunction } from 'express';
import CalculatorService from '../services/calculator.service';
import ErrorHandle from '@utils/ErrorHandle';

class CalculateController {
  private calculatorService = new CalculatorService();

  public calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // REQUEST BODY
      const { sku, quantity } = req.body;

      if (quantity < 1) {
        throw new ErrorHandle(406, 'order quantity should be greater than 0');
      }
      if (quantity > 1000000) {
        throw new ErrorHandle(406, 'the max order quantity is 1,000,000');
      }

      const computedPrice = await this.calculatorService.getPrice(sku, quantity);

      return res.status(200).json({
        message: 'success',
        computedPrice,
      });
    } catch (err) {
      if (err.code) {
        return res.status(err.code).send(err);
      } else {
        next(err);
      }
    }
  };

  public updatePrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sku, quantity, lineItemId, cartId, productId } = req.body;

      if (quantity < 1) {
        throw new ErrorHandle(406, 'order quantity should be greater than 0');
      }
      if (quantity > 1000000) {
        throw new ErrorHandle(406, 'the max order quantity is 1,000,000');
      }

      const cart = await this.calculatorService.calculatePrice(cartId, sku, quantity, productId, lineItemId);

      res.status(200).json({
        msg: 'success',
        cart,
      });
    } catch (err) {
      if (err.code) {
        return res.status(err.code).send(err);
      } else {
        next(err);
      }
    }
  };
}

export default CalculateController;
