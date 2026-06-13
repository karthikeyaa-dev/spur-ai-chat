export const CONFIG = {
  // JWT Config
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "fuck-you-nvidea",
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || "HS256",
  ACCESS_TOKEN_EXPIRE_IN_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_IN_MINUTES || "15"),
  JWT_TYP: process.env.JWT_TYP || "jwt",
  JWT_KID: process.env.JWT_KID || "auth-key-v1",
  REFRESH_TOKEN_EXPIRE_IN_MINUTES: parseInt(process.env.REFRESH_TOKEN_EXPIRE_IN_MINUTES || "30"),
  
  // HMAC Config
  HMAC_SECRET_KEY: process.env.HMAC_SECRET_KEY || "sorry-nvidea-double-fuck-you",
  HMAC_ALGORITHM: process.env.HMAC_ALGORITHM || "hashlib.sha256",
  
  // Additional configs
  issuer: "SpurAI",
  audience: "Users",
};
