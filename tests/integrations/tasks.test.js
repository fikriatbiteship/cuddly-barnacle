const { faker } = require("@faker-js/faker");
const app = require("../../src/server");
const { Task } = require("../../db/models");
const taskJSONPlaceholderIntegration = require("../../src/tasks/integrations/jsonplaceholder");
const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");

const { expect } = chai;
chai.use(chaiHttp);

const taskTestHelper = {
  createTask: (opts) => {
    const {
      userId,
      name = `Task ${faker.lorem.word().toUpperCase()}`,
      description = faker.lorem.sentence(),
    } = opts;

    return Task.create({
      name,
      description,
      userId,
    });
  },
  hook: (fn) => {
    beforeEach(() => {
      return Task.truncate({
        cascade: true,
        restartIdentity: true,
      });
    });

    if (typeof fn === "function") fn();

    afterEach(() => {
      return Task.truncate({
        cascade: true,
        restartIdentity: true,
      });
    });
  },
};

describe("GET /v1/tasks", () => {
  taskTestHelper.hook();

  it("should respond with Unauthorized when access token is not sent", async () => {
    const response = await chai.request(app).get("/v1/tasks");

    expect(response.statusCode).to.equal(401);
  });

  it("should respond with OK when access token is valid", async () => {
    const user = await testHelper.createUser();
    const tasks = await Promise.all(
      Array.from(Array(10).keys()).map((number) =>
        taskTestHelper.createTask({
          name: `Task ${number}`,
          userId: user.id,
        }),
      ),
    );

    const accessToken = await testHelper.createAccessToken(user);
    const response = await chai
      .request(app)
      .get("/v1/tasks")
      .set("Authorization", testHelper.bearerToken(accessToken));

    expect(response.statusCode).to.equal(200);
    response.body.tasks.forEach((rTask) => {
      expect(
        tasks.some(
          (oTask) =>
            oTask.id === rTask.id &&
            oTask.name === rTask.name &&
            oTask.description === rTask.description &&
            oTask.userId === rTask.user_id,
        ),
      ).to.be.true;
    });
  });
});

describe("POST /v1/tasks", () => {
  taskTestHelper.hook();

  it("should respond with Unauthorized when access token is not sent", async () => {
    const taskName = `Task ${faker.lorem.word().toUpperCase()}`;
    const taskDescription = faker.lorem.sentence();
    const response = await chai
      .request(app)
      .post("/v1/tasks")
      .set("Content-Type", "application/json")
      .send({
        name: taskName,
        description: taskDescription,
      });

    expect(response.statusCode).to.equal(401);
  });

  it("should respond with OK when access token is valid", async () => {
    const user = await testHelper.createUser();
    const accessToken = await testHelper.createAccessToken(user);
    const taskName = `Task ${faker.lorem.word().toUpperCase()}`;
    const taskDescription = faker.lorem.sentence();

    const response = await chai
      .request(app)
      .post("/v1/tasks")
      .set("Authorization", testHelper.bearerToken(accessToken))
      .set("Content-Type", "application/json")
      .send({
        name: taskName,
        description: taskDescription,
      });

    expect(response.statusCode).to.equal(201);
    expect(response.body.task.name).to.equal(taskName);
    expect(response.body.task.description).to.equal(taskDescription);
    expect(response.body.task.user_id).to.equal(user.id);

    const task = await Task.findByPk(response.body.task.id);
    expect(task.id).to.equal(response.body.task.id);
    expect(task.name).to.equal(taskName);
    expect(task.description).to.equal(taskDescription);
    expect(task.userId).to.equal(user.id);
  });
});

describe("PUT /v1/tasks/:id", () => {
  taskTestHelper.hook();

  it("should respond with Unauthorized when access token is not sent", async () => {
    const user = await testHelper.createUser();
    const task = await taskTestHelper.createTask({ userId: user.id });

    const response = await chai
      .request(app)
      .put("/v1/tasks/" + task.id)
      .set("Content-Type", "application/json")
      .send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
      });

    expect(response.statusCode).to.equal(401);
  });

  it("should respond with Forbidden when task is not owned by user", async () => {
    const oUser = await testHelper.createUser();
    const accessToken = await testHelper.accessToken();
    const task = await taskTestHelper.createTask({ userId: oUser.id });
    const taskName = `Task ${faker.lorem.word().toUpperCase()}`;
    const taskDescription = faker.lorem.sentence();

    const response = await chai
      .request(app)
      .put("/v1/tasks/" + task.id)
      .set("Authorization", testHelper.bearerToken(accessToken))
      .set("Content-Type", "application/json")
      .send({
        name: taskName,
        description: taskDescription,
      });

    expect(response.statusCode).to.equal(403);
    expect(response.body.error.name).to.equal("Forbidden");
    expect(response.body.error.message).to.equal(
      "You're not allowed to read or write this task.",
    );
  });

  it("should respond with OK when access token is valid", async () => {
    const user = await testHelper.createUser();
    const accessToken = await testHelper.createAccessToken(user);
    const task = await taskTestHelper.createTask({ userId: user.id });

    const taskName = `Task ${faker.lorem.word().toUpperCase()}`;
    const taskDescription = faker.lorem.sentence();

    const response = await chai
      .request(app)
      .put("/v1/tasks/" + task.id)
      .set("Authorization", testHelper.bearerToken(accessToken))
      .set("Content-Type", "application/json")
      .send({
        name: taskName,
        description: taskDescription,
      });

    await task.reload();

    expect(response.statusCode).to.equal(200);
    expect(response.body.task.id).to.equal(task.id);
    expect(response.body.task.name).to.equal(taskName);
    expect(response.body.task.description).to.equal(taskDescription);
    expect(response.body.task.user_id).to.equal(user.id);
    expect(task.id).to.equal(response.body.task.id);
    expect(task.name).to.equal(taskName);
    expect(task.description).to.equal(taskDescription);
    expect(task.userId).to.equal(user.id);
  });
});

describe("POST /v1/tasks/import", () => {
  taskTestHelper.hook();

  it("should respond with Unauthorized when access token is not sent", async () => {
    const response = await chai
      .request(app)
      .post("/v1/tasks/import")
      .set("Content-Type", "application/json");

    expect(response.statusCode).to.equal(401);
  });

  it("should respond with OK when access token is valid", async () => {
    const fakeTodos = Array.from(Array(10).keys()).map((number) => ({
      userId: 1,
      id: number + 1,
      title: `Task ${number + 1}`,
      completed: false,
    }));

    const fakeTodoNames = fakeTodos.map((fTodo) => fTodo.name);

    const user = await testHelper.createUser();
    const accessToken = await testHelper.createAccessToken(user);
    const iStub = sinon.stub(taskJSONPlaceholderIntegration);
    iStub.listTodos.returns(fakeTodos);

    const response = await chai
      .request(app)
      .post("/v1/tasks/import")
      .set("Authorization", testHelper.bearerToken(accessToken))
      .set("Content-Type", "application/json");

    expect(response.statusCode).to.equal(201);

    const rTasks = response.body.tasks;

    const tasks = await Task.findAll({
      where: { userId: user.id },
    });
    rTasks.forEach((rTask) => {
      expect(fakeTodoNames.includes(rTask.name));
      expect(
        tasks.some(
          (oTask) =>
            oTask.name === rTask.name &&
            oTask.description === rTask.description &&
            oTask.userId === rTask.user_id,
        ),
      ).to.be.true;
    });

    sinon.assert.calledOnce(iStub.listTodos);
  });
});

describe("GET /v1/tasks/:id", () => {
  taskTestHelper.hook();

  it("should respond with Unauthorized when access token is not sent", async () => {
    const user = await testHelper.createUser();
    const task = await taskTestHelper.createTask({ userId: user.id });

    const response = await chai.request(app).get("/v1/tasks/" + task.id);
    expect(response.statusCode).to.equal(401);
  });

  it("should respond with Forbidden when task is not owned by user", async () => {
    const oUser = await testHelper.createUser();
    const accessToken = await testHelper.accessToken();
    const task = await taskTestHelper.createTask({ userId: oUser.id });

    const response = await chai
      .request(app)
      .get("/v1/tasks/" + task.id)
      .set("Authorization", testHelper.bearerToken(accessToken));
    expect(response.statusCode).to.equal(403);
    expect(response.body.error.name).to.equal("Forbidden");
    expect(response.body.error.message).to.equal(
      "You're not allowed to read or write this task.",
    );
  });

  it("should respond with OK when access token is valid", async () => {
    const user = await testHelper.createUser();
    const accessToken = await testHelper.createAccessToken(user);
    const task = await taskTestHelper.createTask({ userId: user.id });

    const response = await chai
      .request(app)
      .get("/v1/tasks/" + task.id)
      .set("Authorization", testHelper.bearerToken(accessToken));

    expect(response.statusCode).to.equal(200);
    expect(response.body.task.id).to.equal(task.id);
    expect(response.body.task.name).to.equal(task.name);
    expect(response.body.task.description).to.equal(task.description);
    expect(response.body.task.user_id).to.equal(user.id);
  });
});

describe("DELETE /v1/tasks/:id", () => {
  taskTestHelper.hook();

  it("should respond with Unauthorized when access token is not sent", async () => {
    const user = await testHelper.createUser();
    const task = await taskTestHelper.createTask({ userId: user.id });

    const response = await chai.request(app).delete("/v1/tasks/" + task.id);
    expect(response.statusCode).to.equal(401);
  });

  it("should respond with Forbidden when task is not owned by user", async () => {
    const oUser = await testHelper.createUser();
    const accessToken = await testHelper.accessToken();
    const task = await taskTestHelper.createTask({ userId: oUser.id });

    const response = await chai
      .request(app)
      .delete("/v1/tasks/" + task.id)
      .set("Authorization", testHelper.bearerToken(accessToken));
    expect(response.statusCode).to.equal(403);
    expect(response.body.error.name).to.equal("Forbidden");
    expect(response.body.error.message).to.equal(
      "You're not allowed to read or write this task.",
    );
  });

  it("should respond with OK when access token is valid", async () => {
    const user = await testHelper.createUser();
    const accessToken = await testHelper.createAccessToken(user);
    const task = await taskTestHelper.createTask({ userId: user.id });

    const response = await chai
      .request(app)
      .delete("/v1/tasks/" + task.id)
      .set("Authorization", testHelper.bearerToken(accessToken));

    expect(response.statusCode).to.equal(204);
    expect(await Task.findByPk(task.id)).to.be.null;
  });
});
