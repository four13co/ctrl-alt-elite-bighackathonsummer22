// import { IsEmail, IsNumber, IsString } from 'class-validator';
// import { Account } from '../interfaces/accounts.interface';

// export class CreateAccountDto {
//   @IsNumber()
//   public accountId: number;

//   @IsString()
//   public name: string;

//   @IsEmail()
//   public email: string;

//   @IsString()
//   public password: string;

//   @IsString()
//   public storeHash: string;
// }

// export class AccountDto {
//   public _id: string; // TODO: should ID be exposed? or should we just use email?
//   public email: string;
//   public accountId: number;

//   public static createFrom(account: Account): AccountDto {
//     return <AccountDto>{
//       _id: account._id.toString(),
//       email: account.email,
//       accountId: account.accountId,
//     };
//   }
// }
