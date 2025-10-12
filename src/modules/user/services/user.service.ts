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
    // Checking if user already exists
    const userExist = await User.findOne({ email: userData.email });
    if (userExist) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await User.create({
      ...userData,
      password: hashedPassword,
      isActive: true, 
    });
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  static async findUserById(id: string): Promise<IUser | null> {
    return User.findById(id).select("-password");
  }

  static async validatePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string, role: string): string {
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
  }

  static async getUserProfile(userId: string): Promise<IUser | null> {
    return User.findById(userId).select("-password");
  }
}