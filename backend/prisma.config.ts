import "dotenv/config";
import { defineConfig } from "prisma/config";

// Settings for the Prisma command line tool.
// The database address comes from backend/.env (DATABASE_URL).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
