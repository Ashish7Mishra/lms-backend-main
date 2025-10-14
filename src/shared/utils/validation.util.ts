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

  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch (error) {
      return false;
    }
  }

  static isValidVideoUrl(url: string): boolean {
    if (!this.isValidUrl(url)) return false;

    const allowedDomains = [
      "youtube.com",
      "youtu.be",
      "vimeo.com",
      "dailymotion.com",
      "wistia.com",
      "cloudinary.com",
    ];

    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

}
