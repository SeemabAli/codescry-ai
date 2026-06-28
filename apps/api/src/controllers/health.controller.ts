import type { Request, Response } from "express";
import mongoose from "mongoose";

const dbStatusMap: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function healthCheckController(req: Request, res: Response) {
  const dbState = mongoose.connection.readyState;

  return res.status(200).json({
    success: true,
    message: "CodeScry API is running",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || "unknown",
      readyState: dbState,
    },
  });
}