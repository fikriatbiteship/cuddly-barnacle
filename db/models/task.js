"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    toJSON() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        user_id: this.userId,
        created_at: this.createdAt,
        updated_at: this.updatedAt,
      }
    }
  }
  Task.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks",
    },
  );
  return Task;
};
