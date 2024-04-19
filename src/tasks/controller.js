const { Task } = require("../../db/models");
const taskJSONPlaceholderIntegration = require("./integrations/jsonplaceholder");

exports.createTask = async (req, res) => {
  const task = await Task.create({
    name: req.body.name,
    description: req.body.description,
    userId: req.user.id,
  });

  return res.status(201).json({
    task: task.toJSON(),
  });
};

exports.listTasks = async (req, res) => {
  const tasks = await Task.findAll({
    where: {
      userId: req.user.id,
    },
  });

  res.status(200).json({
    tasks: tasks.map((task) => task.toJSON()),
  });
};

exports.getTask = (req, res) => {
  return res.status(200).json({
    task: req.task.toJSON(),
  });
};

exports.updateTask = async (req, res) => {
  await Task.update(
    {
      name: req.body.name,
      description: req.body.description,
    },
    {
      where: {
        id: req.task.id,
      },
    },
  );

  const task = await Task.findByPk(req.task.id);

  return res.status(200).json({
    task: task.toJSON(),
  });
};

exports.deleteTask = async (req, res) => {
  await Task.destroy({
    where: {
      id: req.task.id,
    },
  });

  return res.status(204).end();
};

exports.importTasks = async (req, res) => {
  const todos = await taskJSONPlaceholderIntegration.listTodos();
  const tasks = [];

  for (const todo of todos) {
    const task = await Task.create({
      name: todo.title,
      userId: req.user.id,
    });

    tasks.push(task);
  }

  return res.status(201).json({
    tasks: tasks.map((task) => task.toJSON()),
  });
};
