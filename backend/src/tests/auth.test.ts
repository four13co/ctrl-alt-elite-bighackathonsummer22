import * as dbHandler from './database/in-memory-db-handler';
import request from 'supertest';
import App from '@/app';
import { SignupDto, ForgotPasswordDto, LoginDto, ResetPasswordDto } from '@dtos/users.dto';
import userModel from '@models/users.model';
import AuthRoute from '@routes/auth.route';
import jwt from 'jsonwebtoken';
import config from 'config';

const authRoute = new AuthRoute();
const app = new App([authRoute]);

const oneDoeSignUpData: SignupDto = {
  firstName: 'One',
  lastName: 'Doe',
  username: 'onedoe',
  email: 'onedoe@example.com',
  password: 'onedoe1234',
  repeatPassword: 'onedoe1234',
  recaptchaToken: 'dummy-recaptcha-token',
};
const oneDoeLoginData: LoginDto = {
  email: oneDoeSignUpData.email,
  password: oneDoeSignUpData.password,
  rememberMe: false,
  recaptchaToken: 'dummy-recaptcha-token',
};

// you can't call jest.mock() inside the test; you must call it at the top level of the module (https://stackoverflow.com/a/60669731/1451757)
jest.mock('@/utils/sendEmail', () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));
import * as mailer from '@/utils/sendEmail';

jest.mock('@/utils/validateHuman', () => ({
  __esModule: true,
  validateHuman: jest.fn(),
}));
import { validateHuman } from '@/utils/validateHuman';

beforeAll(async () => {
  await dbHandler.connect();
  (validateHuman as jest.Mock).mockReturnValue(true);
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error (https://bit.ly/3kreA3F)
});

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    it('returns created status', async () => {
      const res = await signup(oneDoeSignUpData);
      expect(res.statusCode).toEqual(201);
    });

    it('returns correct data', async () => {
      const res = await signup(oneDoeSignUpData);
      expect(res.body.data.firstName).toEqual(oneDoeSignUpData.firstName);
      expect(res.body.data.lastName).toEqual(oneDoeSignUpData.lastName);
      expect(res.body.data.username).toEqual(oneDoeSignUpData.username);
      expect(res.body.data.email).toEqual(oneDoeSignUpData.email);
    });

    it('excludes password from response data', async () => {
      const res = await signup(oneDoeSignUpData);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('returns error if email is not given', async () => {
      const res = await signup(<SignupDto>{ ...oneDoeSignUpData, email: null });
      expect(res.statusCode).toEqual(400);

      const res2 = await signup(<SignupDto>{ ...oneDoeSignUpData, email: '' });
      expect(res2.statusCode).toEqual(400);
    });

    it('returns error if password is not given', async () => {
      const res = await signup(<SignupDto>{ ...oneDoeSignUpData, password: null });
      expect(res.statusCode).toEqual(400);

      const res2 = await signup(<SignupDto>{ ...oneDoeSignUpData, password: '' });
      expect(res2.statusCode).toEqual(400);
    });

    it('returns error if name is not given', async () => {
      const res = await signup(<SignupDto>{ ...oneDoeSignUpData, name: null });
      expect(res.statusCode).toEqual(400);

      const res2 = await signup(<SignupDto>{ ...oneDoeSignUpData, name: '' });
      expect(res2.statusCode).toEqual(400);
    });
  });

  describe('[POST] /login', () => {
    beforeEach(async () => {
      await signup(oneDoeSignUpData);
    });

    it('returns success if login is successful', async () => {
      const res = await login(oneDoeLoginData);
      expect(res.statusCode).toEqual(200);
    });

    it('returns correct data', async () => {
      const res = await login(oneDoeLoginData);
      expect(res.body.data.firstName).toEqual(oneDoeSignUpData.firstName);
      expect(res.body.data.lastName).toEqual(oneDoeSignUpData.lastName);
      expect(res.body.data.username).toEqual(oneDoeSignUpData.username);
      expect(res.body.data.email).toEqual(oneDoeSignUpData.email);
    });

    // it('puts authentication token in cookie', async () => {
    //   const res = await login(oneDoeLoginData);
    //   const expected = [expect.stringMatching(/^Authorization=.+/)];
    //   expect(res.headers['set-cookie']).toEqual(expect.arrayContaining(expected));
    // });

    it('puts authentication token in data', async () => {
      const res = await login(oneDoeLoginData);
      expect(res.body.data.accessToken).toBeTruthy();
    });

    it('excludes password from response data', async () => {
      const res = await login(oneDoeLoginData);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it("returns error if user's email is not found", async () => {
      const res = await login(<LoginDto>{ ...oneDoeLoginData, email: 'non_existent_email@example.com' });
      expect(res.statusCode).toEqual(401);
    });

    it('returns error if password is incorrect', async () => {
      const res = await login(<LoginDto>{ ...oneDoeLoginData, password: 'incorrect_password' });
      expect(res.statusCode).toEqual(401);
    });

    it('jwt token contains correct data', async () => {
      const res = await login(oneDoeLoginData);
      const jwtToken = getAccessTokenFromResponse(res);
      const decodedToken = jwt.decode(jwtToken);
      expect(decodedToken['_id']).toBeTruthy();
      expect(decodedToken['email']).toEqual(oneDoeLoginData.email);
    });

    it('if rememberMe is checked, jwt token expires in 14 days', async () => {
      oneDoeLoginData.rememberMe = true;
      const res = await login(oneDoeLoginData);
      const jwtToken = getAccessTokenFromResponse(res);
      const decodedToken = jwt.decode(jwtToken);
      const issuedAtDate = new Date(decodedToken['iat'] * 1000);
      const tokenExpirationDate = new Date(decodedToken['exp'] * 1000);

      const fourteenDaysFromNowMinusOneMinute = new Date();
      fourteenDaysFromNowMinusOneMinute.setDate(fourteenDaysFromNowMinusOneMinute.getDate() + 14);
      fourteenDaysFromNowMinusOneMinute.setMinutes(fourteenDaysFromNowMinusOneMinute.getMinutes() - 1);

      const fourteenDaysFromNow_PLUS_OneMinute = new Date();
      fourteenDaysFromNow_PLUS_OneMinute.setDate(fourteenDaysFromNow_PLUS_OneMinute.getDate() + 14);
      fourteenDaysFromNow_PLUS_OneMinute.setMinutes(fourteenDaysFromNow_PLUS_OneMinute.getMinutes() + 1);

      expect(tokenExpirationDate.valueOf()).toBeGreaterThan(fourteenDaysFromNowMinusOneMinute.valueOf());
      expect(tokenExpirationDate.valueOf()).toBeLessThan(fourteenDaysFromNow_PLUS_OneMinute.valueOf());
    });

    it('if rememberMe is NOT checked, jwt token expires in 1 hour', async () => {
      oneDoeLoginData.rememberMe = false;
      const res = await login(oneDoeLoginData);
      const jwtToken = getAccessTokenFromResponse(res);
      const decodedToken = jwt.decode(jwtToken);
      const issuedAtDate = new Date(decodedToken['iat'] * 1000);
      const tokenExpirationDate = new Date(decodedToken['exp'] * 1000);

      const oneHourFromNowMinusOneMinute = new Date();
      oneHourFromNowMinusOneMinute.setHours(oneHourFromNowMinusOneMinute.getHours() + 1);
      oneHourFromNowMinusOneMinute.setMinutes(oneHourFromNowMinusOneMinute.getMinutes() - 1);

      const oneHourFromNow_PLUS_OneMinute = new Date();
      oneHourFromNow_PLUS_OneMinute.setHours(oneHourFromNow_PLUS_OneMinute.getHours() + 1);
      oneHourFromNow_PLUS_OneMinute.setMinutes(oneHourFromNow_PLUS_OneMinute.getMinutes() + 1);

      const fourteenDaysFromIssueDate = new Date(issuedAtDate);
      fourteenDaysFromIssueDate.setHours(issuedAtDate.getHours() + 1);
      expect(tokenExpirationDate.valueOf()).toBeGreaterThan(oneHourFromNowMinusOneMinute.valueOf());
      expect(tokenExpirationDate.valueOf()).toBeLessThan(oneHourFromNow_PLUS_OneMinute.valueOf());
    });
  });

  describe('[POST] /logout', () => {
    beforeEach(async () => {
      await signup(oneDoeSignUpData);
    });

    it('successful if auth token is valid', async () => {
      const loginRes = await login(oneDoeLoginData);
      const jwtToken = getAccessTokenFromResponse(loginRes);

      const logoutRes = await logout(jwtToken);
      expect(logoutRes.statusCode).toEqual(200);
    });

    // it('removes the auth token from cookie', async () => {
    //   const loginRes = await login(oneDoeLoginData);
    //   const loginJwtToken = getAuthTokenFromResponse(loginRes);

    //   const logoutRes = await logout(loginJwtToken);
    //   const logoutJwtToken = getAuthTokenFromResponse(logoutRes);
    //   expect(logoutJwtToken).toEqual('');
    // });

    it('returns error if auth token is invalid', async () => {
      const res = await logout('invalid_jwt_token');
      expect(res.statusCode).toEqual(401);
    });

    it('when token is in the Authorization header, successful if auth token is valid', async () => {
      const loginRes = await login(oneDoeLoginData);
      const jwtToken = getAccessTokenFromResponse(loginRes);

      const logoutRes = await logout_withTokenInAuthorizationHeader(jwtToken);
      expect(logoutRes.statusCode).toEqual(200);
    });

    it('when token is in the Authorization header, returns error if auth token is invalid', async () => {
      const res = await logout_withTokenInAuthorizationHeader('invalid_jwt_token');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('[POST] /forgot-password', () => {
    beforeEach(async () => {
      await signup(oneDoeSignUpData);
    });

    it('successful if email is given', async () => {
      const dto: ForgotPasswordDto = { email: oneDoeSignUpData.email, recaptchaToken: 'dummy-recaptcha-token' };
      const res = await forgotPassword(dto);
      expect(res.statusCode).toEqual(200);
    });

    it('fails if email is empty', async () => {
      const dto: ForgotPasswordDto = { email: '', recaptchaToken: 'dummy-recaptcha-token' };
      const res = await forgotPassword(dto);
      expect(res.statusCode).toEqual(400);
    });

    it('creates password reset token for the user', async () => {
      const dto: ForgotPasswordDto = { email: oneDoeSignUpData.email, recaptchaToken: 'dummy-recaptcha-token' };
      await forgotPassword(dto);

      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      expect(user.passwordResetToken).toBeTruthy();
      expect(user.passwordResetToken.length).toEqual(64);
      expect(user.passwordResetExpiry).toBeTruthy();
    });

    it('sends email', async () => {
      const dto: ForgotPasswordDto = { email: oneDoeSignUpData.email, recaptchaToken: 'dummy-recaptcha-token' };
      await forgotPassword(dto);
      expect(mailer.sendEmail).toHaveBeenCalled();
    });

    it('sent email contains link for resetting password', async () => {
      const dto: ForgotPasswordDto = { email: oneDoeSignUpData.email, recaptchaToken: 'dummy-recaptcha-token' };
      await forgotPassword(dto);

      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      expect(mailer.sendEmail).toHaveBeenCalledWith(
        dto.email,
        'Password reset',
        expect.stringContaining(`${process.env.CLIENT_BASE_URL}${process.env.CLIENT_RESET_PASSWORD_PATH}/${user._id}/${user.passwordResetToken}`),
      );
    });

    it('if account for given email is not found, sends email informing user that his account does not exist', async () => {
      const dto: ForgotPasswordDto = { email: 'non_existent_email@example.com', recaptchaToken: 'dummy-recaptcha-token' };
      await forgotPassword(dto);

      expect(mailer.sendEmail).toHaveBeenCalledWith(dto.email, 'Password reset', expect.stringContaining('your account does not exist'));
    });

    // TODO: test the email from is correct
  });

  describe('[POST] /resetPassword', () => {
    beforeEach(async () => {
      await signup(oneDoeSignUpData);

      const forgotPasswordDto: ForgotPasswordDto = { email: oneDoeSignUpData.email, recaptchaToken: 'dummy-recaptcha-token' };
      await forgotPassword(forgotPasswordDto);
    });

    it('successful if token is valid', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = {
        userId: user._id,
        token: user.passwordResetToken,
        password: 'new_password',
        recaptchaToken: 'dummy-recaptcha-token',
      };
      const res = await resetPassword(dto);
      expect(res.statusCode).toEqual(200);
    });

    it('sets the password reset token and expiration date to undefined', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = {
        userId: user._id,
        token: user.passwordResetToken,
        password: 'new_password',
        recaptchaToken: 'dummy-recaptcha-token',
      };
      const res = await resetPassword(dto);
      const userAfterPwReset = await userModel.findOne({ email: oneDoeSignUpData.email });
      expect(userAfterPwReset.passwordResetToken).toBeFalsy();
      expect(userAfterPwReset.passwordResetExpiry).toBeFalsy();
    });

    it('after the password reset, user is able to login using the new password', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = {
        userId: user._id,
        token: user.passwordResetToken,
        password: 'new_password',
        recaptchaToken: 'dummy-recaptcha-token',
      };
      await resetPassword(dto);
      const loginRes = await login(<LoginDto>{ ...oneDoeLoginData, password: 'new_password' });

      expect(loginRes.statusCode).toEqual(200);
    });

    it('fails if token is invalid', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = { userId: user._id, token: 'invalid_token', password: 'new_password', recaptchaToken: 'dummy-recaptcha-token' };
      const res = await resetPassword(dto);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid password reset token');
    });

    it('fails if token is empty', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = { userId: user._id, token: '', password: 'new_password', recaptchaToken: 'dummy-recaptcha-token' };
      const res = await resetPassword(dto);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid password reset data');
    });

    it('fails if token is for another user', async () => {
      const anotherUserCreateDto: SignupDto = {
        firstName: 'Another',
        lastName: 'User',
        username: 'anotheruser',
        email: 'anotheruser@example.com',
        password: 'asdfqwer1234!',
        repeatPassword: 'asdfqwer1234!',
        recaptchaToken: 'dummy-recaptcha-token',
      };

      await signup(anotherUserCreateDto);

      const anotherUserforgotPwDto: ForgotPasswordDto = { email: anotherUserCreateDto.email, recaptchaToken: 'dummy-recaptcha-token' };
      await forgotPassword(anotherUserforgotPwDto);

      const anotherUser = await userModel.findOne({ email: anotherUserCreateDto.email });
      const oneDoe = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = {
        userId: oneDoe._id,
        token: anotherUser.passwordResetToken,
        password: 'new_password',
        recaptchaToken: 'dummy-recaptcha-token',
      };
      const res = await resetPassword(dto);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid password reset token');
    });

    it('fails if new password is empty', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      const dto: ResetPasswordDto = { userId: user._id, token: user.passwordResetToken, password: '', recaptchaToken: 'dummy-recaptcha-token' };
      const res = await resetPassword(dto);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid password reset data');
    });

    it('fails if token has expired', async () => {
      const user = await userModel.findOne({ email: oneDoeSignUpData.email });
      // set expiry date to two hours before the original expiry date, to trigger expired error
      const expiry = new Date(user.passwordResetExpiry);
      user.passwordResetExpiry = new Date(expiry.setHours(expiry.getHours() - 2));
      // user.passwordResetExpiry = new Date(user.passwordResetExpiry.setHours(user.passwordResetExpiry.getHours() - 2));
      // user.markModified('passwordResetExpiry'); // https://stackoverflow.com/a/24619023/1451757
      await user.save();

      const dto: ResetPasswordDto = {
        userId: user._id,
        token: user.passwordResetToken,
        password: 'new_password',
        recaptchaToken: 'dummy-recaptcha-token',
      };
      const res = await resetPassword(dto);
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Password reset token has expired');
    });
  });
});

function signup(userData: SignupDto) {
  return request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
}

function login(loginData: LoginDto) {
  return request(app.getServer()).post(`${authRoute.path}login`).send(loginData);
}

function logout(loginJwtToken: any) {
  return request(app.getServer()).post(`${authRoute.path}logout`).send({}).set('Cookie', `Authorization=${loginJwtToken}; HttpOnly; Max-age=3`);
}

function logout_withTokenInAuthorizationHeader(loginJwtToken: any) {
  return request(app.getServer()).post(`${authRoute.path}logout`).send({}).set('Authorization', `Bearer ${loginJwtToken}`);
}

function forgotPassword(dto: ForgotPasswordDto) {
  return request(app.getServer()).post(`${authRoute.path}forgot-password`).send(dto);
}

function resetPassword(dto: ResetPasswordDto) {
  return request(app.getServer()).post(`${authRoute.path}reset-password`).send(dto);
}

function getAccessTokenFromResponse(response) {
  return response.body.data.accessToken;
}
