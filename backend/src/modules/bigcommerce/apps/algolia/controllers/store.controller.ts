import { Request, Response, NextFunction } from 'express';
import StoreService from '../services/stores.service';

class StoreController {
  private storeService = new StoreService();

  public createStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const store = await this.storeService.createStore({ name: body.name, token: body.token, url: body.url, storeHash: body.url });
      res.status(200).json({ data: store });
    } catch (error) {
      next(error);
    }
  };
}

export default StoreController;
