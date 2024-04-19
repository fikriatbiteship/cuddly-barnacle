const { Task } = require("../../db/models");

exports.authorize = async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);

  if (task.userId !== req.user.id)
    return res.status(403).json({
      error: {
        name: "Forbidden",
        message: "You're not allowed to read or write this task.",
      },
    });

  req.task = task;

  next();
};
