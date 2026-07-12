import { Request, Response, NextFunction } from "express";
import { verifyTokenFn, JwtPayload } from "../lib/jwt";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: JwtPayload;
  dbUser?: any;
  body: any;
  query: any;
  params: any;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyTokenFn(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ error: "Access denied. Insufficient permissions." });
        return;
      }

      req.dbUser = user;
      next();
    } catch (err) {
      res.status(500).json({ error: "Failed to verify user role." });
    }
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyTokenFn(token);
    req.user = decoded;
  } catch {
    // Token invalid but optional, continue without user
  }
  next();
}
