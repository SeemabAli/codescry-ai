"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. No token provided.",
            });
        }
        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is missing in environment variables");
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload.",
            });
        }
        const user = await User_model_1.UserModel.findById(decoded.userId).select("_id name email role");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }
        req.user = {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Invalid or expired token.",
        });
    }
}
