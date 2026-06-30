import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

export const setupSwagger = (app: Application) => {
  // Determine the correct server URL
  const serverUrl =
    process.env.API_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

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
          url: serverUrl,
          description:
            process.env.NODE_ENV === "production"
              ? "Production Server"
              : "Development Server",
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

    // Supports both development (.ts) and production (.js)
    apis: [
      path.join(__dirname, "../routes/*.js"),
      path.join(__dirname, "../../src/routes/*.ts"),
    ],
  };

  const specs = swaggerJsdoc(options);

  const swaggerUiOptions = {
    explorer: true,

    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      operationsSorter: "method",
      tagsSorter: "alpha",
      displayRequestDuration: true,
    },

    customSiteTitle: "Spur AI Chat API Docs",

    customCss: `
      .swagger-ui .topbar {
        display: none;
      }

      .swagger-ui .info {
        margin: 30px 0;
      }
    `,
  };

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerUiOptions)
  );

  console.log("📚 Swagger docs available at /api-docs");
  console.log(`🌐 Swagger Server URL: ${serverUrl}`);
};
