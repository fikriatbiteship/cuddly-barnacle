const authHelper = require("../../src/authentication/helper");
const { User } = require("../../db/models");
const { faker } = require("@faker-js/faker");

const testHelper = {};

testHelper.createAccessToken = (user) => authHelper.createAccessToken(user);
testHelper.bearerToken = (accessToken) => `Bearer ${accessToken}`;

testHelper.createUser = (
  opts = { email: faker.internet.email(), password: faker.internet.password() },
) => {
  const {
    email = faker.internet.email(),
    password = faker.internet.password(),
  } = opts;

  return User.create({
    email,
    encryptedPassword: authHelper.encryptPassword(password),
  });
};

testHelper.accessToken = async () => {
  const user = await testHelper.createUser();
  return testHelper.createAccessToken(user);
};

global.testHelper = testHelper;
