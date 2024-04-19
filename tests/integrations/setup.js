require("./helper")

const { User } = require("../../db/models")

before(() => {
  return User.truncate({ cascade: true, restartIdentity: true });
})

after(() => {
  return User.truncate({ cascade: true, restartIdentity: true });
})
