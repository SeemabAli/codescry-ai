import jwt, { type SignOptions } from "jsonwebtoken";

export function generateToken(userId: string) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      userId,
    },
    jwtSecret,
    {
      expiresIn: expiresIn as SignOptions["expiresIn"],
    }
  );
}