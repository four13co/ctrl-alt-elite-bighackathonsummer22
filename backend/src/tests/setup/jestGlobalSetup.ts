// Jest's globalSetup: https://stackoverflow.com/a/48930690/1451757
module.exports = async function () {
  process.env.JWT_TOKEN_SECRET = 'test_jwt_secret';
  process.env.CLIENT_BASE_URL = 'http://dummy_host:1234/';
  process.env.CLIENT_RESET_PASSWORD_PATH = '/auth/reset-password';
};
