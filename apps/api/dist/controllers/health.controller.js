"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckController = healthCheckController;
const mongoose_1 = __importDefault(require("mongoose"));
const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};
function healthCheckController(req, res) {
    const dbState = mongoose_1.default.connection.readyState;
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
