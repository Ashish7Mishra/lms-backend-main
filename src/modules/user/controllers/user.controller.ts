import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ResponseUtil } from "../../../shared/utils/response.util";

export class UserController {

  static async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        ResponseUtil.validationError(res, "Please fill in all fields");
        return;
      }

      const user = await UserService.createUser({ name, email, password, role });

      ResponseUtil.success(
        res,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        "User registered successfully",
        201
      );
    } catch (error: any) {
      console.error(error);
      if (error.message === "User with this email already exists") {
        ResponseUtil.validationError(res, error.message);
      } else {
        ResponseUtil.error(res, "Server error", 500);
      }
    }
  }

  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        ResponseUtil.validationError(res, "Please provide email and password");
        return;
      }

      const user = await UserService.findUserByEmail(email);
      if (!user) {
        ResponseUtil.unauthorized(res, "Invalid credentials");
        return;
      }
      if (!user.isActive) {
        ResponseUtil.forbidden(res, "Your account has been deactivated. Please contact support.");
        return;
      }

      const isMatch = await UserService.validatePassword(password, user.password);
      if (!isMatch) {
        ResponseUtil.unauthorized(res, "Invalid credentials");
        return;
      }

      const token = UserService.generateToken((user._id as any).toString(), user.role);

      ResponseUtil.success(
        res,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
        "Login successful"
      );
    } catch (error: any) {
      console.error(error);
      ResponseUtil.error(res, "Server error", 500);
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    ResponseUtil.success(res, req.user, "Profile retrieved successfully");
  }

  static async instructorTest(req: Request, res: Response): Promise<void> {
    ResponseUtil.success(
      res,
      { message: "Welcome, Instructor!" },
      "Instructor access confirmed"
    );
  }
}