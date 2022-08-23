import { Response, NextFunction } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithToken } from '../interfaces/auth.interface';
import { dbConnection } from '../databases/config';
import { Model, createConnection, Document } from 'mongoose';
import { App } from '../interfaces/apps.interface';
import appSchema from '../models/apps.model';


const authMiddleware = async (req: RequestWithToken, res: Response, next: NextFunction) => {
  let currentDbConnection;

  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;

    if (Authorization) {
      currentDbConnection = await createConnection(dbConnection.url, dbConnection.options);
      const appsModel: Model<App, Document> = await currentDbConnection.model('apps', appSchema);
      const apps = await appsModel.findOne({ "apiKey.accessToken": Authorization }).exec();
      if (apps) {
        req.store = apps;
        next();
      } else {
        next(new HttpException(401, 'Store token not found'));
      }
    } else {
      next(new HttpException(401, 'Store token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Store token not found'));
  } finally {
    if (currentDbConnection) currentDbConnection.close();
  }

};

export default authMiddleware;
