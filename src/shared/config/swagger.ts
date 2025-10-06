import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "LMS Backend API",
    version: "1.0.0",
    description:
      "A comprehensive Learning Management System API built with TypeScript, Express, and MongoDB",
    contact: {
      name: "LMS API Support",
      email: "support@lms.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
    {
      url: "https://lms-backend-main.onrender.com/",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
    },
    schemas: {
      User: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          _id: {
            type: "string",
            description: "User ID",
            example: "60f7b3b3b3b3b3b3b3b3b3b3",
          },
          name: {
            type: "string",
            description: "User's full name",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
            example: "john.doe@example.com",
          },
          role: {
            type: "string",
            enum: ["Student", "Instructor"],
            description: "User's role in the system",
            example: "Student",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "User creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "User last update timestamp",
          },
        },
      },
      Course: {
        type: "object",
        required: ["title", "description", "category"],
        properties: {
          _id: {
            type: "string",
            description: "Course ID",
            example: "60f7b3b3b3b3b3b3b3b3b3b3",
          },
          instructor: {
            type: "object",
            description: "Course instructor details",
            properties: {
              _id: {
                type: "string",
                example: "60f7b3b3b3b3b3b3b3b3b3b3",
              },
              name: {
                type: "string",
                example: "John Doe",
              },
              email: {
                type: "string",
                example: "john.doe@example.com",
              },
            },
          },
          title: {
            type: "string",
            description: "Course title",
            example: "Introduction to Web Development",
          },
          description: {
            type: "string",
            description: "Course description",
            example: "Learn the fundamentals of web development",
          },
          category: {
            type: "string",
            description: "Course category",
            example: "Programming",
          },
          imageUrl: {
            type: "string",
            description: "Course image URL",
            example: "https://example.com/course-image.jpg",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Course creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Course last update timestamp",
          },
        },
      },
      Lesson: {
        type: "object",
        required: ["title", "content", "order", "course"],
        properties: {
          _id: {
            type: "string",
            description: "Lesson ID",
            example: "60f7b3b3b3b3b3b3b3b3b3b3",
          },
          course: {
            type: "string",
            description: "Course ID this lesson belongs to",
            example: "60f7b3b3b3b3b3b3b3b3b3b3",
          },
          title: {
            type: "string",
            description: "Lesson title",
            example: "HTML Basics",
          },
          content: {
            type: "string",
            description: "Lesson content",
            example: "In this lesson, we will learn about HTML basics...",
          },
          order: {
            type: "number",
            description: "Lesson order in the course",
            example: 1,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Lesson creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Lesson last update timestamp",
          },
        },
      },
      Enrollment: {
        type: "object",
        required: ["student", "course"],
        properties: {
          _id: {
            type: "string",
            description: "Enrollment ID",
            example: "60f7b3b3b3b3b3b3b3b3b3b3",
          },
          student: {
            type: "string",
            description: "Student ID",
            example: "60f7b3b3b3b3b3b3b3b3b3b3",
          },
          course: {
            type: "object",
            description: "Course details",
            properties: {
              _id: {
                type: "string",
                example: "60f7b3b3b3b3b3b3b3b3b3b3",
              },
              title: {
                type: "string",
                example: "Introduction to Web Development",
              },
            },
          },
          completedLessons: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of completed lesson IDs",
            example: ["60f7b3b3b3b3b3b3b3b3b3b3", "60f7b3b3b3b3b3b3b3b3b3b4"],
          },
          progress: {
            type: "number",
            description: "Course completion progress percentage",
            example: 75,
          },
          totalLessons: {
            type: "number",
            description: "Total number of lessons in the course",
            example: 10,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Enrollment creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Enrollment last update timestamp",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            description: "Error message",
            example: "Something went wrong",
          },
          data: {
            type: "object",
            description: "Additional error data",
          },
        },
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            description: "Success message",
            example: "Operation completed successfully",
          },
          data: {
            type: "object",
            description: "Response data",
          },
        },
      },
    },
  },
  security: [],
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/modules/*/routes/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
