import request from 'supertest';
import App from '@/app';
import { CreateUserDto, LoginDto, SignupDto } from '@dtos/users.dto';
import UsersRoute from '@routes/users.route';
import * as dbHandler from './database/in-memory-db-handler';
import AuthRoute from '@/routes/auth.route';

const authRoute = new AuthRoute();
const usersRoute = new UsersRoute();
const app = new App([authRoute, usersRoute]);

let jwtToken = undefined;

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

jest.mock('@/utils/validateHuman', () => ({
  __esModule: true,
  validateHuman: jest.fn(),
}));
import { validateHuman } from '@/utils/validateHuman';

beforeAll(async () => {
  await dbHandler.connect();
});

beforeEach(async () => {
  (validateHuman as jest.Mock).mockReturnValueOnce(true);
  await signup(oneDoeSignUpData);

  (validateHuman as jest.Mock).mockReturnValueOnce(true);
  const loginRes = await login(oneDoeLoginData);

  jwtToken = getAccessTokenFromResponse(loginRes);
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error (https://bit.ly/3kreA3F)
});

describe('Testing Users', () => {
  describe('[GET] /users', () => {
    it('returns success status if successful', async () => {
      const res = await request(app.getServer()).get(`${usersRoute.path}`).set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
      expect(res.statusCode).toEqual(200);
    });

    it('returns correct data', async () => {
      await createUser({ firstName: 'Two', lastName: 'Doe', username: 'twodoe', email: 'twodoe@example.com', password: 'twodoe1234' }, jwtToken);
      await createUser(
        { firstName: 'Three', lastName: 'Doe', username: 'threedoe', email: 'threedoe@example.com', password: 'threedoe1234' },
        jwtToken,
      );

      const res = await request(app.getServer()).get(`${usersRoute.path}`).set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: oneDoeLoginData.email }),
          expect.objectContaining({ email: 'twodoe@example.com' }),
          expect.objectContaining({ email: 'threedoe@example.com' }),
        ]),
      );
    });

    it('fails if auth token is invalid', async () => {
      const invalidJwtToken = 'invalid_jwt_token';
      const res = await request(app.getServer()).get(`${usersRoute.path}`).set('Cookie', `Authorization=${invalidJwtToken}; HttpOnly; Max-age=3`);
      expect(res.statusCode).toEqual(401);
    });

    // TODO: create more tests here
  });

  describe('[GET] /users/:id', () => {
    it('returns correct user', async () => {
      const createTwoDoeRes = await createUser(
        { firstName: 'Two', lastName: 'Doe', username: 'twodoe', email: 'twodoe@example.com', password: 'twodoe1234' },
        jwtToken,
      );
      await createUser(
        { firstName: 'Three', lastName: 'Doe', username: 'twodoe', email: 'threedoe@example.com', password: 'threedoe1234' },
        jwtToken,
      );
      const twoDoeUserId = createTwoDoeRes.body.data._id;

      const res = await request(app.getServer())
        .get(`${usersRoute.path}/${twoDoeUserId}`)
        .set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.email).toEqual('twodoe@example.com');
    });
  });

  describe('[POST] /users', () => {
    it('returns created status if successful', async () => {
      const userData: CreateUserDto = {
        firstName: 'New',
        lastName: 'User',
        email: 'new_user@example.com',
        password: 'q1w2e3r4',
        username: 'anotheruser',
      };
      const res = await createUser(userData, jwtToken);
      expect(res.statusCode).toEqual(201);
    });

    it('returns correct data', async () => {
      const userData: CreateUserDto = {
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
        email: 'new_user@example.com',
        password: 'q1w2e3r4',
      };
      const res = await createUser(userData, jwtToken);
      expect(res.body.data.firstName).toEqual(userData.firstName);
      expect(res.body.data.lastName).toEqual(userData.lastName);
      expect(res.body.data.username).toEqual(userData.username);
      expect(res.body.data.email).toEqual(userData.email);
    });

    it('fails if auth token is invalid', async () => {
      const userData: CreateUserDto = {
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
        email: 'new_user@example.com',
        password: 'q1w2e3r4',
      };
      const res = await createUser(userData, 'invalid_auth_token');
      expect(res.statusCode).toEqual(401);
    });

    // TODO: create more tests here
  });

  describe('[PUT] /users/:id', () => {
    it('updates email of user', async () => {
      const createTwoDoeRes = await createUser(
        {
          firstName: 'Two',
          lastName: 'Doe',
          username: 'twodoe',
          email: 'twodoe@example.com',
          password: 'twodoe1234',
        },
        jwtToken,
      );
      const twoDoeUserId = createTwoDoeRes.body.data._id;
      expect(createTwoDoeRes.body.data.email).toEqual('twodoe@example.com');

      const updatedUserData: CreateUserDto = {
        firstName: 'Two',
        lastName: 'Doe',
        username: 'twodoe',
        email: 'new_email@example.com',
        password: 'twodoe1234',
      };
      const res = await request(app.getServer())
        .put(`${usersRoute.path}/${twoDoeUserId}`)
        .send(updatedUserData)
        .set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
      expect(res.body.data.email).toEqual('new_email@example.com'); // verify that the email changed
    });

    it('fails if auth token is invalid', async () => {
      const createTwoDoeRes = await createUser(
        {
          firstName: 'Two',
          lastName: 'Doe',
          username: 'twodoe',
          email: 'twodoe@example.com',
          password: 'twodoe1234',
        },
        jwtToken,
      );
      const twoDoeUserId = createTwoDoeRes.body.data._id;
      expect(createTwoDoeRes.body.data.email).toEqual('twodoe@example.com');

      const updatedUserData: CreateUserDto = {
        firstName: 'Two',
        lastName: 'Doe',
        username: 'twodoe',
        email: 'new_email@example.com',
        password: 'twodoe1234',
      };
      const invalidJwtToken = 'invalid_jwt_token';
      const res = await request(app.getServer())
        .put(`${usersRoute.path}/${twoDoeUserId}`)
        .send(updatedUserData)
        .set('Cookie', `Authorization=${invalidJwtToken}; HttpOnly; Max-age=3`);
      expect(res.statusCode).toEqual(401);
    });

    // TODO: create more tests here
    // TODO: write test for password cannot be changed by another user
  });

  describe('[DELETE] /users/:id', () => {
    it('deletes user', async () => {
      // create new user
      const createTwoDoeRes = await createUser(
        {
          firstName: 'Two',
          lastName: 'Doe',
          username: 'twodoe',
          email: 'twodoe@example.com',
          password: 'twodoe1234',
        },
        jwtToken,
      );
      const twoDoeUserId = createTwoDoeRes.body.data._id;
      expect(createTwoDoeRes.statusCode).toEqual(201);

      // delete user
      const deleteRes = await request(app.getServer())
        .delete(`${usersRoute.path}/${twoDoeUserId}`)
        .set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
      expect(deleteRes.statusCode).toEqual(200);

      // check if user still exists - should return 404 not found
      const getUserRes = await request(app.getServer())
        .get(`${usersRoute.path}/${twoDoeUserId}`)
        .set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
      expect(getUserRes.statusCode).toEqual(404);
    });

    it('fails if auth token is invalid', async () => {
      // create new user
      const createTwoDoeRes = await createUser(
        {
          firstName: 'Two',
          lastName: 'Doe',
          username: 'twodoe',
          email: 'twodoe@example.com',
          password: 'twodoe1234',
        },
        jwtToken,
      );
      const twoDoeUserId = createTwoDoeRes.body.data._id;
      expect(createTwoDoeRes.statusCode).toEqual(201);

      // delete user
      const deleteRes = await request(app.getServer())
        .delete(`${usersRoute.path}/${twoDoeUserId}`)
        .set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
      expect(deleteRes.statusCode).toEqual(200);

      // check if user still exists - should return 404 not found
      const invalidJwtToken = 'invalid_jwt_token';
      const getUserRes = await request(app.getServer())
        .get(`${usersRoute.path}/${twoDoeUserId}`)
        .set('Cookie', `Authorization=${invalidJwtToken}; HttpOnly; Max-age=3`);
      expect(getUserRes.statusCode).toEqual(401);
    });
  });
});

function createUser(userData: CreateUserDto, jwtToken: string) {
  return request(app.getServer()).post(`${usersRoute.path}`).send(userData).set('Cookie', `Authorization=${jwtToken}; HttpOnly; Max-age=3`);
}

function signup(userData: SignupDto) {
  return request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
}

function login(loginData: LoginDto) {
  return request(app.getServer()).post(`${authRoute.path}login`).send(loginData);
}

function getAccessTokenFromResponse(response) {
  return response.body.data.accessToken;
}
