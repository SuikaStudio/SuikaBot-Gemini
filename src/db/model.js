const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "History",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: new Date().toISOString(),
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prompt: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachment: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      attachment_mime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  );
};
