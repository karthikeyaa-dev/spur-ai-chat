import { randomUUID } from "crypto";
import { RefreshToken, RefreshTokenStatus } from "../models/RefreshToken.model";
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
  ipAddress?: string | null;
  userAgent?: string | null;
  parentJti?: string | null;
}

export type Transaction = any;

export async function saveRefreshToken({
  userId,
  jti,
  expiresAt,
  deviceId,
  ipAddress = null,
  userAgent = null,
  parentJti = null,
}: SaveRefreshTokenParams) {
  return await RefreshToken.create({
    user_id: userId,
    jti: jti,
    session_id: deviceId, // Map deviceId to session_id
    parent_jti: parentJti,
    expires_at: expiresAt,
    device_id: deviceId,
    ip_address: ipAddress,
    user_agent: userAgent,
    revoked: false,
    status: RefreshTokenStatus.ACTIVE,
  });
}

export function decodeRefreshToken(token: string): RefreshJwtPayload {
  const decoded = decodeToken<RefreshJwtPayload>(token);

  if (decoded.type !== TokenType.REFRESH) {
    throw new Error("Invalid token type");
  }

  return decoded;
}

export function validateRefreshToken(
  tokenRecord: any,
  userId: string,
  ipAddress: string,
  userAgent: string
) {
  if (!tokenRecord || tokenRecord.user_id !== userId) {
    throw new Error("Invalid or expired refresh token");
  }

  if (tokenRecord.revoked) {
    throw new Error("Refresh token revoked");
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

  return tokenRecord;
}

export async function rotateRefreshToken({
  oldJti,
  userId,
  deviceId,
  ipAddress,
  userAgent,
}: {
  oldJti: string;
  userId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const now = new Date();

  // 1. Find old token
  const oldToken = await RefreshToken.findOne({
    where: {
      jti: oldJti,
      user_id: userId,
      revoked: false,
    },
  });

  if (!oldToken) {
    throw new Error("Invalid or expired refresh token");
  }

  if (new Date(oldToken.expires_at) < now) {
    throw new Error("Refresh token expired");
  }

  // 2. Revoke old token
  oldToken.revoked = true;
  oldToken.status = RefreshTokenStatus.REVOKED;
  oldToken.revoked_at = new Date();
  await oldToken.save();

  // 3. Create new refresh token
  const newRefresh = createRefreshToken({
    userId,
  });

  // 4. Save new token (same session/device)
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
}) {
  // rotate refresh token
  const newRefresh = await rotateRefreshToken({
    oldJti: oldToken.jti,
    userId: oldToken.user_id,
    deviceId: oldToken.device_id,
    ipAddress,
    userAgent,
  });

  // create access token
  const newAccess = createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    access_token: newAccess.token,
    access_jti: newAccess.payload.jti,
    refresh_token: newRefresh.token,
    refresh_jti: newRefresh.payload.jti,
    token_type: "bearer",
  };
}

export function recreateRefreshToken(refreshToken: RefreshToken): RefreshTokenSchema {
  const now = Math.floor(Date.now() / 1000);

  const expiresAt = Math.floor(
    new Date(refreshToken.expires_at).getTime() / 1000
  );

  if (expiresAt <= now) {
    throw new Error("Refresh token expired");
  }

  const payload: RefreshJwtPayload = {
    sub: String(refreshToken.user_id),
    jti: String(refreshToken.jti),
    iat: Math.floor(new Date(refreshToken.created_at).getTime() / 1000),
    exp: expiresAt,
    iss: CONFIG.issuer,
    aud: CONFIG.audience,
    type: TokenType.REFRESH,
  };

  const token = encodeToken(payload);

  return { token, payload };
}
