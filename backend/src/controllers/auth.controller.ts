import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/user.schema";
import { UserService } from "../services/user.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      console.log("Register request body:", req.body);
      
      // Validate request body
      const parsed = registerSchema.safeParse(req.body);

      if (!parsed.success) {
        console.log("Validation failed:", parsed.error.format());
        return res.status(400).json({
          message: "Validation error",
          data: null,
          error: parsed.error.format(),
        });
      }

      console.log("Validation passed:", parsed.data);

      const result = await AuthService.register(parsed.data);

      return res.status(201).json({
        message: "User registered successfully",
        data: result,
        error: null,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      return res.status(400).json({
        message: error?.message || "Something went wrong",
        data: null,
        error: error?.message || error,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      console.log("Login request body:", req.body);
      
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        console.log("Validation failed:", parsed.error.format());
        return res.status(400).json({
          message: "Validation error",
          data: null,
          error: parsed.error.format(),
        });
      }

      const result = await AuthService.login({
        email: parsed.data.email,
        password: parsed.data.password,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
      });

      return res.status(200).json({
        message: "Login successful",
        data: result.user,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        error: null,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(401).json({
        message: err.message || "Login failed",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          message: "refresh_token is required",
        });
      }

      const result = await AuthService.refresh({
        refreshToken: refresh_token,
        ipAddress: req.ip || "",
        userAgent: req.get("user-agent") || "",
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Unauthorized",
      });
    }
  }

  static async getActiveSessions(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
          data: null,
          error: "Missing email",
        });
      }

      // All business logic goes to service layer
      const sessions = await AuthService.getActiveSessionsByEmail(email as string);

      return res.status(200).json({
        message: "Active sessions retrieved successfully",
        data: sessions,
        error: null,
      });
    } catch (err: any) {
      console.error("Get sessions error:", err);
      return res.status(500).json({
        message: err.message || "Failed to get sessions",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async revokeSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          message: "Session ID is required",
          data: null,
          error: "Missing session ID",
        });
      }

      // Ensure sessionId is treated as a string
      const result = await AuthService.revokeSession(sessionId as string);

      return res.status(200).json({
        message: result.message,
        data: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Revoke session error:", err);
      
      if (err.message === "Session not found or already revoked") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }
      
      return res.status(500).json({
        message: err.message || "Failed to revoke session",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async revokeAllSessions(req: Request, res: Response) {
    try {
      const { email, userId } = req.query;
      const excludeSessionId = req.headers["x-session-id"] as string;

      if (!email && !userId) {
        return res.status(400).json({
          message: "Either email or userId is required",
          data: null,
          error: "Missing user identifier",
        });
      }

      let result;
      if (email) {
        result = await AuthService.revokeAllSessionsByEmail(email as string, excludeSessionId);
      } else {
        result = await AuthService.revokeAllSessions(userId as string, excludeSessionId);
      }

      return res.status(200).json({
        message: result.message,
        data: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Revoke all sessions error:", err);
      
      if (err.message === "User not found") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }
      
      return res.status(500).json({
        message: err.message || "Failed to revoke sessions",
        data: null,
        error: err.message || err,
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({
          message: "Session ID is required",
          data: null,
          error: "Missing session ID",
        });
      }

      const result = await AuthService.logout(sessionId as string);

      return res.status(200).json({
        message: result.message,
        data: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Logout error:", err);
      
      if (err.message === "Session not found or already logged out") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }
      
      return res.status(500).json({
        message: err.message || "Failed to logout",
        data: null,
        error: err.message || err,
      });
    }
  }

  /**
   * GET /api/auth/verify-email
   * Verify email with token from email link
   */
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          message: "Verification token is required",
          data: null,
          error: "Missing token parameter",
        });
      }

      const result = await AuthService.verifyEmail(token as string);

      // For browser clicks - redirect to frontend success page
      if (req.headers.accept?.includes('text/html')) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/email-verified?message=${encodeURIComponent(result.message)}`);
      }

      // For API calls - return JSON
      return res.status(200).json({
        message: result.message,
        data: result.user,
        error: null,
      });
    } catch (err: any) {
      console.error("Verify email error:", err);
      
      // Redirect to error page for browser
      if (req.headers.accept?.includes('text/html')) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/verification-failed?error=${encodeURIComponent(err.message)}`);
      }

      return res.status(400).json({
        message: err.message || "Failed to verify email",
        data: null,
        error: err.message || err,
      });
    }
  }

  /**
   * POST /api/auth/verify-email/resend
   * Resend verification email to authenticated user
   */
  static async resendVerificationEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          data: null,
          error: "User not authenticated",
        });
      }

      const result = await AuthService.resendVerificationEmail(userId);

      return res.status(200).json({
        message: result.message,
        data: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Resend verification error:", err);
      
      if (err.message === "Email already verified") {
        return res.status(400).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }

      if (err.message === "User not found") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }

      return res.status(500).json({
        message: err.message || "Failed to resend verification email",
        data: null,
        error: err.message || err,
      });
    }
  }

  /**
   * GET /api/auth/email-verified
   * Check if current user's email is verified
   */
  static async checkEmailVerified(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          data: null,
          error: "User not authenticated",
        });
      }

      const isVerified = await AuthService.isEmailVerified(userId);
      const user = await UserService.getUserProfile(userId);

      return res.status(200).json({
        message: "Email verification status retrieved",
        data: {
          verified: isVerified,
          email: user.email,
          email_verified_at: user.email_verified_at,
        },
        error: null,
      });
    } catch (err: any) {
      console.error("Check email verified error:", err);
      
      if (err.message === "User not found") {
        return res.status(404).json({
          message: err.message,
          data: null,
          error: err.message,
        });
      }

      return res.status(500).json({
        message: err.message || "Failed to check email status",
        data: null,
        error: err.message || err,
      });
    }
  }
}
