import request from 'supertest';
import App from '@/app';
import IndexRoute from '@routes/index.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Index', () => {
  describe('[GET] /', () => {
    it('response statusCode 200', async () => {
      // TODO: verify if authentication is needed to access this route and all the other routes in src\routes\index.route.ts

      const indexRoute = new IndexRoute();
      const app = new App([indexRoute]);

      const res = await request(app.getServer()).get(`${indexRoute.path}`);
      expect(res.statusCode).toEqual(200);
    });
  });
});
