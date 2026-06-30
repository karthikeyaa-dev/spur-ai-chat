import { Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { decodeToken, isTokenExpired } from "../utils/hmac";
import { AuthRequest } from "../types/authRequest";


interface TokenPayload {
  sub?: string;
  id?: string;
  email: string;
  role?: string;
}


export function authOptional(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  const authHeader = req.headers.authorization;

  const sessionId =
    req.query.session_id as string | undefined;


  // ======================
  // AUTHENTICATED USER
  // ======================

  if (authHeader?.startsWith("Bearer ")) {

    try {

      const token =
        authHeader.split(" ")[1];


      const payload =
        decodeToken<TokenPayload>(token);


      if (isTokenExpired(token)) {

        return res.status(401).json({
          success: false,
          message: "Token expired"
        });

      }


      const userId =
        payload.sub || payload.id;


      if (!userId) {

        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });

      }


      req.user = {
        id: userId,
        email: payload.email,
        role: payload.role || "user"
      };


      // IMPORTANT:
      // authenticated users don't use redis sessions

      req.sessionId = undefined;


      console.log(
        "USER REQUEST:",
        req.user
      );


      return next();


    } catch(err) {

      console.error(
        "JWT ERROR:",
        err
      );

      return res.status(401).json({
        success:false,
        message:"Invalid token"
      });

    }
  }



  // ======================
  // GUEST USER
  // ======================

  req.user = undefined;


  req.sessionId =
    sessionId || uuidv4();


  console.log(
    "GUEST REQUEST:",
    req.sessionId
  );


  return next();
}

/**
 * Required auth:
 * - Only authenticated users allowed
 */
export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error: "Missing Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = decodeToken<{
      sub?: string;
      id?: string;
      email: string;
      role: string;
    }>(token);

    if (isTokenExpired(token)) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        error: "JWT expired",
      });
    }

    const userId = payload.sub || payload.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
        error: "Missing user ID",
      });
    }

    req.user = {
      id: userId,
      email: payload.email,
      role: payload.role || "user",
    };

    req.sessionId = undefined;

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "Token verification failed",
    });
  }
}
