import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@/exceptions/HttpException';
import AccountService from '../services/accounts.service';
import { RequestWithToken } from '../interfaces/auth.interface';

class SettingController {
  private accountService = new AccountService();

  public createAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const account = await this.accountService.createAccount({
        accountId: body.accountId,
        name: body.name,
        email: body.email,
        password: body.password
      });
      res.status(200).json({ data: account });
    } catch (error) {
      next(error);
    }
  };

  public getAccount = async (req: RequestWithToken, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;

      const account = await this.accountService.findAccount(accountId);
      if (!account) {
        return next(new HttpException(500, 'Tranzetta account not found.'));
      }

      res.status(200).json({ data: account ? account : {} });
    } catch (error) {
      next(error);
    }
  };

}

export default SettingController;
