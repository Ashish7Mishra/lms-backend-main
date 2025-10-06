import mongoose from "mongoose";

export class ValidationUtil {
  static isValidObjectId(id: string): boolean {
    return mongoose.isValidObjectId(id);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters long",
      };
    }
    return { isValid: true };
  }

  static validateRequiredFields(
    data: any,
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter((field) => !data[field]);
    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}
