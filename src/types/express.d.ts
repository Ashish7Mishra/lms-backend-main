import { IUser } from "../src/models/userModel"; // Adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}
