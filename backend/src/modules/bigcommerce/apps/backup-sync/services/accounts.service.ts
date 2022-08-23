// import { CreateAccountDto } from '../dtos/accounts.dto';
// import { Account } from '../interfaces/accounts.interface';
// import Database from '../databases';

// class AccountService {
//   public db = new Database();

//   public async findAccounts(params: object = {}): Promise<Account[]> {
//     const accounts: Account[] = await this.db.accountsModel.find(params);
//     return accounts;
//   }

//   public async findAccount(accountId: string): Promise<Account> {
//     const account: Account = await this.db.accountsModel.findById(accountId);
//     return account;
//   }

//   public async findAccountByEmail(email: string): Promise<Account> {
//     const account: Account = await this.db.accountsModel.findOne({ email: email });
//     return account;
//   }

//   public async createAccount(accountData: CreateAccountDto): Promise<Account> {
//     const account: Account = await this.db.accountsModel.create(accountData);
//     return account;
//   }

//   public async updateAccount(accountId: string, accountData: CreateAccountDto): Promise<Account> {
//     const account: Account = await this.db.accountsModel.findByIdAndUpdate(accountId, accountData);
//     return account;
//   }

//   public async deleteAccount(accountId: string): Promise<Account> {
//     const account: Account = await this.db.accountsModel.findByIdAndDelete(accountId);
//     return account;
//   }
// }

// export default AccountService;
