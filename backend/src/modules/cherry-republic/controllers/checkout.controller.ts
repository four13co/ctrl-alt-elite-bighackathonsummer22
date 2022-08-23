import { NextFunction, Request, Response } from 'express';
import FedexService from '../services/fedex.service';

class CheckoutController {
  public fedexService = new FedexService();

  public fedexAddressVerification = async (req: Request, res: Response, next: NextFunction) => {

    try {
      const address = req.body;

      let result = await this.fedexService.AddressVerification(address);

      res.type('application/xml');
      return res.status(200).send(result);

    }
    catch (err) {
      return res.status(500);
    }
  }
}

export default CheckoutController;
