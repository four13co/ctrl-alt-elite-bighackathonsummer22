import { Response, NextFunction, Request } from 'express';
import { HttpException } from '@exceptions/HttpException';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split(' ')[1] || null;

    if (Authorization) {
      const auth = Buffer.from(Authorization, 'base64').toString().split(':');

      if (auth[0] == process.env.CR_USERNAME && auth[1] == process.env.CR_SECRET) {
        next();
      }
      else {
        next(new HttpException(401, 'Unauthorized'));
      }
    } else {
      next(new HttpException(401, 'Store token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Store token not found'));
  }
};

export default authMiddleware;
