import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/user.schema";
import { UserService } from "../services/user.service";
import OAuthAccount, { OAuthProvider } from "../models/OauthAccount.model";
import { User } from "../models/user.model";
import { randomUUID } from "crypto";
import { createTokenPair, saveRefreshToken } from "../auth/jwt";
import passport from 'passport';

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

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
          data: null,
          error: "Missing email",
        });
      }

      const result = await AuthService.sendPasswordResetEmail(email);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
        data: null,
        error: error.message || error,
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token and password are required",
          data: null,
          error: "Missing required fields",
        });
      }

      const result = await AuthService.resetPassword(token, password);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Something went wrong",
        data: null,
        error: error.message || error,
      });
    }
  }

  static async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
          data: null,
          error: "Missing token parameter",
        });
      }

      const result = await AuthService.validateResetToken(token as string);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          valid: result.valid,
        },
        error: null,
      });
    } catch (error: any) {
      console.error("Validate reset token error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
        data: null,
        error: error.message || error,
      });
    }
  }

  static googleAuth(req: Request, res: Response, next: any) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })(req, res, next);
  }

  /**
   * GET /api/auth/google/callback
   * Google OAuth callback - Returns JSON directly
   */
  static googleCallback(req: Request, res: Response, next: any) {
    passport.authenticate('google', {
      session: false,
    }, async (err: any, user: any, info: any) => {
      // Handle errors
      if (err) {
        console.error('Google OAuth error:', err);
        return res.status(400).json({
          success: false,
          message: 'Google OAuth authentication failed',
          error: err.message || 'Authentication error',
        });
      }

      if (!user) {
        console.error('No user returned from Google');
        return res.status(400).json({
          success: false,
          message: 'Google OAuth authentication failed',
          error: 'No user data received from Google',
        });
      }

      try {
        // Get the tokens from the user object or info
        const accessToken = user.accessToken || info?.accessToken;
        const refreshToken = user.refreshToken || info?.refreshToken;

        const result = await AuthService.handleOAuthCallback(
          OAuthProvider.GOOGLE,
          user,
          accessToken,
          refreshToken,
          req.ip || '',
          req.headers['user-agent'] || ''
        );

        // Return JSON directly - NO REDIRECT
        return res.status(200).json({
          success: true,
          message: "Google OAuth login successful",
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              role: result.user.role,
            },
            tokens: {
              access_token: result.tokens.access.token,
              refresh_token: result.tokens.refresh.token,
              session_id: result.sessionId,
              token_type: "bearer",
            },
            oauth: {
              provider: result.oauthAccount.provider,
              provider_email: result.oauthAccount.provider_email,
            },
          },
        });
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        return res.status(500).json({
          success: false,
          message: 'OAuth authentication failed',
          error: error.message || 'Internal server error',
        });
      }
    })(req, res, next);
  }

  /**
   * GET /api/auth/github
   * Redirect to GitHub OAuth
   */
  static githubAuth(req: Request, res: Response, next: any) {
    passport.authenticate('github', {
      scope: ['user:email'],
      session: false,
    })(req, res, next);
  }

  /**
   * GET /api/auth/github/callback
   * GitHub OAuth callback - Returns JSON directly
   */
  static githubCallback(req: Request, res: Response, next: any) {
    passport.authenticate('github', {
      session: false,
    }, async (err: any, user: any, info: any) => {
      // Handle errors
      if (err) {
        console.error('GitHub OAuth error:', err);
        return res.status(400).json({
          success: false,
          message: 'GitHub OAuth authentication failed',
          error: err.message || 'Authentication error',
        });
      }

      if (!user) {
        console.error('No user returned from GitHub');
        return res.status(400).json({
          success: false,
          message: 'GitHub OAuth authentication failed',
          error: 'No user data received from GitHub',
        });
      }

      try {
        // Get the tokens from the user object
        const accessToken = user.accessToken || info?.accessToken;
        const refreshToken = user.refreshToken || info?.refreshToken;

        const result = await AuthService.handleOAuthCallback(
          OAuthProvider.GITHUB,
          user,
          accessToken,
          refreshToken,
          req.ip || '',
          req.headers['user-agent'] || ''
        );

        // Return JSON directly - NO REDIRECT
        return res.status(200).json({
          success: true,
          message: "GitHub OAuth login successful",
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              role: result.user.role,
            },
            tokens: {
              access_token: result.tokens.access.token,
              refresh_token: result.tokens.refresh.token,
              session_id: result.sessionId,
              token_type: "bearer",
            },
            oauth: {
              provider: result.oauthAccount.provider,
              provider_email: result.oauthAccount.provider_email,
            },
          },
        });
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        return res.status(500).json({
          success: false,
          message: 'OAuth authentication failed',
          error: error.message || 'Internal server error',
        });
      }
    })(req, res, next);
  }

  /**
   * GET /api/auth/oauth/accounts
   * Get all OAuth accounts for current user
   */
  static async getOAuthAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
          error: "User not authenticated",
        });
      }

      const accounts = await AuthService.getOAuthAccounts(userId);

      return res.status(200).json({
        success: true,
        message: "OAuth accounts retrieved successfully",
        data: accounts,
        error: null,
      });
    } catch (error: any) {
      console.error('Get OAuth accounts error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get OAuth accounts",
        data: null,
        error: error.message || error,
      });
    }
  }

  /**
   * DELETE /api/auth/oauth/:provider
   * Disconnect OAuth account
   */
  static async disconnectOAuth(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const provider = req.params.provider as string;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          data: null,
          error: "User not authenticated",
        });
      }

      if (!provider) {
        return res.status(400).json({
          success: false,
          message: "Provider is required",
          data: null,
          error: "Missing provider",
        });
      }

      const result = await AuthService.disconnectOAuth(userId, provider);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error('Disconnect OAuth error:', error);
      
      if (error.message === "OAuth account not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
          data: null,
          error: error.message,
        });
      }

      if (error.message === "Cannot disconnect OAuth. Please set a password first.") {
        return res.status(400).json({
          success: false,
          message: error.message,
          data: null,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to disconnect OAuth account",
        data: null,
        error: error.message || error,
      });
    }
  }
}
