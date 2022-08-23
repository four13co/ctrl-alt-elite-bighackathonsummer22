import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service';
import BigCommerceService from '../services/bigcommerce.service';

class CredentialsController {
  /**
   * Listrak token  endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public getToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new AuthService();
      const data = await service.listrakFetch();
      res.status(200).send(data);
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };

  /**
   * Validate Jwt  endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public validateJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const secret = process.env.JWT_SECRET_USG;
      const verified = jwt.verify(req.body.token, secret);
      res.status(200).send(verified);
    } catch (error) {
      res.status(500).send('Token has expire.');
      next(error);
      // console.log(error);
    }
  };
  /**
   * create reset JWT Token endpoint.
   * @param request - request handler
   * @param response - response handler
   * @param next - next handler
   */
  public createResetJwtToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const service = new BigCommerceService({ env: req.query.env });

      let attribute = await service.getCustomerAttributeByName('OTT');

      if (!attribute) {
        const attributeCreationResponse = await service.bcFetch({
          method: 'POST',
          resource: '/customers/attributes',
          body: [{ name: 'OTT', type: 'string' }],
        });

        [attribute] = attributeCreationResponse.data;
      }

      const secret = process.env.JWT_SECRET_USG;
      const myToken = jwt.sign(
        {
          email: req.body.customer_email,
          ott: attribute.id,
          id: req.body.customer_id,
        },
        secret,
        {
          expiresIn: '30m',
        },
      );
      const resObj = { token: myToken };
      res.status(200).send(resObj);
    } catch (error) {
      next(error);
      // console.log(error);
    }
  };
}

export default CredentialsController;
