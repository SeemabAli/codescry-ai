"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.getCurrentUserController = getCurrentUserController;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = require("../models/User.model");
const generate_token_1 = require("../utils/generate-token");
const auth_validation_1 = require("../validations/auth.validation");
async function registerController(req, res) {
    try {
        const validation = auth_validation_1.registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            });
        }
        const { name, email, password } = validation.data;
        const existingUser = await User_model_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await User_model_1.UserModel.create({
            name,
            email,
            password: hashedPassword,
        });
        const token = (0, generate_token_1.generateToken)(String(user._id));
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to register user",
        });
    }
}
async function loginController(req, res) {
    try {
        const validation = auth_validation_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            });
        }
        const { email, password } = validation.data;
        const user = await User_model_1.UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        const token = (0, generate_token_1.generateToken)(String(user._id));
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to login user",
        });
    }
}
async function getCurrentUserController(req, res) {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
}
