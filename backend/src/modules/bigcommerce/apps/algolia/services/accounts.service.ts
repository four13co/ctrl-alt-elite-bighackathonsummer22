import { CreateAccountDto } from '../dtos/accounts.dto';
import { Account } from '../interfaces/accounts.interface';
import Database from '../databases';

class AccountService {
  public db = new Database();

  public async findAccounts(params: object = {}): Promise<Account[]> {
    try {
      await this.db.init();
      const accounts: Account[] = await this.db.accountsModel.find(params);
      return accounts;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findAccount(accountId: string): Promise<Account> {
    try {
      await this.db.init();
      const account: Account = await this.db.accountsModel.findById(accountId);
      return account;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findAccountByEmail(email: string): Promise<Account> {
    try {
      await this.db.init();
      const account: Account = await this.db.accountsModel.findOne({ email: email });
      return account;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async findAccountByEmailAndHash(email: string, hash: string): Promise<Account> {
    try {
      await this.db.init();
      const account: Account = await this.db.accountsModel.findOne({ email: email, storeHash: hash });
      return account;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async createAccount(accountData: CreateAccountDto): Promise<Account> {
    try {
      await this.db.init();
      const account: Account = await this.db.accountsModel.create(accountData);
      return account;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async updateAccount(accountId: string, accountData: CreateAccountDto): Promise<Account> {
    try {
      await this.db.init();
      const account: Account = await this.db.accountsModel.findByIdAndUpdate(accountId, accountData);
      return account;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }

  public async deleteAccount(accountId: string): Promise<Account> {
    try {
      await this.db.init();
      const account: Account = await this.db.accountsModel.findByIdAndDelete(accountId);
      return account;
    } catch (error) {
      throw error;
    } finally {
      this.db.close();
    }
  }
}

export default AccountService;
