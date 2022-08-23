// import { Request, Response, NextFunction } from 'express';
// import AccountService from '../services/accounts.service';
// import userModel from '@/models/users.model';

// class GetUsersControllers {
//   public accountService = new AccountService();

//   public getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const accountId = req.params;
//       const account = await userModel.findById(accountId);
//       res.status(200).json({ data: account });
//     } catch (error) {
//       next(error);
//     }
//   };
// }

// export default GetUsersControllers;
