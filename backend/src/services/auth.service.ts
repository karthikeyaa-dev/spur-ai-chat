import { User, UserRole } from "../models/user.model";
import { randomUUID } from "crypto";
import { createTokenPair, saveRefreshToken } from "../auth/jwt";

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

    const user = User.build({
      email,
      password,
      role: UserRole.USER,
    });

    await user.setPassword(password); // Added await here

    await user.save();

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    };
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

    // Changed from validatePassword to checkPassword
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
      ipAddress,
      userAgent,
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
}
