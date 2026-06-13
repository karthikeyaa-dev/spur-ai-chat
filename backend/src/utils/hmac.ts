import { createHmac, timingSafeEqual } from "crypto";
import { CONFIG as AUTH_CONFIG } from "../config/AuthConf";

// More flexible TokenPayload type
export type TokenPayload = Record<string, any>;

// Get HMAC config from AuthConfig with fallback
const getHmacAlgorithm = (): string => {
  const algo = AUTH_CONFIG.HMAC_ALGORITHM;
  // Remove 'hashlib.' prefix if present (for Python compatibility)
  return algo.replace('hashlib.', '');
};

const getHmacSecretKey = (): Buffer => {
  return Buffer.from(AUTH_CONFIG.HMAC_SECRET_KEY, "utf8");
};

function sign(message: Buffer): Buffer {
  return createHmac(
    getHmacAlgorithm(),
    getHmacSecretKey()
  )
    .update(message)
    .digest();
}

function verify(message: Buffer, mac: Buffer): boolean {
  const expected = sign(message);

  return (
    mac.length === expected.length &&
    timingSafeEqual(mac, expected)
  );
}

export function encodeToken<T extends TokenPayload>(
  payload: T
): string {
  const payloadBytes = Buffer.from(
    JSON.stringify(payload),
    "utf8"
  );

  const signature = sign(payloadBytes);

  const payloadPart = payloadBytes.toString("base64url");
  const signaturePart = signature.toString("base64url");

  return `${payloadPart}.${signaturePart}`;
}

export function decodeToken<T extends TokenPayload>(
  token: string
): T {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      throw new Error("Malformed token");
    }

    const [payloadPart, signaturePart] = parts;

    const payloadBytes = Buffer.from(
      payloadPart,
      "base64url"
    );

    const signature = Buffer.from(
      signaturePart,
      "base64url"
    );

    if (!verify(payloadBytes, signature)) {
      throw new Error("Invalid token signature");
    }

    const payload: unknown = JSON.parse(
      payloadBytes.toString("utf8")
    );

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw new Error("Invalid payload");
    }

    const typedPayload = payload as T;

    // Check expiration if exp field exists
    if (
      typedPayload &&
      typeof typedPayload === 'object' &&
      'exp' in typedPayload &&
      typeof typedPayload.exp === "number" &&
      typedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new Error("Token expired");
    }

    return typedPayload;
  } catch (error) {
    throw new Error(
      `Invalid token: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}

// Helper function to check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (decoded && typeof decoded === 'object' && 'exp' in decoded && typeof decoded.exp === 'number') {
      return decoded.exp < Math.floor(Date.now() / 1000);
    }
    return false;
  } catch {
    return true;
  }
}

// Helper function to get token payload without verification (for debugging)
export function peekTokenPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      throw new Error("Malformed token");
    }
    const [payloadPart] = parts;
    const payloadBytes = Buffer.from(payloadPart, "base64url");
    return JSON.parse(payloadBytes.toString("utf8"));
  } catch (error) {
    throw new Error(`Cannot peek token: ${error instanceof Error ? error.message : String(error)}`);
  }
}
