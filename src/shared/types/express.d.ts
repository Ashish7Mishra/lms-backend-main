import { IUser } from "../../modules/user/models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}
