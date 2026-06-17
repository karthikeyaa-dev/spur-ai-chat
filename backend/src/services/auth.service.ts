import { User, UserRole } from "../models/user.model";
import { RefreshToken, RefreshTokenStatus } from "../models/RefreshToken.model";
import { VerificationToken, VerificationTokenType } from "../models/VerificationToken.model";
import OAuthAccount, { OAuthProvider } from "../models/OauthAccount.model";
import { randomUUID, randomBytes, createHash } from "crypto";  // ✅ Keep this one
import { createTokenPair, saveRefreshToken, decodeRefreshToken } from "../auth/jwt";  // ✅ Keep this one
import { sendEmail } from "../utils/email";
import { Op } from "sequelize";

type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
};

export class AuthService {
  static async register(data: RegisterInput) {
    const { email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = await User.create({
      email,
      password, // User model hook will hash this
      role: UserRole.USER,
      is_active: true,
      email_verified_at: null,
    });

    await this.sendVerificationEmail(user.id);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
    };
  }

  static async sendVerificationEmail(userId: string) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (user.email_verified_at) {
      throw new Error("Email already verified");
    }

    // Delete any expired tokens first
    await VerificationToken.destroy({
      where: {
        user_id: userId,
        type: VerificationTokenType.EMAIL_VERIFICATION,
        expires_at: {
          [Op.lt]: new Date(),
        },
      },
    });

    // Check for existing valid token and delete it (create fresh one)
    await VerificationToken.destroy({
      where: {
        user_id: userId,
        type: VerificationTokenType.EMAIL_VERIFICATION,
        used: false,
      },
    });

    // Create new token
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await VerificationToken.create({
      user_id: userId,
      token_hash: tokenHash,
      type: VerificationTokenType.EMAIL_VERIFICATION,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used: false,
    });

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Spur AI Chat",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to Spur AI Chat! 👋</h2>
          <p>Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background: #4f46e5;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              ">
              Verify Email
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationUrl}</p>
          
          <hr style="margin: 20px 0;" />
          
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
          <p style="color: #999; font-size: 12px;">If you didn't create an account with us, please ignore this email.</p>
        </div>
      `,
    });

    return { message: "Verification email sent successfully" };
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string) {
    if (!token) {
      throw new Error("Verification token is required");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const verificationToken = await VerificationToken.findOne({
      where: {
        token_hash: tokenHash,
        type: VerificationTokenType.EMAIL_VERIFICATION,
        used: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!verificationToken) {
      throw new Error("Invalid or expired verification token");
    }

    verificationToken.used = true;
    verificationToken.used_at = new Date();
    await verificationToken.save();

    const user = await User.findByPk(verificationToken.user_id);
    
    if (!user) {
      throw new Error("User not found");
    }

    user.email_verified_at = new Date();
    await user.save();

    return {
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        email_verified_at: user.email_verified_at,
      },
    };
  }

  static async resendVerificationEmail(userId: string) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (user.email_verified_at) {
      throw new Error("Email already verified");
    }

    await this.sendVerificationEmail(userId);

    return { message: "Verification email sent successfully" };
  }

  static async isEmailVerified(userId: string): Promise<boolean> {
    const user = await User.findByPk(userId, {
      attributes: ['email_verified_at'],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.email_verified_at !== null;
  }

  static async login({
    email,
    password,
    ipAddress,
    userAgent,
  }: {
    email: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await user.checkPassword(password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const sessionId = randomUUID();
    const tokens = createTokenPair(user.id, user.email, user.role);

    await saveRefreshToken({
      userId: user.id,
      jti: tokens.refresh.payload.jti,
      expiresAt: new Date(tokens.refresh.payload.exp * 1000),
      deviceId: sessionId,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    return {
      access_token: tokens.access.token,
      refresh_token: tokens.refresh.token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async refresh({
    refreshToken,
    ipAddress,
    userAgent,
  }: {
    refreshToken: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const payload = decodeRefreshToken(refreshToken);
    const userId = payload.sub;

    const tokenRecord = await RefreshToken.findOne({
      where: {
        user_id: userId,
        jti: payload.jti,
        revoked: false,
      },
    });

    if (!tokenRecord) {
      throw new Error("Invalid or expired refresh token");
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new Error("Refresh token expired");
    }

    if (
      tokenRecord.ip_address !== ipAddress ||
      tokenRecord.user_agent !== userAgent
    ) {
      throw new Error("Token used from unrecognized client");
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    tokenRecord.revoked = true;
    await tokenRecord.save();

    const tokens = createTokenPair(user.id, user.email, user.role);

    await saveRefreshToken({
      userId: user.id,
      jti: tokens.refresh.payload.jti,
      expiresAt: new Date(tokens.refresh.payload.exp * 1000),
      deviceId: tokenRecord.device_id,
      ipAddress: ipAddress,
      userAgent: userAgent,
      parentJti: payload.jti,
    });

    return {
      access_token: tokens.access.token,
      refresh_token: tokens.refresh.token,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async getActiveSessions(userId: string) {
    const sessions = await RefreshToken.findAll({
      where: {
        user_id: userId,
        revoked: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
      attributes: [
        'session_id',
        'ip_address',
        'user_agent',
        'created_at',
        'expires_at',
      ],
      order: [['created_at', 'DESC']],
    });

    const uniqueSessions = new Map();
    
    for (const session of sessions) {
      const sessionId = session.session_id;
      if (!uniqueSessions.has(sessionId)) {
        uniqueSessions.set(sessionId, {
          session_id: sessionId,
          ip_address: session.ip_address,
          user_agent: session.user_agent,
          created_at: session.created_at,
          last_activity: session.created_at,
          expires_at: session.expires_at,
        });
      } else {
        const existing = uniqueSessions.get(sessionId);
        if (session.created_at > existing.last_activity) {
          existing.last_activity = session.created_at;
        }
      }
    }

    return Array.from(uniqueSessions.values());
  }

  static async getActiveSessionsByEmail(email: string) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error("User not found");
    }

    return await this.getActiveSessions(user.id);
  }

  static async revokeSession(sessionId: string) {
    const result = await RefreshToken.update(
      {
        revoked: true,
        status: RefreshTokenStatus.REVOKED,
        revoked_at: new Date(),
      },
      {
        where: {
          session_id: sessionId,
          revoked: false,
        },
      }
    );

    if (result[0] === 0) {
      throw new Error("Session not found or already revoked");
    }

    return { 
      success: true, 
      message: "Session revoked successfully" 
    };
  }

  static async revokeAllSessions(userId: string, excludeSessionId?: string) {
    const whereCondition: any = {
      user_id: userId,
      revoked: false,
    };

    if (excludeSessionId) {
      whereCondition.session_id = {
        [Op.ne]: excludeSessionId,
      };
    }

    const result = await RefreshToken.update(
      {
        revoked: true,
        status: RefreshTokenStatus.REVOKED,
        revoked_at: new Date(),
      },
      {
        where: whereCondition,
      }
    );

    return { 
      success: true, 
      message: `${result[0]} session(s) revoked successfully` 
    };
  }

  static async revokeAllSessionsByEmail(email: string, excludeSessionId?: string) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error("User not found");
    }

    return await this.revokeAllSessions(user.id, excludeSessionId);
  }

  static async logout(sessionId: string) {
    const result = await RefreshToken.update(
      {
        revoked: true,
        status: RefreshTokenStatus.REVOKED,
        revoked_at: new Date(),
      },
      {
        where: {
          session_id: sessionId,
          revoked: false,
        },
      }
    );

    if (result[0] === 0) {
      throw new Error("Session not found or already logged out");
    }

    return { 
      success: true, 
      message: "Logged out successfully" 
    };
  }

  static async sendPasswordResetEmail(email: string) {
    const user = await User.findOne({
      where: { email },
    });

    // Security: Always return same message even if user not found
    if (!user) {
      return {
        message: "If an account exists, a reset link has been sent.",
      };
    }

    // Delete any existing unused reset tokens
    await VerificationToken.destroy({
      where: {
        user_id: user.id,
        type: VerificationTokenType.PASSWORD_RESET,
        used: false,
      },
    });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await VerificationToken.create({
      user_id: user.id,
      token_hash: tokenHash,
      type: VerificationTokenType.PASSWORD_RESET,
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Spur AI Chat",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; }
            .button { display: inline-block; padding: 12px 24px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your Spur AI Chat account.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; font-size: 12px; color: #666;">${resetUrl}</p>
              
              <div class="warning">
                <p><strong>⚠️ Important:</strong></p>
                <p>This link will expire in <strong>1 hour</strong>.</p>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
              
              <p>Best regards,<br>The Spur AI Chat Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Spur AI Chat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return {
      message: "If an account exists, a reset link has been sent.",
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!token) {
      throw new Error("Reset token is required");
    }

    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash the token to compare with stored hash
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetToken = await VerificationToken.findOne({
      where: {
        token_hash: tokenHash,
        type: VerificationTokenType.PASSWORD_RESET,
        used: false,
      },
    });

    if (!resetToken) {
      throw new Error("Invalid or expired reset token");
    }

    if (resetToken.expires_at < new Date()) {
      throw new Error("Reset token has expired");
    }

    const user = await User.findByPk(resetToken.user_id);

    if (!user) {
      throw new Error("User not found");
    }

    // Set new password - the hook will hash it
    user.password = newPassword;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    resetToken.used_at = new Date();
    await resetToken.save();

    // Revoke all refresh tokens for this user (security)
    await RefreshToken.update(
      {
        revoked: true,
        revoked_at: new Date(),
      },
      {
        where: {
          user_id: user.id,
          revoked: false,
        },
      }
    );

    return {
      message: "Password reset successful. Please login with your new password.",
    };
  }

  static async validateResetToken(token: string): Promise<{ valid: boolean; message: string }> {
    if (!token) {
      throw new Error("Token is required");
    }

    // Hash the token to compare with stored hash
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetToken = await VerificationToken.findOne({
      where: {
        token_hash: tokenHash,
        type: VerificationTokenType.PASSWORD_RESET,
        used: false,
      },
    });

    if (!resetToken) {
      return {
        valid: false,
        message: "Invalid reset token",
      };
    }

    if (resetToken.expires_at < new Date()) {
      return {
        valid: false,
        message: "Reset token has expired. Please request a new one.",
      };
    }

    return {
      valid: true,
      message: "Token is valid",
    };
  }

  static async handleOAuthCallback(
    provider: OAuthProvider,
    profile: any,
    accessToken: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('No email provided from OAuth provider');
    }

    // Check if OAuth account already exists
    let oauthAccount = await OAuthAccount.findOne({
      where: {
        provider,
        provider_user_id: profile.id,
      },
    });

    let user: User | null = null;

    if (oauthAccount) {
      // OAuth account exists - get the user
      user = await User.findByPk(oauthAccount.user_id);
      if (!user) {
        throw new Error('User not found for OAuth account');
      }

      // Update last used
      await oauthAccount.update({ updated_at: new Date() });
    } else {
      // Check if user exists with this email
      user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user
        user = await User.create({
          email,
          password: randomUUID(), // Random password
          role: UserRole.USER,
          is_active: true,
          email_verified_at: new Date(),
        });
      }

      // Create OAuth account link
      oauthAccount = await OAuthAccount.create({
        user_id: user.id,
        provider,
        provider_user_id: profile.id,
        provider_email: email,
      });
    }

    // Generate JWT tokens
    const sessionId = randomUUID();
    const tokens = createTokenPair(user.id, user.email, user.role);

    await saveRefreshToken({
      userId: user.id,
      jti: tokens.refresh.payload.jti,
      expiresAt: new Date(tokens.refresh.payload.exp * 1000),
      deviceId: sessionId,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      tokens,
      sessionId,
      oauthAccount: {
        provider: oauthAccount.provider,
        provider_email: oauthAccount.provider_email,
      },
    };
  }

  /**
   * Get all OAuth accounts for a user
   */
  static async getOAuthAccounts(userId: string) {
    const accounts = await OAuthAccount.findAll({
      where: { user_id: userId },
      attributes: ['id', 'provider', 'provider_email', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    return accounts;
  }

  /**
   * Disconnect OAuth account
   */
  static async disconnectOAuth(userId: string, provider: string) {
    const oauthAccount = await OAuthAccount.findOne({
      where: {
        user_id: userId,
        provider: provider as OAuthProvider,
      },
    });

    if (!oauthAccount) {
      throw new Error("OAuth account not found");
    }

    // Check if user has password (can login without OAuth)
    const user = await User.findByPk(userId);
    if (!user || !user.password || user.password.length < 8) {
      throw new Error("Cannot disconnect OAuth. Please set a password first.");
    }

    await oauthAccount.destroy();

    return { message: "OAuth account disconnected successfully" };
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role', 'is_active', 'email_verified_at', 'created_at', 'updated_at'],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
