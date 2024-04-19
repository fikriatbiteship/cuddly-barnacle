const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.encryptPassword = (password) => bcrypt.hashSync(password, 10);

exports.comparePassword = (password, encryptedPassword) =>
  bcrypt.compareSync(password, encryptedPassword);

exports.createAccessToken = (user, secretKey = "RAHASIA") =>
  jwt.sign(this.toUserJSON(user), secretKey);

exports.toUserJSON = (user) => ({
  id: user.id,
  email: user.email,
  created_at: user.createdAt,
  updated_at: user.updatedAt,
});
