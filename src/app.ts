import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import connectDB from "./shared/config/database";
import { swaggerSpec } from "./shared/config/swagger";

// Import module routes
import userRoutes from "./modules/user/routes/user.routes";
import courseRoutes from "./modules/course/routes/course.routes";
import lessonRoutes from "./modules/lesson/routes/lesson.routes";
import enrollmentRoutes from "./modules/enrollment/routes/enrollment.routes";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "LMS API Documentation",
  })
);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "LMS Backend API is running",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      auth: "/api/auth",
      courses: "/api/courses",
      lessons: "/api/lessons",
      enrollments: "/api/enrollments",
    },
  });
});

// API routes
app.use("/api/auth", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);

export default app;
