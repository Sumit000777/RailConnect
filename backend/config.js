require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "development-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  PORT: process.env.PORT || 3000,
};