import { Response, NextFunction } from "express";
import { decodeToken, isTokenExpired } from "../utils/hmac";
import { AuthRequest } from "../types/authRequest";

// Optional auth - continues as guest if no valid token
export function authOptional(req: AuthRequest, res: Response, next: NextFunction) {
  console.log('🔐 authOptional called');
  const authHeader = req.headers.authorization;
  console.log('📝 Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('❌ No token found - continuing as guest');
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(" ")[1];
  console.log('🔑 Token received:', token.substring(0, 30) + '...');

  try {
    const payload = decodeToken<{
      sub?: string;
      id?: string;
      email: string;
      role: string;
      exp?: number;
    }>(token);

    console.log('📦 Decoded payload:', payload);

    if (isTokenExpired(token)) {
      console.log('⏰ Token expired - continuing as guest');
      req.user = undefined;
      return next();
    }

    // ✅ FIX: Use 'sub' as primary (JWT standard), fallback to 'id'
    const userId = payload.sub || payload.id;
    
    if (!userId) {
      console.log('❌ No user ID found in token');
      req.user = undefined;
      return next();
    }

    req.user = {
      id: userId,  // ✅ Now this will have the correct value
      email: payload.email,
      role: payload.role || 'user',
    };

    console.log('✅ User authenticated:', req.user);
    next();
  } catch (err) {
    console.log('❌ Token decode error:', err);
    req.user = undefined;
    next();
  }
}

// Required auth - returns 401 if no valid token
export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required",
      data: null,
      error: "Missing token"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = decodeToken<{
      sub?: string;
      id?: string;
      email: string;
      role: string;
      exp?: number;
    }>(token);

    if (isTokenExpired(token)) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        data: null,
        error: "Token has expired"
      });
    }

    // ✅ FIX: Use 'sub' as primary (JWT standard), fallback to 'id'
    const userId = payload.sub || payload.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        data: null,
        error: "Missing user ID in token"
      });
    }

    req.user = {
      id: userId,
      email: payload.email,
      role: payload.role || 'user',
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or tampered token",
      data: null,
      error: "Invalid token"
    });
  }
}
