const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const PORT = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.0.0", // 🔥 REQUIRED
    info: {
      title: "HireFlow Backend API",
      version: "1.0.0",
      description: "Backend API documentation for HireFlow",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local development server",
      },
    ],
  },
  apis: ["./src/swagger/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
