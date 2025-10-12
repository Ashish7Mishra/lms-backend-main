import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../../modules/user/services/user.service";

interface JwtPayload {
  id: string;
  role: string;
}

// Helper function to extract and verify token
const extractAndVerifyToken = async (authHeader?: string) => {
  if (!authHeader?.startsWith("Bearer")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
     const user = await UserService.findUserById(decoded.id);
    
     if (user && !user.isActive) {
      return null;
    }
    
    return user;
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return null;
  }
};

// Optional authentication - doesn't fail if no token
export const injectUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.user = await extractAndVerifyToken(req.headers.authorization);
  next();
};

// Required authentication - fails if no valid token
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await extractAndVerifyToken(req.headers.authorization);

  if (!user) {
    res.status(401).json({ 
      message: req.headers.authorization 
        ? "Not authorized, token failed" 
        : "Not authorized, no token" 
    });
    return;
  }

  req.user = user;
  next();
};

// Check if user is an instructor
export const isInstructor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === "Instructor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Instructor only." });
  }
};

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};