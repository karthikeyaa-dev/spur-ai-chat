import { Op } from "sequelize";
import { User, UserRole } from "../models/user.model";
import { RefreshToken, RefreshTokenStatus } from "../models/RefreshToken.model";
import { randomUUID } from "crypto";
import { randomBytes, createHash } from "node:crypto";
import { createTokenPair, saveRefreshToken, decodeRefreshToken } from "../auth/jwt";
import { VerificationToken, VerificationTokenType } from "../models/VerificationToken.model";
import { sendEmail } from "../utils/email";

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

}
