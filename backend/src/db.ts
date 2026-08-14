import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// One connection pool and one Prisma client for the whole application.
// Every file that needs the database imports `prisma` from here,
// so we never open more connections than necessary.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
