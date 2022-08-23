import bcrypt from 'bcrypt';
import config from 'config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { SignupDto, LoginDto, ResetPasswordDto, UserDto, ForgotPasswordDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
import * as mailer from '@/utils/sendEmail';
import { validateHuman } from '@/utils/validateHuman';
import organizationModel from '@/models/organizations.model';
import { Organization } from '@/interfaces/organizations.interface';

class AuthService {
  private users = userModel;
  public orgApps: any = organizationModel;

  public async signup(userData: SignupDto): Promise<UserDto> {
    const isHuman = await validateHuman(userData.recaptchaToken);
    if (!isHuman) throw new HttpException(400, `Recaptcha failed`);

    const isUserDataIncomplete = isEmpty(userData) || isEmpty(userData.email) || isEmpty(userData.password);
    if (isUserDataIncomplete) throw new HttpException(400, 'Incomplete user data');

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(400, `Your email, ${userData.email}, already exists`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createUserData: User = await this.users.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: null,
    });

    const userDto = UserDto.createFrom(createUserData);
    return userDto;
  }

  public async login(loginData: LoginDto): Promise<{ cookie: string; user: UserDto; accessToken: string; organization: any }> {
    const isHuman = await validateHuman(loginData.recaptchaToken);
    if (!isHuman) throw new HttpException(400, `Recaptcha failed`);

    const isLoginDataIncomplete = isEmpty(loginData) || isEmpty(loginData.email) || isEmpty(loginData.password);
    if (isLoginDataIncomplete) throw new HttpException(400, 'Incomplete login data');

    const user: User = await this.users.findOne({ email: loginData.email });
    if (!user) throw new HttpException(401, `Incorrect email or password`);

    const isPasswordCorrect: boolean = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordCorrect) throw new HttpException(401, 'Incorrect email or password');

    const userDto = UserDto.createFrom(user);
    const tokenData = this.createToken(userDto, loginData.rememberMe);
    const cookie = this.createCookie(tokenData);
    // user.tokens.concat(<Token>{ token: tokenData.token });
    // await this.users.findByIdAndUpdate(user._id, { user });
    const orgApps: Organization = await this.orgApps.findOne({ users: user._id });
    return {
      cookie,
      user: userDto,
      accessToken: tokenData.token,
      organization: {
        userId: user._id,
        orgId: orgApps && orgApps._id ? orgApps._id : null,
      },
    };
  }

  public async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const isHuman = await validateHuman(dto.recaptchaToken);
    if (!isHuman) throw new HttpException(400, `Recaptcha failed`);

    if (isEmpty(dto.email)) throw new HttpException(400, 'Invalid email');

    const user = await this.users.findOne({ email: dto.email });
    if (!user) {
      await mailer.sendEmail(dto.email, 'Password reset', 'You attempted to reset your password, but your account does not exist.');
      return;
    }

    user.passwordResetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const emailText = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${process.env.CLIENT_BASE_URL}${process.env.CLIENT_RESET_PASSWORD_PATH}/${user._id}/${user.passwordResetToken}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`;
    await mailer.sendEmail(user.email, 'Password reset', emailText);
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const isHuman = await validateHuman(dto.recaptchaToken);
    if (!isHuman) throw new HttpException(400, `Recaptcha failed`);

    const isDataIncomplete = isEmpty(dto.token) || isEmpty(dto.password);
    if (isDataIncomplete) throw new HttpException(400, 'Invalid password reset data');

    const user = await this.users.findById(dto.userId);
    if (!user) throw new HttpException(400, 'Invalid password reset data');

    const passwordResetTokenIsInvalid = !user.passwordResetToken || user.passwordResetToken !== dto.token;
    if (passwordResetTokenIsInvalid) throw new HttpException(400, 'Invalid password reset token');

    const passwordResetTokenHasExpired = user.passwordResetExpiry && user.passwordResetExpiry < new Date(Date.now());
    if (passwordResetTokenHasExpired) throw new HttpException(400, 'Password reset token has expired');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    await mailer.sendEmail(
      user.email,
      'Your password has been changed',
      `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    );
  }

  private createToken(user: UserDto, rememberMe: boolean): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id, email: user.email };
    const secretKey: string = process.env.JWT_TOKEN_SECRET;
    const expiresIn = rememberMe ? 60 * 60 * 24 * 14 : 60 * 60; //  60 seconds * 60 = 1 hour; 14 days for rememberMe, 1 hour if not

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  private createCookie(tokenData: TokenData): string {
    // TODO: move this to the controller, like in the logout
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
