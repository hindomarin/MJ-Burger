import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { createToken } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { loginSchema } from "../validation/schemas";

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { username, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { username } });

  // bcrypt.compare hashes the typed password and compares the hashes.
  // We never compare the real passwords, because we do not store them.
  const passwordIsCorrect =
    user !== null && (await bcrypt.compare(password, user.passwordHash));

  // Same message for a wrong username and a wrong password,
  // so nobody can find out which usernames exist.
  if (!user || !passwordIsCorrect) {
    throw new HttpError(401, "Wrong username or password");
  }

  const safeUser = { id: user.id, username: user.username, role: user.role };

  res.json({ token: createToken(safeUser), user: safeUser });
}

// GET /api/auth/me - used by the frontend to check if the token is still valid.
export function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
