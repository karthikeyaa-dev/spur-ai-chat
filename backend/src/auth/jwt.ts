import { randomUUID } from "crypto";
import { encodeToken, decodeToken } from "../utils/hmac";
import { CONFIG } from "../config/AuthConf";

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: TokenType;
}

export interface JwtTokenSchema {
  token: string;
  payload: JwtPayload;
}

export function createAccessToken({
  userId,
  email,
  role,
  issuer = CONFIG.issuer,
  audience = CONFIG.audience,
  expiresInMinutes = CONFIG.ACCESS_TOKEN_EXPIRE_IN_MINUTES,
}: {
  userId: string;
  email: string;
  role: string;
  issuer?: string;
  audience?: string;
  expiresInMinutes?: number;
}): JwtTokenSchema {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInMinutes * 60;

  const payload: JwtPayload = {
    sub: userId,
    email,
    role,
    jti: randomUUID(),
    iat: now,
    exp,
    iss: issuer,
    aud: audience,
    type: TokenType.ACCESS,
  };

  const token = encodeToken(payload);

  return {
    token,
    payload,
  };
}

export interface RefreshJwtPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: TokenType;
}

export interface RefreshTokenSchema {
  token: string;
  payload: RefreshJwtPayload;
}

export function createRefreshToken({
  userId,
  issuer = CONFIG.issuer,
  audience = CONFIG.audience,
  expiresInMinutes = CONFIG.REFRESH_TOKEN_EXPIRE_IN_MINUTES,
}: {
  userId: string;
  issuer?: string;
  audience?: string;
  expiresInMinutes?: number;
}): RefreshTokenSchema {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInMinutes * 60;

  const payload: RefreshJwtPayload = {
    sub: userId,
    jti: randomUUID(),
    iat: now,
    exp,
    iss: issuer,
    aud: audience,
    type: TokenType.REFRESH,
  };

  const token = encodeToken(payload);

  return {
    token,
    payload,
  };
}

export interface TokenPair {
  access: JwtTokenSchema;
  refresh: RefreshTokenSchema;
}

export function createTokenPair(
  userId: string,
  email: string,
  role: string
): TokenPair {
  const access = createAccessToken({
    userId,
    email,
    role,
  });

  const refresh = createRefreshToken({
    userId,
  });

  return {
    access,
    refresh,
  };
}

// Types for saveRefreshToken
export interface SaveRefreshTokenParams {
  userId: string;
  jti: string;
  expiresAt: Date;
  deviceId: string;
  parentJti?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export type Transaction = any; // Define proper transaction type if needed

// Mock RefreshToken and TokenStatus if the actual model doesn't exist yet
export enum TokenStatus {
  ACTIVE = "active",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

export interface RefreshToken {
  id: string;
  user_id: string;
  jti: string;
  parent_jti: string | null;
  expires_at: Date;
  device_id: string;
  ip_address: string | null;
  user_agent: string | null;
  used_at: Date | null;
  revoked_at: Date | null;
  status: TokenStatus;
  created_at: Date;
  updated_at: Date;
  save?: () => Promise<void>;
}

// Mock RefreshToken model (replace with actual import when available)
const RefreshTokenModel = {
  create: async (data: any, options?: any): Promise<RefreshToken> => {
    return {
      id: randomUUID(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    } as RefreshToken;
  },
  findOne: async (options: any): Promise<RefreshToken | null> => {
    // Mock implementation - replace with actual database query
    return null;
  },
};

export async function saveRefreshToken(
  params: SaveRefreshTokenParams & { transaction?: Transaction }
): Promise<RefreshToken> {
  const {
    userId,
    jti,
    expiresAt,
    deviceId,
    parentJti = null,
    ipAddress = null,
    userAgent = null,
    transaction,
  } = params;

  return await RefreshTokenModel.create(
    {
      user_id: userId,
      jti,
      parent_jti: parentJti,
      expires_at: expiresAt,
      device_id: deviceId,
      ip_address: ipAddress,
      user_agent: userAgent,
      used_at: null,
      revoked_at: null,
      status: TokenStatus.ACTIVE,
    },
    { transaction }
  );
}

export function decodeRefreshToken(token: string): RefreshJwtPayload {
  try {
    const decoded = decodeToken<RefreshJwtPayload>(token);

    // Ensure correct token type
    if (decoded.type !== TokenType.REFRESH) {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (err) {
    throw new Error(
      `Invalid refresh token: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export function validateRefreshToken(
  tokenRecord: RefreshToken | null,
  userId: string,
  jti: string,
  ipAddress: string,
  userAgent: string
): RefreshToken {
  if (!tokenRecord || tokenRecord.user_id !== userId) {
    throw new Error("Invalid or expired refresh token");
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    throw new Error("Refresh token expired");
  }

  if (tokenRecord.status !== TokenStatus.ACTIVE) {
    throw new Error("Invalid or revoked refresh token");
  }

  if (
    tokenRecord.ip_address !== ipAddress ||
    tokenRecord.user_agent !== userAgent
  ) {
    throw new Error("Token used from unrecognized client");
  }

  return tokenRecord;
}

export async function rotateRefreshToken({
  oldJti,
  userId,
  sessionId,
  deviceId,
  ipAddress,
  userAgent,
}: {
  oldJti: string;
  userId: string;
  sessionId: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const now = new Date();

  // 1. Fetch old token
  const oldToken = await RefreshTokenModel.findOne({
    where: {
      jti: oldJti,
      user_id: userId,
    },
  });

  if (
    !oldToken ||
    oldToken.status !== TokenStatus.ACTIVE ||
    new Date(oldToken.expires_at) < now
  ) {
    throw new Error("Invalid or expired refresh token");
  }

  // 2. Mark old token as used/revoked
  oldToken.status = TokenStatus.REVOKED;
  oldToken.revoked_at = now;
  oldToken.used_at = now;

  if (oldToken.save) {
    await oldToken.save();
  }

  // 3. Create new refresh token (JWT/HMAC payload)
  const newRefresh = createRefreshToken({
    userId,
  });

  // 4. Save new token in DB (linking rotation chain)
  await saveRefreshToken({
    userId,
    jti: newRefresh.payload.jti,
    expiresAt: new Date(newRefresh.payload.exp * 1000),
    deviceId: deviceId ?? oldToken.device_id,
    ipAddress: ipAddress ?? oldToken.ip_address,
    userAgent: userAgent ?? oldToken.user_agent,
    parentJti: oldToken.jti,
  });

  return newRefresh;
}

// Types for generateNewTokens
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  access_jti?: string;
  refresh_token: string;
  refresh_jti?: string;
  token_type: string;
}

export async function generateNewTokens({
  user,
  oldToken,
  ipAddress,
  userAgent,
}: {
  user: User;
  oldToken: RefreshToken;
  ipAddress: string;
  userAgent: string;
}): Promise<LoginResponse> {
  // 1. Rotate refresh token
  const newRefresh = await rotateRefreshToken({
    oldJti: oldToken.jti,
    userId: oldToken.user_id,
    sessionId: oldToken.device_id,
    ipAddress,
    userAgent,
  });

  // 2. Create new access token
  const newAccess = createAccessToken({
    userId: String(user.id),
    email: user.email,
    role: user.role,
  });

  // 3. Return login response
  return {
    access_token: newAccess.token,
    access_jti: newAccess.payload.jti,
    refresh_token: newRefresh.token,
    refresh_jti: newRefresh.payload.jti,
    token_type: "bearer",
  };
}

export function recreateRefreshToken(
  refreshToken: RefreshToken
): RefreshTokenSchema {
  const now = Math.floor(Date.now() / 1000);

  // 1. Expiry check
  const expiresAt = Math.floor(
    new Date(refreshToken.expires_at).getTime() / 1000
  );

  if (expiresAt <= now) {
    throw new Error("Refresh token expired");
  }

  // 2. Build payload from DB state
  const payload: RefreshJwtPayload = {
    sub: String(refreshToken.user_id),
    jti: String(refreshToken.jti),
    iat: Math.floor(
      new Date(refreshToken.created_at).getTime() / 1000
    ),
    exp: expiresAt,
    iss: CONFIG.issuer,
    aud: CONFIG.audience,
    type: TokenType.REFRESH,
  };

  // 3. Encode using your HMAC-based token system
  const token = encodeToken(payload);

  return {
    token,
    payload,
  };
}
