import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { HttpError } from "./errorHandler";
import { Role } from "../generated/prisma/enums";

// Read the secret once when the server starts. If it is missing we stop
// immediately, instead of creating tokens that nobody can trust.
function readSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing. Add it to backend/.env");
  }
  return secret;
}

const JWT_SECRET = readSecret();

type TokenPayload = {
  id: number;
  username: string;
  role: Role;
};

// Makes the token that the frontend stores after logging in.
export function createToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

// Checks the token. Used on every route that needs a logged in user.
export async function requireLogin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "You are not logged in");
  }

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(header.slice(7), JWT_SECRET) as jwt.JwtPayload;
  } catch {
    throw new HttpError(401, "Your session has expired, please log in again");
  }

  // The token can be older than the database, for example after the seed
  // script ran again and gave every user a new id. So we look the user up
  // instead of trusting the token, and we read the role from the database
  // as well, in case it was changed since the user logged in.
  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user) {
    throw new HttpError(401, "Your account no longer exists, please log in again");
  }

  req.user = { id: user.id, username: user.username, role: user.role };
  next();
}

// Extra check for pages only the owner may open.
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    throw new HttpError(403, "Only an admin can do this");
  }
  next();
}
