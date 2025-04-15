//1. Environment & Imports
const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");
const express = require("express");

// 6. Start Server
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
