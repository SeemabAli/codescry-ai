import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("API Error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
