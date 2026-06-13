import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

export const setupSwagger = (app: Application) => {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Spur AI Chat API",
        version: "1.0.0",
        description: "API documentation for Spur AI Chat application",
        contact: {
          name: "API Support",
          email: "support@spuraichat.com",
        },
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: "Development server",
        },
      ],
    },
    apis: [path.join(__dirname, "../routes/*.ts")],
  };

  const specs = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  console.log("Swagger docs available at /api-docs");
};
