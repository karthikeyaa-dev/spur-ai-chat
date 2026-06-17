// middleware/auth.ts
import { Response, NextFunction } from "express";
import { decodeToken, isTokenExpired } from "../utils/hmac"; // adjust path
import { AuthRequest } from "../types/authRequest";

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = decodeToken<{
      id: string;
      email: string;
      role: string;
      exp?: number;
    }>(token);

    if (isTokenExpired(token)) {
      return res.status(401).json({ message: "Token expired" });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or tampered token",
    });
  }
}
