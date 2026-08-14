// Tells TypeScript that our login middleware adds a `user` to the request.
import { Role } from "../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: Role;
      };
    }
  }
}

export {};
