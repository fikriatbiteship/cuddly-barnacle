const { User } = require("../../db/models");
const authHelper = require("./helper");

exports.login = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (!user)
    return res.status(422).json({
      error: {
        name: "EmailNotExists",
        message: "Email doesn't exist!",
      },
    });

  if (!authHelper.comparePassword(req.body.password, user.encryptedPassword))
    return res.status(422).json({
      error: {
        name: "IncorrectPassword",
        message: "Password is not correct!",
      },
    });

  const accessToken = authHelper.createAccessToken(user);

  return res.status(201).json({
    access_token: accessToken,
    user: authHelper.toUserJSON(user),
  });
};

exports.register = async (req, res) => {
  const existingUser = await User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (!!existingUser) {
    return res.status(422).json({
      error: {
        name: "EmailAlreadyTaken",
        message: "Email has already been taken!",
      },
    });
  }

  const encryptedPassword = authHelper.encryptPassword(req.body.password);
  const user = await User.create({
    email: req.body.email,
    encryptedPassword,
  });

  return res.status(201).json({
    user: authHelper.toUserJSON(user),
  });
};

exports.whoami = (req, res) => {
  return res.status(200).json({
    user: authHelper.toUserJSON(req.user),
  });
};
