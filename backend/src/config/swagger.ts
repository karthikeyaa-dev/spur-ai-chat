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

      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              'Enter your JWT token without the "Bearer " prefix',
          },
        },
      },

      security: [
        {
          bearerAuth: [],
        },
      ],
    },

    // Support both development (.ts) and production Docker build (.js)
    apis: [
      path.join(__dirname, "../routes/*.js"),
      path.join(__dirname, "../../src/routes/*.ts"),
    ],
  };

  const specs = swaggerJsdoc(options);

  const swaggerUiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      operationsSorter: "method",
      tagsSorter: "alpha",
    },

    customCss: `
      .swagger-ui .topbar {
        display: none;
      }
    `,
  };

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerUiOptions)
  );

  console.log("📚 Swagger docs available at /api-docs");
};
