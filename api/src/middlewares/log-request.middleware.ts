import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger.ts";

export function logRequest(req: Request, res: Response, next: NextFunction) {
  const id = req.get("x-request-id") || randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  req.log = logger.child({ requestId: id });
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    if (!req.originalUrl.startsWith("/api") && req.originalUrl !== "/info")
      return;

    const duration = Number(process.hrtime.bigint() - start) / 1e6; //1ms = 1000 µs = 1 000 000 ns
    req.log.http("http_request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      service: "oquiz",
      userAgent: req.get("user-agent"),
      userId: req.user?.id,
      requestId: req.requestId,
    });
  });

  next();
}
