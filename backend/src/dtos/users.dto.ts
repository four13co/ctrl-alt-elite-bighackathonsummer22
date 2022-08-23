import { User } from '@/interfaces/users.interface';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  public username: string;
}

export class SignupDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public username: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  public repeatPassword: string;

  @IsNotEmpty()
  public recaptchaToken: string;
}

export class LoginDto {
  @IsString()
  public email: string;

  @IsNotEmpty()
  public password: string;

  @IsOptional()
  public rememberMe = false;

  @IsNotEmpty()
  public recaptchaToken: string;
}

export class ForgotPasswordDto {
  @IsString()
  public email: string;

  @IsNotEmpty()
  public recaptchaToken: string;
}

export class ResetPasswordDto {
  @IsString()
  public userId: string;
  @IsString()
  public token: string;
  @IsString()
  public password: string;
  @IsNotEmpty()
  public recaptchaToken: string;
}

export class UserDto {
  public _id: string; // TODO: should ID be exposed? or should we just use username
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;

  public static createFrom(userModel: User): UserDto {
    return <UserDto>{
      _id: userModel._id,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      username: userModel.username,
      email: userModel.email,
    };
  }
}
