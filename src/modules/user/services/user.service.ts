import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class UserService {
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: "Student" | "Instructor";
  }): Promise<IUser> {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return user;
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  static async findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).select("-password");
  }

  static async validatePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string, role: string): string {
    const payload = {
      id: userId,
      role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
  }

  static async getUserProfile(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select("-password");
  }
}
