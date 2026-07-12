import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { initializeWebSocket } from "./websocket";
import { apiLimiter } from "./middleware/rateLimit";
import authRoutes from "./routes/auth";
import gpuRoutes from "./routes/gpu";
import rentalRoutes from "./routes/rental";
import providerRoutes from "./routes/provider";
import adminRoutes from "./routes/admin";
import paymentRoutes from "./routes/payments";

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "OpenGPU API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/gpus", gpuRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ERROR]", err.message, err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// Initialize WebSocket
initializeWebSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║         OpenGPU API Server               ║
  ║  REST API:  http://localhost:${PORT}/api   ║
  ║  WebSocket: ws://localhost:${PORT}         ║
  ║  Health:    http://localhost:${PORT}/health ║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
