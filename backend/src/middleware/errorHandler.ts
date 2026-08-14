import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Our own error type, so a controller can say exactly which
// HTTP status the client should get.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Every error in the application ends up here, so the server
// never crashes and the client always gets readable JSON.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Validation error from zod: tell the user what was wrong with the input.
  if (error instanceof ZodError) {
    return res.status(400).json({ message: error.issues[0].message });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  // express.json() throws this when the request body is not valid JSON.
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "The request was not valid JSON" });
  }

  // Anything we did not expect: log it for ourselves, but do not
  // show technical details to the user.
  console.error("Unexpected error:", error);
  return res.status(500).json({ message: "Something went wrong on the server" });
}
