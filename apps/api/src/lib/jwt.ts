import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "opengpu-dev-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
}

export function verifyTokenFn(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
