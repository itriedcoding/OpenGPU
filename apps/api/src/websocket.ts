import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import authService from "./services/auth";

let io: SocketIOServer;

export function initializeWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  const nodeNamespace = io.of("/nodes");
  const clientNamespace = io.of("/clients");

  nodeNamespace.use(async (socket: Socket, next) => {
    try {
      const apiKey = socket.handshake.auth.apiKey || socket.handshake.query.apiKey;
      if (!apiKey || typeof apiKey !== "string") {
        next(new Error("API key required"));
        return;
      }

      const keyData = await authService.validateApiKey(apiKey);
      if (!keyData) {
        next(new Error("Invalid API key"));
        return;
      }

      (socket as any).user = keyData.user;
      (socket as any).nodeId = socket.handshake.query.nodeId;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  nodeNamespace.on("connection", (socket: Socket) => {
    const nodeId = (socket as any).nodeId;
    console.log(`[WS] GPU node connected: ${nodeId}`);

    if (nodeId) {
      socket.join(`node:${nodeId}`);
    }

    socket.on("metrics", (data) => {
      if (nodeId) {
        clientNamespace.to(`watch:${nodeId}`).emit("node:metrics", {
          nodeId,
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on("status", (data) => {
      if (nodeId) {
        clientNamespace.to(`watch:${nodeId}`).emit("node:status", {
          nodeId,
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[WS] GPU node disconnected: ${nodeId}`);
      if (nodeId) {
        clientNamespace.to(`watch:${nodeId}`).emit("node:offline", {
          nodeId,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  clientNamespace.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next();
      return;
    }

    try {
      const { verifyTokenFn } = await import("./lib/jwt");
      const decoded = verifyTokenFn(token);
      (socket as any).user = decoded;
      next();
    } catch {
      next();
    }
  });

  clientNamespace.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`[WS] Client connected: ${user?.userId || "anonymous"}`);

    socket.on("watch:node", (nodeId: string) => {
      socket.join(`watch:${nodeId}`);
    });

    socket.on("unwatch:node", (nodeId: string) => {
      socket.leave(`watch:${nodeId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WS] Client disconnected: ${user?.userId || "anonymous"}`);
    });
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WS] General client connected: ${socket.id}`);

    socket.on("watch:rental", (rentalId: string) => {
      socket.join(`rental:${rentalId}`);
    });

    socket.on("unwatch:rental", (rentalId: string) => {
      socket.leave(`rental:${rentalId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WS] General client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("WebSocket not initialized");
  return io;
}

export function emitToNode(nodeId: string, event: string, data: any) {
  if (io) {
    io.of("/nodes").to(`node:${nodeId}`).emit(event, data);
  }
}

export function emitToRental(rentalId: string, event: string, data: any) {
  if (io) {
    io.emit(`rental:${rentalId}:${event}`, data);
  }
}

export function broadcastMetrics(nodeId: string, metrics: any) {
  if (io) {
    io.of("/clients").to(`watch:${nodeId}`).emit("node:metrics", {
      nodeId,
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }
}
