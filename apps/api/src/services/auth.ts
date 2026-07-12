import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyTokenFn } from "../lib/jwt";

const SALT_ROUNDS = 12;

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { user, token: accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token: accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    const decoded = verifyTokenFn(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: "If an account exists with this email, a reset link has been sent." };
    }
    // In production, send email with reset link
    return { message: "If an account exists with this email, a reset link has been sent." };
  }

  async resetPassword(token: string, newPassword: string) {
    // In production, verify reset token
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    return { message: "Password has been reset successfully." };
  }

  async createApiKey(userId: string, name: string) {
    const key = `ogpu_${Buffer.from(require("crypto").randomBytes(32)).toString("hex")}`;
    const apiKey = await prisma.apiKey.create({
      data: { userId, name, key },
    });
    return apiKey;
  }

  async validateApiKey(key: string) {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    if (!apiKey || !apiKey.active) {
      return null;
    }
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });
    return apiKey;
  }
}

export default new AuthService();
