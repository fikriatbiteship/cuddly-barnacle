module.exports = {
  development: {
    username: "postgres",
    password: "postgres",
    database: "pit_development",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "pit_test",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: "postgres",
    password: "postgres",
    database: "pit_production",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};
