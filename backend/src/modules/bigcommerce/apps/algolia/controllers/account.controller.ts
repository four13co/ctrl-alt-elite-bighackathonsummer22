import { Request, Response, NextFunction } from 'express';
import AccountService from '../services/accounts.service';

class SettingController {
  private accountService = new AccountService();

  public createAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      const account = await this.accountService.createAccount({
        accountId: body.accountId,
        name: body.name,
        email: body.email,
        password: body.password,
        storeHash: '',
      });
      res.status(200).json({ data: account });
    } catch (error) {
      next(error);
    }
  };
}

export default SettingController;
