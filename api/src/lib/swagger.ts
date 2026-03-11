import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OQuiz API",
      version: "1.0.0",
      description: "API REST pour l'application OQuiz",
    },
    servers: [
      { url: "/api", description: "Serveur courant" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            firstname: { type: "string" },
            lastname: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["member", "author", "admin"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Quiz: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            author_id: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Question: {
          type: "object",
          properties: {
            id: { type: "integer" },
            description: { type: "string" },
            quiz_id: { type: "integer" },
            level_id: { type: "integer", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Choice: {
          type: "object",
          properties: {
            id: { type: "integer" },
            description: { type: "string" },
            is_valid: { type: "boolean" },
            question_id: { type: "integer" },
          },
        },
        Level: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
          },
        },
        Tag: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            parent_tag_id: { type: "integer", nullable: true },
            children_tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
          },
        },
        Attempt: {
          type: "object",
          properties: {
            id: { type: "integer" },
            score: { type: "integer" },
            max_score: { type: "integer" },
            user_id: { type: "integer" },
            quiz_id: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [join(__dirname, "../routers/*.router.ts")],
};

export const swaggerSpec = swaggerJsdoc(options);
