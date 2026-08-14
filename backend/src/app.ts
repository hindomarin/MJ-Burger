import express from "express";
import cors from "cors";

// Here we build the Express application: which middleware it uses
// and which routes it has. Starting the server happens in index.ts.
const app = express();

// The frontend runs on a different port during development,
// so the browser needs permission to call this API.
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

// Read JSON request bodies (needed later for creating orders).
app.use(express.json());

// Simple check to see if the API is running.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "MJ Juicy Burger API is running" });
});

// Any other /api address does not exist.
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
