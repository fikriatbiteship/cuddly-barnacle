const express = require("express");
const router = express.Router();
const authCtl = require("./controller")
const authMdl = require("./middleware")

router.post("/v1/auth/login", authCtl.login)
router.post("/v1/auth/register", authCtl.register)
router.get("/v1/auth/whoami", authMdl.authorize, authCtl.whoami)

module.exports = router;
