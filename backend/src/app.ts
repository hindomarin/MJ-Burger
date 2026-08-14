import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

// Here we build the Express application: which middleware it uses
// and which routes it has. Starting the server happens in index.ts.
const app = express();

// The frontend runs on a different port during development,
// so the browser needs permission to call this API.
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

// Read JSON request bodies.
app.use(express.json());

// All our endpoints start with /api.
app.use("/api", routes);

// Any other /api address does not exist.
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Must be last: catches every error from the routes above.
app.use(errorHandler);

export default app;
