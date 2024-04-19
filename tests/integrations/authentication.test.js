const { faker } = require("@faker-js/faker");
const app = require("../../src/server");
const { User } = require("../../db/models");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = chai;
chai.use(chaiHttp);

describe("POST /v1/auth/register", () => {
  beforeEach(() => {
    return User.destroy({ where: {} });
  });

  afterEach(() => {
    return User.destroy({ where: {} });
  });

  it("should respond with Unprocessable Entity when email is already taken", async () => {
    // Precondition
    const user = await testHelper.createUser();

    const response = await chai
      .request(app)
      .post("/v1/auth/register")
      .set("Content-Type", "application/json")
      .send({
        email: user.email,
        password: "123456",
      });

    expect(response.statusCode).to.eq(422);
    expect(response.body.error.name).to.eq("EmailAlreadyTaken");
  });

  it("should respond with OK when email is not taken", async () => {
    const response = await chai
      .request(app)
      .post("/v1/auth/register")
      .set("Content-Type", "application/json")
      .send({
        email: "fikri@biteship.com",
        password: "123456",
      });

    expect(response.statusCode).to.eq(201);
    expect(response.body.user?.id).to.not.be.null;
    expect(response.body.user?.email).to.not.be.null;
  });
});

describe("POST /v1/auth/login", () => {
  beforeEach(() => {
    return User.destroy({ where: {} });
  });

  afterEach(() => {
    return User.destroy({ where: {} });
  });

  it("should respond with Unauthorized when password is not valid", async () => {
    // Precondition
    const password = faker.internet.password();
    const user = await testHelper.createUser({ password });

    let iPassword = faker.internet.password();
    while (iPassword === password) iPassword = faker.internet.password();

    const response = await chai
      .request(app)
      .post("/v1/auth/login")
      .set("Content-Type", "application/json")
      .send({
        email: user.email,
        password: iPassword,
      });

    expect(response.statusCode).to.eq(422);
    expect(response.body.error.name).to.eq("IncorrectPassword");
  });

  it("should respond with OK when email and password is correct", async () => {
    // Precondition
    const password = faker.internet.password();
    const user = await testHelper.createUser({ password });
    const response = await chai
      .request(app)
      .post("/v1/auth/login")
      .set("Content-Type", "application/json")
      .send({
        email: user.email,
        password: password,
      });

    expect(response.statusCode).to.eq(201);
    expect(response.body.access_token).to.not.be.null;
  });
});

describe("GET /v1/auth/whoami", () => {
  beforeEach(() => {
    return User.destroy({ where: {} });
  });

  afterEach(() => {
    return User.destroy({ where: {} });
  });

  it("should respond with Unauthorized when access token is not sent", async () => {
    const response = await chai.request(app).get("/v1/auth/whoami").send();

    expect(response.statusCode).to.eq(401);
  });

  it("should respond with Unauthorized when access token is not valid", async () => {
    const accessToken = testHelper.createAccessToken({ id: 0 }, "RAHASIA2");

    const response = await chai
      .request(app)
      .get("/v1/auth/whoami")
      .set("Authorization", "Bearer " + accessToken)
      .send();

    expect(response.statusCode).to.eq(401);
    expect(response.body.error.name).to.eq("Unauthorized");
  });

  it("should respond with Unauthorized when access token is valid but user doesn't exist", async () => {
    const accessToken = testHelper.createAccessToken({ id: 0 });

    const response = await chai
      .request(app)
      .get("/v1/auth/whoami")
      .set("Authorization", "Bearer " + accessToken)
      .send();

    expect(response.statusCode).to.eq(401);
  });

  it("should respond with OK when access token is valid but user exists", async () => {
    // Precondition
    const user = await testHelper.createUser();
    const accessToken = testHelper.createAccessToken(user);

    const response = await chai
      .request(app)
      .get("/v1/auth/whoami")
      .set("Authorization", "Bearer " + accessToken)
      .send();

    expect(response.statusCode).to.eq(200);
    expect(response.body.user.id).to.eq(user.id);
    expect(response.body.user.email).to.eq(user.email);
    expect(response.body.user.created_at).to.eq(user.createdAt.toISOString());
    expect(response.body.user.updated_at).to.eq(user.updatedAt.toISOString());
  });
});
