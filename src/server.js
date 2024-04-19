const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const logger = require("morgan")

if (process.env.NODE_ENV !== "test") app.use(logger("tiny"));
app.use(express.json());

const sourceDir = path.join(__dirname);
fs.readdirSync(sourceDir).forEach((moduleDir) => {
  const modRouterPath = path.join(sourceDir, moduleDir, "router.js");
  if (!fs.existsSync(modRouterPath)) return;

  const modRouter = require(modRouterPath);
  app.use(modRouter);
});

module.exports = app;
