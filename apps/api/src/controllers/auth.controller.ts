import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { UserModel } from "../models/User.model";
import { generateToken } from "../utils/generate-token";
import { loginSchema, registerSchema } from "../validations/auth.validation";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function registerController(req: Request, res: Response) {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = validation.data;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(String(user._id));

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
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(String(user._id));

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
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login user",
    });
  }
}

export async function getCurrentUserController(
  req: AuthenticatedRequest,
  res: Response
) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}