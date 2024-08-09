const { Sequelize } = require("sequelize");

const model = require("./model");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: {
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  },
);

model(sequelize);

if (process.env.NODE_ENV.trim() === "development") {
  (async () => {
    try {
      await sequelize.sync({ alter: true });
      console.log("Database & tables synchronized!");
    } catch (error) {
      console.error("Error synchronizing the database:", error);
    }
  })();
}
module.exports = sequelize;
