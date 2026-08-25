"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
function errorMiddleware(error, req, res, next) {
    console.error("API Error:", error);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
