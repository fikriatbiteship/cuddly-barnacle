const express = require("express");
const router = express.Router();
const authMdl = require("../authentication/middleware")
const taskMdl = require("./middleware")
const taskCtl = require("./controller")

router.use(authMdl.authorize)
router.post("/v1/tasks/import", taskCtl.importTasks)
router.post("/v1/tasks", taskCtl.createTask)
router.get("/v1/tasks", taskCtl.listTasks)

router.put("/v1/tasks/:id", taskMdl.authorize, taskCtl.updateTask)
router.get("/v1/tasks/:id", taskMdl.authorize, taskCtl.getTask)
router.delete("/v1/tasks/:id", taskMdl.authorize, taskCtl.deleteTask)

module.exports = router;
