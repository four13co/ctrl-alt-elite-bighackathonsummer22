# The tests here are integration tests

**Benefits of integration tests:**

- tests are simpler, because no mocks are needed (some mocks are needed, like mocks for the mailer.. see below)
- test coverage of production code is bigger because code for database access is also being tested
- changes to test code is minimal when refactoring the production code
- no need to do manual tests using Postman

(More on benefits of integration tests in https://bit.ly/3D18C0F, https://bit.ly/2YG3IaA, and https://bit.ly/3HbXekV)

## The integrations tests use an in-memory database

The integration tests use an in-memory database: src\tests\database\in-memory-db-handler.ts

If you want the tests to connect to a real database, you can use the one in src\tests\database\test-db-handler.ts

## The integrations tests use some mocks

... like in the tests in src\tests\auth.test.ts

It creates mock for the mailer using this code:

```js
jest.mock('@/utils/sendEmail', () => ({
  __esModule: true,
  sendEmail: jest.fn(),
}));
import * as mailer from '@/utils/sendEmail';
```

(There is a library named [`nodemailer-mock`](https://www.npmjs.com/package/nodemailer-mock). You might want to use it later.)
