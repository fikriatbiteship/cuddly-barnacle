const { User } = require("../../db/models");
const jwt = require("jsonwebtoken");

exports.authorize = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    const accessToken = bearerToken?.replace("Bearer ", "");

    if (!accessToken)
      return res.status(401).json({
        error: {
          name: "Unauthorized",
          message: "Request is unauthorized!",
        },
      });

    const jwtUser = jwt.verify(accessToken, "RAHASIA");

    if (!jwtUser)
      return res.status(401).json({
        error: {
          name: "Unauthorized",
          message: "Request is unauthorized!",
        },
      });

    const user = await User.findByPk(jwtUser.id);
    if (!user)
      return res.status(401).json({
        error: {
          name: "Unauthorized",
          message: "Request is unauthorized!",
        },
      });

    req.user = user;

    next();
  } catch {
    return res.status(401).json({
      error: {
        name: "Unauthorized",
        message: "Request is unauthorized!",
      },
    });
  }
};
