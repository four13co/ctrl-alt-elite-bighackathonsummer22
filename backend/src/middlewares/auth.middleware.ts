import config from 'config';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@models/users.model';
import organizationModel from '@/models/organizations.model';
import { isEmpty } from '@/utils/util';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;

    if (Authorization) {
      const secretKey: string = process.env.JWT_TOKEN_SECRET;
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        // TODO: Ask about how a user will be associated with an organization. Will it be during signup?

        // const organization = await organizationModel.findOne({ users: findUser._id });
        // if (isEmpty(organization)) {
        //   next(new HttpException(500, 'User is not associated with organization.'));
        // } else {
        //   req.user = findUser;
        //   req.organization = organization;
        //   next();
        // }

        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
